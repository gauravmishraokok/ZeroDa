require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/expense-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define schemas and models
const transactionSchema = new mongoose.Schema({
  text: String,
  amount: Number,
  category: String,
  date: { type: Date, default: Date.now },
});

const messageSchema = new mongoose.Schema({
  content: String,
  date: Date,
});

const Transaction = mongoose.model('Transaction', transactionSchema);
const Message = mongoose.model('Message', messageSchema);

// Routes
app.get('/transactions', async (req, res) => {
  const transactions = await Transaction.find();
  res.json(transactions);
});

app.post('/transactions', async (req, res) => {
  const newTransaction = new Transaction(req.body);
  await newTransaction.save();
  res.json(newTransaction);
});

app.delete('/transactions/:id', async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.json({ message: 'Transaction deleted' });
});

app.get('/messages', async (req, res) => {
  const messages = await Message.find();
  res.json(messages);
});

// Helper: Call Gemini API for message analysis
async function analyzeMessageWithGemini(message) {
  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  const payload = {
    contents: [
      {
        parts: [
          {
            text: `Please extract the following details from this message: "${message}". Return the information in JSON format with the keys: "amount", "category", "date", and "description". Ensure that the money spent by the user is with a minus sign and the money that user has gotten somehow has a plus sign. Ensure that the category is strictly among Income, Investments, Groceries, Utilities, Needs, Transportation, Entertainment, Health, Education, Dining, Shopping, and Miscellaneous. Ensure that description is as crisp and possible and preferably title case. Ensure the JSON is valid and properly formatted. Ensure the JSON is given in plain text format. Without any usage of backticks.`,
          },
        ],
      },
    ],
  };
  try {
    const response = await axios.post(
      `${url}?key=${process.env.GEMINI_API_KEY}`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates[0] &&
      response.data.candidates[0].content &&
      response.data.candidates[0].content.parts &&
      response.data.candidates[0].content.parts[0]
    ) {
      const text = response.data.candidates[0].content.parts[0].text.trim();
      return JSON.parse(text);
    }
    return null;
  } catch (error) {
    console.error('Gemini API error:', error.response ? error.response.data : error.message);
    return null;
  }
}

// Update /process-messages route
app.post('/process-messages', async (req, res) => {
  try {
    const messages = await Message.find();
    const transactions = [];
    let totalAmount = 0;
    let processedCount = 0;

    for (const message of messages) {
      const analysis = await analyzeMessageWithGemini(message.content);
      if (analysis && analysis.amount !== undefined && analysis.category) {
        const transaction = {
          text: analysis.description,
          amount: parseFloat(analysis.amount),
          category: analysis.category.toLowerCase(),
          date: analysis.date ? new Date(analysis.date) : message.date,
        };
        const newTransaction = new Transaction(transaction);
        await newTransaction.save();
        transactions.push(newTransaction);
        totalAmount += transaction.amount;
        processedCount++;
      }
    }

    // Sort transactions by date in descending order
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      message: 'Processed messages and updated expense tracker.',
      processedCount,
      totalAmount,
      transactions: transactions.map(t => ({
        _id: t._id,
        text: t.text,
        amount: t.amount,
        category: t.category,
        date: t.date
      }))
    });
  } catch (error) {
    console.error('Error processing messages:', error);
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
});

// AI: Monthly Spending Forecast (rule-based)
const prediction = require('./prediction');

app.get('/ai/predict-monthly-spend', async (req, res) => {
  try {
    const predictions = await prediction.predictMonthlySpend();
    
    // Add income comparison
    const transactions = await Transaction.find();
    const totalIncome = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    
    // Generate overall comment
    let comment = '';
    if (predictions.total < totalIncome) {
      comment = 'Your predicted expenditure is within your income.';
    } else if (predictions.total === totalIncome) {
      comment = 'Your predicted expenditure matches your income. Keep an eye on your spending.';
    } else {
      comment = 'Caution: Your predicted expenditure exceeds your income.';
    }
    
    // Add breakdown comments
    const breakdownComments = [];
    Object.entries(predictions.breakdown).forEach(([category, data]) => {
      if (data.predicted > 0) {
        breakdownComments.push(`- ${category}: ₹${data.predicted.toFixed(2)} (${(data.multiplier * 100).toFixed(1)}%)`);
      }
    });
    
    res.json({
      ...predictions,
      comment,
      breakdownComments,
      totalIncome: totalIncome.toFixed(2)
    });
  } catch (error) {
    console.error('Error in predict-monthly-spend:', error);
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
});

// AI: Insights (Gemini-powered)
app.get('/ai/insights', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    const prompt = `
Analyze the following transaction data and provide concise yet insightful feedback. 
Focus on praising positive spending habits (e.g., investments, consistent budgeting) as well as positive life habits like buying books and courses to upskill etc and giving constructive cautions about areas of potential improvement (e.g., overspending in discretionary categories). 
Organize the insights clearly with structured headings and formatting. 

Use the following guidelines for your analysis:
Primary Guideline -> YOU ARE SUPPOSED TO RETURN A NICELY FORMATTED HTML TEXT WHICH USES ALL THE NECESSARY TAGS AND FORMATS THE WHOLE TEXT WELL TO LOOK GOOD. THE TEXT SHOULD NOT BE TOO LONG. THE TEXT SHOULD BE GIVEN IN SUCH A WAY THAT the three backticks html and ending backticks ARE NOT there so that printing is better. ALSO UNDER ALL THE HEADINGS, THERE SHOULD BE CONCISE BULLET POINTS WITH AMOUNTS WHEREVER THEY ARE NEEDED. AND NOT PARAGRAPHS OF TEXT. THE MAIN HEADING SHOULD BE ABOUT INSIGHTS AND BOLD. MAKE SURE THE HTML IS WITHOUT BACKTICKS AND JUST RAW TEXT

1. **Positive Habits:** Highlight strengths in financial behavior, such as savings, investments, or consistent spending on necessities, You can also highlight other positive life habits, But in Short.
2. **Negative Habits:** Identify areas of overspending and suggest actionable improvements. Avoid listing every individual transaction but summarize them under categories (e.g., Needs, Investments, Discretionary Spending, If the amount is less than 2% of income then dont highlight it).
3. **Unique Insights:** Compare discretionary spending (e.g., dining, shopping) against income percentage and provide a balanced perspective (e.g., "Spending on dining was 10% of income, which might require moderation"). You can also highlight the categories which have the most spend compared to income. Do not do for all the categories, But combine and show where spend was high or justified but use better words.
4. **Trend Analysis:** Detect patterns or trends in spending habits, such as seasonal spikes or consistent overspending in a specific category. Highlight if spending aligns with long-term financial goals.
5. **Forecasting:** Suggest specific steps to optimize future spending, like "Consider allocating an additional 5% to investments for long-term growth" or "Reduce dining frequency to save ₹5,000 next month" or "If you allocate X amount every month you can save Y amount and thus do Z".(Here do not make the user save too much too, Suggest less radical changes, If a spend category accounts for less than 2-5% of income unless highly not needed, Dont sugguest a change.)
6. **Advice:** Gives valuable financial advice after noticing all patterns. Few Examples can be "good allocation of budget towards books and courses, Try to diversify while upskilling" or "There has been a lot of spend on dining indicating bad eating habits, Try to reduce it and replace with homecooked food" or "Shopping was high(Have 2 cases saying it might be justifiable during some specific season or festival but not always or second case saying its too high) and suggest the 24 hour wait method before impulsive shopping etc", like this noticed patterns in the spend can be given as personally catered advice there should be a total of 5 advices. 

Transactions: ${JSON.stringify(transactions)};
`;
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    const payload = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    };
    const response = await axios.post(
      `${url}?key=${process.env.GEMINI_API_KEY}`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
    const aiText = response.data.candidates[0].content.parts[0].text.trim();
    res.json({ aiInsights: aiText });
  } catch (error) {
    console.error('Error in ai/insights:', error);
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
