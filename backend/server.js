const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

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

// Mock AI model
function gemmaModelAnalyze(content) {
  const match = content.match(/₹(\d+)\s+to\s+([\w\s]+)/i);
  if (!match) return null;

  // Extract details
  const amount = parseInt(match[1], 10);
  const recipient = match[2].trim();

  // Map recipient to a predefined category
  const categories = {
    UberEats: 'Food',
    Amazon: 'Shopping',
    Flipkart: 'Shopping',
    'HDFC Bank': 'Finance',
  };

  const category = categories[recipient] || 'Miscellaneous';

  return { amount, recipient, category };
}

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

// New route: Process messages
app.get('/process-messages', async (req, res) => {
  try {
    const messages = await Message.find(); // Fetch all messages
    const transactions = [];

    for (const message of messages) {
      const analysis = gemmaModelAnalyze(message.content);
      if (!analysis) continue; // Skip messages that don't contain transactions

      const transaction = {
        text: message.content,
        amount: analysis.amount,
        category: analysis.category,
        date: message.date,
      };

      // Save to transactions collection
      const newTransaction = new Transaction(transaction);
      await newTransaction.save();

      transactions.push(newTransaction);
    }

    res.json({
      message: 'Processed messages and updated expense tracker.',
      transactions,
    });
  } catch (error) {
    console.error('Error processing messages:', error);
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
});
app.get('/messages', async (req, res) => {
  const messages = await Message.find();
  res.json(messages);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
