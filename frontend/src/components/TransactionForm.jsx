import React, { useState } from 'react';

function TransactionForm({ onAdd }) {
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Other'],
    expense: ['Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Other']
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ type, category, amount, description, date });
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="transaction-form">
      <h3>Add Transaction</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories[type].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Add Transaction
        </button>
      </form>
    </div>
  );
}

export default TransactionForm;