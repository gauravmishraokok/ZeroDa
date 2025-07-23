const mongoose = require('mongoose');

// Helper function to categorize transactions
function categorizeTransactions(transactions) {
  const categorized = {
    recurring: [],
    oneTime: [],
    categories: {}
  };

  transactions.forEach(t => {
    if (t.amount < 0) { // Only expenses
      const category = t.category || 'Miscellaneous';
      if (!categorized.categories[category]) {
        categorized.categories[category] = [];
      }
      categorized.categories[category].push(t);

      // Heuristic for recurring vs one-time expenses
      if (Math.abs(t.amount) >= 10000 && category !== 'Shopping') {
        categorized.recurring.push(t);
      } else {
        categorized.oneTime.push(t);
      }
    }
  });

  return categorized;
}

// Helper function to calculate prediction for each category
function calculateCategoryPrediction(category, transactions) {
  const totalSpent = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const avgPerTransaction = totalSpent / transactions.length || 0;

  // Apply different multipliers based on category type
  let multiplier = 1.0;
  switch(category.toLowerCase()) {
    case 'rent':
    case 'utilities':
      multiplier = 1.0; // Fixed expenses
      break;
    case 'groceries':
    case 'transportation':
      multiplier = 1.1; // Slight buffer for necessities
      break;
    case 'entertainment':
    case 'shopping':
      multiplier = 1.2; // More buffer for discretionary
      break;
    case 'medical':
      multiplier = 1.3; // Extra buffer for unexpected medical expenses
      break;
    default:
      multiplier = 1.15; // Default buffer
  }

  return {
    currentMonth: totalSpent,
    predicted: avgPerTransaction * multiplier,
    multiplier: multiplier
  };
}

// Main prediction function
async function predictMonthlySpend() {
  try {
    const transactions = await mongoose.model('Transaction').find();
    console.log('Total transactions found:', transactions.length);

    // Filter for only expense transactions
    const expenseTransactions = transactions.filter(t => t.amount < 0);
    console.log('Expense transactions found:', expenseTransactions.length);
    
    if (!expenseTransactions.length) {
      return {
        total: 0,
        breakdown: {},
        comments: ['No expense transactions found for prediction.'],
        oneTimeBuffer: 0
      };
    }

    // Calculate daily average spend
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const dailySpend = totalExpense / daysInMonth;
    console.log('Total expense:', totalExpense);
    console.log('Days in month:', daysInMonth);
    console.log('Daily average spend:', dailySpend);
    
    // Weekly multipliers based on typical spending patterns
    const weeklyMultipliers = {
      week1: 0.7,  // Rent and major bills
      week2: 0.9,  // Moderate spending
      week3: 0.8,  // Lower spending
      week4: 0.6   // Lowest spending
    };

    // Calculate weekly spend
    const weeklySpend = {
      week1: dailySpend * weeklyMultipliers.week1 * 7,
      week2: dailySpend * weeklyMultipliers.week2 * 7,
      week3: dailySpend * weeklyMultipliers.week3 * 7,
      week4: dailySpend * weeklyMultipliers.week4 * 7
    };

    // Calculate total monthly prediction
    const monthlyPredictions = {
      total: Object.values(weeklySpend).reduce((sum, amount) => sum + amount, 0),
      breakdown: weeklySpend,
      comments: [],
      dailySpend: dailySpend
    };

    // Generate comments
    monthlyPredictions.comments.push(
      `Predicted total monthly spend: ₹${monthlyPredictions.total.toFixed(2)}`,
      `Daily average spend: ₹${dailySpend.toFixed(2)}`,
      `Weekly breakdown:`,
      Object.entries(weeklySpend).map(([week, amount]) => 
        `Week ${week.slice(-1)}: ₹${amount.toFixed(2)} (${(weeklyMultipliers[week] * 100).toFixed(1)}% of daily spend)`
      ).join('\n'),
      `Note: Week 1 multiplier is lower due to rent and bill payments, while Week 4 is higher due to end-of-month expenses.`
    );

    return monthlyPredictions;
  } catch (error) {
    console.error('Error in predictMonthlySpend:', error);
    throw error;
  }
}

module.exports = {
  predictMonthlySpend
};
