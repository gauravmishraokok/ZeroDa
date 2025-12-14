import express from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all transactions for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [req.user.id];

    if (startDate && endDate) {
      query += ' AND date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY date DESC';

    const [transactions] = await pool.query(query, params);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add transaction
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, category, amount, description, date } = req.body;

    const [result] = await pool.query(
      'INSERT INTO transactions (user_id, type, category, amount, description, date) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, type, category, amount, description, date]
    );

    const [newTransaction] = await pool.query(
      'SELECT * FROM transactions WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newTransaction[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete transaction
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [income] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = "income"',
      [req.user.id]
    );

    const [expenses] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = "expense"',
      [req.user.id]
    );

    const [categoryBreakdown] = await pool.query(
      'SELECT category, SUM(amount) as total FROM transactions WHERE user_id = ? AND type = "expense" GROUP BY category',
      [req.user.id]
    );

    res.json({
      totalIncome: income[0].total,
      totalExpenses: expenses[0].total,
      balance: income[0].total - expenses[0].total,
      categoryBreakdown
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get trends (monthly spending)
router.get('/trends', authenticateToken, async (req, res) => {
  try {
    const [trends] = await pool.query(`
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
      FROM transactions 
      WHERE user_id = ? 
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `, [req.user.id]);

    res.json(trends.reverse());
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get insights
router.get('/insights', authenticateToken, async (req, res) => {
  try {
    const [transactions] = await pool.query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC',
      [req.user.id]
    );

    const [budget] = await pool.query(
      'SELECT monthly_budget FROM users WHERE id = ?',
      [req.user.id]
    );

    const insights = generateInsights(transactions, budget[0].monthly_budget);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to generate insights
function generateInsights(transactions, monthlyBudget) {
  const insights = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter this month's transactions
  const thisMonthTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
  });

  const thisMonthExpenses = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Budget warning
  if (monthlyBudget > 0) {
    const percentUsed = (thisMonthExpenses / monthlyBudget) * 100;
    if (percentUsed > 90) {
      insights.push({
        type: 'warning',
        title: 'Budget Alert',
        message: `You've used ${percentUsed.toFixed(0)}% of your monthly budget!`
      });
    } else if (percentUsed > 70) {
      insights.push({
        type: 'info',
        title: 'Budget Watch',
        message: `You've used ${percentUsed.toFixed(0)}% of your monthly budget.`
      });
    }
  }

  // Top spending category
  const categoryTotals = {};
  thisMonthTransactions.filter(t => t.type === 'expense').forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + parseFloat(t.amount);
  });

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  if (topCategory) {
    insights.push({
      type: 'info',
      title: 'Top Spending Category',
      message: `You've spent ₹${topCategory[1].toFixed(2)} on ${topCategory[0]} this month.`
    });
  }

  // Forecast next month
  if (transactions.length > 0) {
    const lastMonthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      const lastMonth = new Date(currentYear, currentMonth - 1);
      return tDate.getMonth() === lastMonth.getMonth() && tDate.getFullYear() === lastMonth.getFullYear();
    });

    const lastMonthExpenses = lastMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const avgExpenses = (thisMonthExpenses + lastMonthExpenses) / 2;
    insights.push({
      type: 'success',
      title: 'Spending Forecast',
      message: `Based on trends, you'll likely spend ₹${avgExpenses.toFixed(2)} next month.`
    });
  }

  // Savings insight
  const thisMonthIncome = thisMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  if (thisMonthIncome > 0) {
    const savingsRate = ((thisMonthIncome - thisMonthExpenses) / thisMonthIncome) * 100;
    if (savingsRate > 20) {
      insights.push({
        type: 'success',
        title: 'Great Savings!',
        message: `You're saving ${savingsRate.toFixed(0)}% of your income this month!`
      });
    } else if (savingsRate < 0) {
      insights.push({
        type: 'warning',
        title: 'Overspending',
        message: `You're spending more than you earn this month. Consider cutting back.`
      });
    }
  }

  return insights;
}

export default router;