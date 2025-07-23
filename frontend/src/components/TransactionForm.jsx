import React, { useState } from 'react';
import axios from 'axios';

const CATEGORIES = [
  'Salary', 'Food', 'Transport', 'Medical', 'Shopping', 'Entertainment', 'Miscellaneous'
];

const TransactionForm = ({ onAddTransaction }) => {
  const [formData, setFormData] = useState({
    text: '',
    amount: '',
    category: CATEGORIES[0],
    date: new Date().toISOString().split('T')[0]
  });
  const [submitType, setSubmitType] = useState('income');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const isIncome = submitType === 'income';
      const response = await axios.post('http://localhost:5000/transactions', {
        ...formData,
        amount: isIncome ? Math.abs(parseFloat(formData.amount)) : -Math.abs(parseFloat(formData.amount)),
      });
      onAddTransaction(response.data);
      setFormData({
        text: '',
        amount: '',
        category: CATEGORIES[0],
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <div className="form-group">
        <label htmlFor="text">Description</label>
        <input
          type="text"
          id="text"
          name="text"
          value={formData.text}
          onChange={handleChange}
          required
          style={{ background: '#fff', border: '2px solid #eee', borderRadius: '10px' }}
        />
      </div>
      <div className="form-group">
        <label htmlFor="amount">Amount</label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
          style={{ background: '#fff', border: '2px solid #eee', borderRadius: '10px' }}
        />
      </div>
      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          style={{ background: '#fff', border: '2px solid #eee', borderRadius: '10px' }}
        >
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="date">Date</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          style={{ background: '#fff', border: '2px solid #eee', borderRadius: '10px' }}
        />
      </div>
      <div className="buttons">
        <button
          type="submit"
          className="btn income"
          onClick={() => setSubmitType('income')}
        >
          Add income
        </button>
        <button
          type="submit"
          className="btn expense"
          onClick={() => setSubmitType('expense')}
        >
          Add expense
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
