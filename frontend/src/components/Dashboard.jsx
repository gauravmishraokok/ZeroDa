import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TransactionForm from './TransactionForm';
import Analytics from './Analytics';
import Insights from './Insights';
import Budget from './Budget';

function Dashboard({ username, onLogout, apiUrl }) {
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalIncome: 0, totalExpenses: 0, balance: 0 });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchTransactions = async () => {
    try {
      let url = `${apiUrl}/transactions`;
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      const response = await axios.get(url);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${apiUrl}/transactions/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, [startDate, endDate]);

  const handleAddTransaction = async (transaction) => {
    try {
      await axios.post(`${apiUrl}/transactions`, transaction);
      fetchTransactions();
      fetchStats();
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await axios.delete(`${apiUrl}/transactions/${id}`);
      fetchTransactions();
      fetchStats();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>💰 Zero Da</h1>
        <div className="user-info">
          <span>Welcome, {username}!</span>
          <button className="btn btn-secondary" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card success">
          <h3>Total Income</h3>
          <p>₹{Number(stats.totalIncome).toFixed(2)}</p>
        </div>
        <div className="stat-card warning">
          <h3>Total Expenses</h3>
          <p>₹{Number(stats.totalExpenses).toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Balance</h3>
          <p>₹{Number(stats.balance).toFixed(2)}</p>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          📝 Transactions
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
        <button
          className={`tab ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          💡 Insights
        </button>
        <button
          className={`tab ${activeTab === 'budget' ? 'active' : ''}`}
          onClick={() => setActiveTab('budget')}
        >
          🎯 Budget
        </button>
      </div>

      {activeTab === 'transactions' && (
        <>
          <TransactionForm onAdd={handleAddTransaction} />

          <div className="filter-bar">
            <h3>Filter Transactions</h3>
            <div className="filter-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <button className="btn btn-secondary" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>

          <div className="transactions-list">
            <h3>Recent Transactions</h3>
            {transactions.length === 0 ? (
              <div className="empty-state">
                <p>No transactions yet. Add your first transaction above!</p>
              </div>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <h4>{transaction.category}</h4>
                    <p>{transaction.description}</p>
                    <p>{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className={`transaction-amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}₹
                      {Number(transaction.amount).toFixed(2)}
                    </span>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteTransaction(transaction.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'analytics' && (
        <Analytics apiUrl={apiUrl} categoryBreakdown={stats.categoryBreakdown} />
      )}

      {activeTab === 'insights' && (
        <Insights apiUrl={apiUrl} />
      )}

      {activeTab === 'budget' && (
        <Budget apiUrl={apiUrl} stats={stats} />
      )}
    </div>
  );
}

export default Dashboard;