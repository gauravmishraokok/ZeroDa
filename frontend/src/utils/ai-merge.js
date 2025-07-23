// Utility Functions
async function fetchTransactions() {
  const response = await fetch("http://localhost:5000/transactions");
  return response.json();
}

async function fetchMessages() {
  const response = await fetch("http://localhost:5000/messages");
  return response.json();
}

function formatDate(date) {
  const options = { day: "numeric", month: "short", year: "numeric" };
  return new Date(date).toLocaleDateString("en-GB", options);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Functioning for Monthly Spending Forecast | Predict Monthly Spend
async function predictMonthlySpend() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const transactions = await fetchTransactions();

  // ... rest of the function remains the same ...
}

// Functioning for Generate AI Insights
async function getAIInsights() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  document.getElementById("loading-2").style.display = "block";
  const transactions = await fetchTransactions();

  // ... rest of the function remains the same ...
}

// Functioning for Automated AI Accounting
async function processMessagesWithAI() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  document.getElementById("loading-3").style.display = "block";
  const messages = await fetchMessages();

  // ... rest of the function remains the same ...
}

// Event Listener Calls
// Sync Inbox SMS
const processMessagesBtn = document.getElementById("process-messages-2-btn");
if (processMessagesBtn) {
  processMessagesBtn.addEventListener("click", processMessagesWithAI);
}

// Monthly Spending Forecast
const predictBtn = document.getElementById("predict-btn");
if (predictBtn) {
  predictBtn.addEventListener("click", predictMonthlySpend);
}

// Generate AI Insights
const insightsBtn = document.getElementById("insights-btn");
if (insightsBtn) {
  insightsBtn.addEventListener("click", getAIInsights);
}
