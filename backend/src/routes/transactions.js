import express from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all transactions for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [transactions] = await pool.query(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC',
      [req.user.id]
    );
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

export default router;