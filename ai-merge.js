async function predictMonthlySpend(apiKey) {
  const transactions = await fetchTransactions();

  // Assign weights to each week (more weight to recent weeks)
  const weights = [0.4, 0.6, 0.7, 0.9]; // Assuming 4 weeks in a month

  // Calculate weekly spends
  const weeklySpends = [0, 0, 0, 0];
  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const weekNumber = Math.floor((date.getDate() - 1) / 7);
    weeklySpends[weekNumber] += Math.abs(transaction.amount);
  });

  // Calculate weighted average spend
  const weightedSpend = weeklySpends.reduce(
    (acc, spend, index) => acc + spend * weights[index],
    0
  );

  // Calculate the sum of investments and needs
  const investmentsAndNeeds = transactions
    .filter((t) => t.category === "investments" || t.category === "needs")
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  // Predict the monthly spend
  const predictedSpend = weightedSpend + investmentsAndNeeds;

  // Get total income for comparison
  const totalIncome = transactions
    .filter((t) => t.category === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  // Determine comment based on prediction
  let comment = '';
  if (predictedSpend < totalIncome) {
    comment = "Great job! Your predicted expenditure is within your income.";
  } else if (predictedSpend === totalIncome) {
    comment = "Your predicted expenditure matches your income. Keep an eye on your spending.";
  } else {
    comment = "Caution: Your predicted expenditure exceeds your income.";
  }

  document.getElementById("prediction").textContent = `Predicted monthly spend: ₹${predictedSpend.toFixed(2)}`;
  document.getElementById("prediction-comment").textContent = comment;
}



































async function getAIInsights(apiKey) {
  document.getElementById("loading-2").style.display = "block";  // Show AI insights loading
  const transactions = await fetchTransactions();
  const message = `
    Analyze the following transaction data and provide concise yet insightful feedback. 
    Focus on praising positive spending habits (e.g., investments, consistent budgeting) and giving constructive cautions about areas of potential improvement (e.g., overspending in discretionary categories). 
    Organize the insights clearly with structured headings and formatting. 

    Use the following guidelines for your analysis:
    Primary Guideline -> YOU ARE SUPPOSED TO RETURN A NICELY FORMATTED HTML TEXT WHICH USES ALL THE NECESSARY TAGS AND FORMATS THE WHOLE TEXT WELL TO LOOK GOOD. THE TEXT SHOULD NOT BE TOO LONG. THE TEXT SHOULD BE GIVEN IN SUCH A WAY THAT the three backticks html and ending backticks ARE NOT there so that printing is better. ALSO UNDER ALL THE HEADINGS, THERE SHOULD BE CONCISE BULLET POINTS WITH AMOUNTS WHEREVER THEY ARE NEEDED. AND NOT PARAGRAPHS OF TEXT. THE MAIN HEADING SHOULD BE ABOUT INSIGHTS AND BOLD. MAKE SURE THE HTML IS WITHOUT BACKTICKS AND JUST RAW TEXT
    
    1. **Positive Habits:** Highlight strengths in financial behavior, such as savings, investments, or consistent spending on necessities.
    2. **Negative Habits:** Identify areas of overspending and suggest actionable improvements. Avoid listing every individual transaction but summarize them under categories (e.g., Needs, Investments, Discretionary Spending).
    3. **Unique Insights:** Compare discretionary spending (e.g., dining, shopping) against income percentage and provide a balanced perspective (e.g., "Spending on dining was 10% of income, which might require moderation").
    4. **Trend Analysis:** Detect patterns or trends in spending habits, such as seasonal spikes or consistent overspending in a specific category. Highlight if spending aligns with long-term financial goals.
    5. **Advice/Forecasting:** Suggest specific steps to optimize future spending, like "Consider allocating an additional 5% to investments for long-term growth" or "Reduce dining frequency to save ₹5,000 next month."
  
    Transactions: ${JSON.stringify(transactions)};
  `;

  const insights = await classifyMessageWithGemini2(message, apiKey);
  document.getElementById("loading-2").style.display = "none";  // Hide AI insights loading
  displayInsights(insights);
}


async function fetchTransactions() {
  const response = await fetch("http://localhost:5000/transactions");
  return response.json();
}

async function fetchMessages() {
  const response = await fetch("http://localhost:5000/messages");
  return response.json();
}

async function processMessages(apiKey) {
  document.getElementById("loading-1").style.display = "block";  // Show processing loading
  const messages = await fetchMessages();
  const transactions = [];
  const processedResults = [];

  const categoryPatterns = {
    "income": /salary|income|credited/i,
    "investments": /mutual fund|investment|stocks|dividend/i,
    "groceries": /groceries|supermarket|big bazaar/i,
    "utilities": /electricity|water bill|gas bill|utilities/i,
    "needs": /needs|essential/i,
    "transportation": /uber|ola|transportation|fuel/i,
    "entertainment": /movie|cinema|entertainment|netflix|spotify/i,
    "health": /hospital|clinic|health|apollo|medical/i,
    "education": /school fee|college|education|tuition/i,
    "dining": /restaurant|swiggy|zomato|uber eats|food delivery/i,
    "shopping": /amazon|flipkart|shopping|myntra|snapdeal|ebay|shein/i,
    "miscellaneous": /miscellaneous|other|unknown/i
  };

  for (const message of messages) {
    const analysis = analyzeMessage(message.content, categoryPatterns);
    if (analysis) {
      const transaction = {
        text: formatDescription(analysis.description, analysis.category),
        amount: -Math.abs(analysis.amount), // Making it negative since it's likely an expense
        category: analysis.category.toLowerCase(),
        date: new Date(analysis.date || message.date),  // Ensure date is correctly handled
      };

      try {
        const response = await fetch('http://localhost:5000/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transaction),
        });

        if (response.ok) {
          const newTransaction = await response.json();
          transactions.push(newTransaction);
          processedResults.push({
            success: true,
            message: message.content,
            result: transaction
          });
        }
      } catch (error) {
        console.error('Error saving transaction:', error);
        processedResults.push({
          success: false,
          message: message.content,
          error: "Failed to save transaction"
        });
      }
    }
  }

  document.getElementById("loading-1").style.display = "none";  // Hide processing loading
  displayProcessedMessages(processedResults, transactions);
}

function analyzeMessage(content, categoryPatterns) {
  const amountMatch = content.match(/(?:Rs|₹)?\s?([0-9,]+\.?[0-9]*)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;

  let category = "miscellaneous";
  for (const [key, pattern] of Object.entries(categoryPatterns)) {
    if (pattern.test(content)) {
      category = key;
      break;
    }
  }

  const descriptionMatch = content.match(/(?:to|from|at|for|via|by|on)\s([^,\n]+?)(?=\s*(\d|\n|$))/i);
  const description = descriptionMatch ? descriptionMatch[1].trim() : category;

  const dateMatch = content.match(/\b\d{4}-\d{2}-\d{2}\b/); // Ensure date is matched in yyyy-mm-dd format
  const date = dateMatch ? dateMatch[0] : new Date().toISOString().split('T')[0]; // Fallback to today's date if no match

  if (amount && description) {
    return { amount, category, description, date };
  }
  return null;
}

function formatDescription(description, category) {
  return description.split(' ').filter(word => word[0] === word[0].toUpperCase()).join(' ') || category;
}

function formatDate(date) {
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(date).toLocaleDateString('en-GB', options); // "en-GB" will give you the correct date format
}

function displayProcessedMessages(results, transactions) {
  const messageUpdatesList = document.getElementById("message-updates");
  messageUpdatesList.innerHTML = ''; // Clear previous content

  // Add a nice header for the processed messages
  const header = document.createElement('div');
  header.className = 'processed-messages-header';
  header.innerHTML = ``;
  messageUpdatesList.appendChild(header);

  // Create summary section with a more styled layout
  const summary = document.createElement('div');
  summary.className = 'summary-section';
  summary.innerHTML = `
    <div class="summary-header">
      <h4>Processing Summary</h4>
    </div>
    <div class="summary-details">
      <p><strong>Successfully processed:</strong> ${transactions.length} transactions</p>
      <p><strong>Total messages analyzed:</strong> ${results.length}</p>
    </div>
  `;
  messageUpdatesList.appendChild(summary);

  // Create a well-styled transaction table
  if (transactions.length > 0) {
    const table = document.createElement('table');
    table.className = 'transaction-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Amount</th>
          <th>Category</th>
        </tr>
      </thead>
      <tbody>
        ${transactions.map(t => `
          <tr>
            <td>${formatDate(t.date)}</td>
            <td>${t.text}</td>
            <td>₹${Math.abs(t.amount).toFixed(2)}</td>
            <td>${capitalizeFirstLetter(t.category)}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
    messageUpdatesList.appendChild(table);
  }

  // Add a final status message with a nice call-to-action style
  const statusMessage = document.createElement('div');
  statusMessage.className = 'status-message';
  statusMessage.innerHTML = `
    <p class="success-message"> Message processing complete!</p>
    <p>Your expense tracker has been updated with the new transactions.</p>
  `;
  messageUpdatesList.appendChild(statusMessage);
}

function displayInsights(insights) {
  const insightsList = document.getElementById("ai-insights");
  
  // Remove any "html" prefix from the insights
  const cleanedInsights = insights.replace(/^html\s*/i, '');
  
  insightsList.innerHTML = cleanedInsights;
}


function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


















async function classifyMessageWithGemini2(message, apiKey) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  const payload = {
    contents: [
      {
        parts: [{ text: `Please analyze the following transaction data and provide insights in HTML format. Ensure the HTML is well-structured with headings and bullet points as specified:"${message}".Please give the html code in raw plain text format without the formatting with backticks.` }],
      },
    ],
  };
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(`${url}?key=${apiKey}`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const responseData = await response.json();
      const content = responseData["candidates"][0]["content"]["parts"][0]["text"].trim();
      return content; // Return the HTML content directly
    } else {
      console.error("Error:", response.status, response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error calling AI model:", error);
    return null;
  }
}


async function classifyMessageWithGemini(message, apiKey) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  const payload = {
    contents: [
      {
        parts: [{ text: `Please extract the following details from this message: "${message}". Return the information in JSON format with the keys: "amount", "category", "date", and "description". Ensure that the money spent by the user is with a minus sign and the money that user has gotten somehow has a plus sign. Ensure the JSON is valid and properly formatted.Ensure the JSON is given in plain text format. Without any usage of backticks.` }],
      },
    ],
  };
  const headers = {
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(`${url}?key=${apiKey}`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const responseData = await response.json();
      const content = responseData["candidates"][0]["content"]["parts"][0]["text"].trim();
      return JSON.parse(content); // Parse the JSON response
    } else {
      console.error("Error:", response.status, response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error calling AI model:", error);
    return null;
  }
}



async function processMessagesWithAI(apiKey) {
  document.getElementById("loading-3").style.display = "block";  // Show processing loading
  const messages = await fetchMessages();
  const transactions = [];
  const processedResults = [];

  for (const message of messages) {
    const analysis = await classifyMessageWithGemini(message.content, apiKey);
    if (analysis && analysis.amount !== undefined && analysis.category) {
      const transaction = {
        text: analysis.description,
        amount: parseFloat(analysis.amount),
        category: analysis.category.toLowerCase(),
        date: new Date(analysis.date || message.date),  // Ensure date is correctly handled
      };

      try {
        const response = await fetch('http://localhost:5000/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transaction),
        });

        if (response.ok) {
          const newTransaction = await response.json();
          transactions.push(newTransaction);
          processedResults.push({
            success: true,
            message: message.content,
            result: transaction
          });
        }
      } catch (error) {
        console.error('Error saving transaction:', error);
        processedResults.push({
          success: false,
          message: message.content,
          error: "Failed to save transaction"
        });
      }
    } else {
      console.error('Invalid analysis result:', analysis);
      processedResults.push({
        success: false,
        message: message.content,
        error: "Failed to analyze message"
      });
    }
  }

  document.getElementById("loading-3").style.display = "none";  // Hide processing loading
  displayProcessedMessages(processedResults, transactions, "message-updates-2");
}



function displayProcessedMessages(results, transactions, containerId) {
  const messageUpdatesList = document.getElementById(containerId);
  messageUpdatesList.innerHTML = ''; // Clear previous content

  // Add a nice header for the processed messages
  const header = document.createElement('div');
  header.className = 'processed-messages-header';
  header.innerHTML = ``;
  messageUpdatesList.appendChild(header);

  // Create summary section with a more styled layout
  const summary = document.createElement('div');
  summary.className = 'summary-section';
  summary.innerHTML = `
    <div class="summary-header">
      <h4>Processing Summary</h4>
    </div>
    <div class="summary-details">
      <p><strong>Successfully processed:</strong> ${transactions.length} transactions</p>
      <p><strong>Total messages analyzed:</strong> ${results.length}</p>
    </div>
  `;
  messageUpdatesList.appendChild(summary);

  // Create a well-styled transaction table
  if (transactions.length > 0) {
    const table = document.createElement('table');
    table.className = 'transaction-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Amount</th>
          <th>Category</th>
        </tr>
      </thead>
      <tbody>
        ${transactions.map(t => `
          <tr>
            <td>${formatDate(t.date)}</td>
            <td>${t.text}</td>
            <td>₹${Math.abs(t.amount).toFixed(2)}</td>
            <td>${capitalizeFirstLetter(t.category)}</td>
          </tr>
        `).join('')}
      </tbody>
    `;
    messageUpdatesList.appendChild(table);
  }

  // Add a final status message with a nice call-to-action style
  const statusMessage = document.createElement('div');
  statusMessage.className = 'status-message';
  statusMessage.innerHTML = `
    <p class="success-message"> Message processing complete!</p>
    <p>Your expense tracker has been updated with the new transactions.</p>
  `;
  messageUpdatesList.appendChild(statusMessage);
}

// Event Listener for Process Messages 2
document.getElementById('process-messages-2-btn').addEventListener('click', () => {
  const apiKey = "AIzaSyDWbmbufjfjB2j5BMEGt5WMScuFtEyqNtA";
  processMessagesWithAI(apiKey);
});

























// Event Listeners
document.getElementById('process-messages-btn').addEventListener('click', () => {
  const apiKey = "AIzaSyDWbmbufjfjB2j5BMEGt5WMScuFtEyqNtA";
  processMessages(apiKey);

  // Show the message updates container with a smooth transition
  const messageUpdatesContainer = document.getElementById("message-updates");
  messageUpdatesContainer.style.display = "block";
  messageUpdatesContainer.style.opacity = 0;
  setTimeout(() => {
    messageUpdatesContainer.style.transition = "opacity 0.5s ease-in-out";
    messageUpdatesContainer.style.opacity = 1;
  }, 10);
});

document.getElementById("predict-btn").addEventListener('click', () => {
  const apiKey = "AIzaSyDWbmbufjfjB2j5BMEGt5WMScuFtEyqNtA";
  predictMonthlySpend(apiKey);

  // Show the prediction container with a smooth transition
  const predictionContainer = document.getElementById("prediction-container");
  predictionContainer.style.display = "block";
  predictionContainer.style.opacity = 0;
  setTimeout(() => {
    predictionContainer.style.transition = "opacity 0.5s ease-in-out";
    predictionContainer.style.opacity = 1;
  }, 10);
});

document.getElementById("insights-btn").addEventListener('click', () => {
  const apiKey = "AIzaSyDWbmbufjfjB2j5BMEGt5WMScuFtEyqNtA";
  getAIInsights(apiKey);

  // Show the AI insights container with a smooth transition
  const aiInsightsContainer = document.getElementById("ai-insights");
  aiInsightsContainer.style.display = "block";
  aiInsightsContainer.style.opacity = 0;
  setTimeout(() => {
    aiInsightsContainer.style.transition = "opacity 0.5s ease-in-out";
    aiInsightsContainer.style.opacity = 1;
  }, 10);
});

