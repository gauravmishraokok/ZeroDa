import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Budget({ apiUrl, stats }) {
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [inputBudget, setInputBudget] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBudget();
  }, []);

  const fetchBudget = async () => {
    try {
      const response = await axios.get(`${apiUrl}/auth/budget`);
      setMonthlyBudget(response.data.monthlyBudget);
      setInputBudget(response.data.monthlyBudget);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching budget:', error);
      setLoading(false);
    }
  };

  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${apiUrl}/auth/budget`, { monthlyBudget: parseFloat(inputBudget) });
      setMonthlyBudget(parseFloat(inputBudget));
      alert('Budget updated successfully!');
    } catch (error) {
      console.error('Error updating budget:', error);
      alert('Failed to update budget');
    }
  };

  const budgetUsed = monthlyBudget > 0 ? (stats.totalExpenses / monthlyBudget) * 100 : 0;
  const remaining = monthlyBudget - stats.totalExpenses;

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>🎯 Budget Management</h2>

      <div className="budget-section">
        <h3>Set Monthly Budget</h3>
        <form onSubmit={handleUpdateBudget}>
          <div className="budget-input-group">
            <input
              type="number"
              step="0.01"
              value={inputBudget}
              onChange={(e) => setInputBudget(e.target.value)}
              placeholder="Enter monthly budget"
              className="form-group input"
              style={{ padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px' }}
            />
            <button type="submit" className="btn btn-primary">
              Update Budget
            </button>
          </div>
        </form>
      </div>

      {monthlyBudget > 0 && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Monthly Budget</h3>
              <p>₹{monthlyBudget.toFixed(2)}</p>
            </div>
            <div className={`stat-card ${budgetUsed > 90 ? 'warning' : 'success'}`}>
              <h3>Budget Used</h3>
              <p>{budgetUsed.toFixed(1)}%</p>
            </div>
            <div className={`stat-card ${remaining < 0 ? 'warning' : 'success'}`}>
              <h3>Remaining</h3>
              <p>₹{remaining.toFixed(2)}</p>
            </div>
          </div>

          <div className="chart-card">
            <h3>Budget Progress</h3>
            <div style={{ padding: '20px' }}>
              <div style={{
                width: '100%',
                height: '40px',
                background: '#f0f0f0',
                borderRadius: '20px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  width: `${Math.min(budgetUsed, 100)}%`,
                  height: '100%',
                  background: budgetUsed > 90 ? 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)' : 
                              budgetUsed > 70 ? 'linear-gradient(90deg, #ffd89b 0%, #f6a93d 100%)' :
                              'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
                  transition: 'width 0.5s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  {budgetUsed.toFixed(1)}%
                </div>
              </div>
              
              <div style={{ marginTop: '20px', display: 'grid', gap: '10px' }}>
                {budgetUsed > 100 && (
                  <div style={{ 
                    padding: '15px', 
                    background: '#fee', 
                    borderRadius: '8px', 
                    color: '#c33',
                    fontWeight: '500' 
                  }}>
                    ⚠️ You've exceeded your budget by ₹{Math.abs(remaining).toFixed(2)}!
                  </div>
                )}
                {budgetUsed > 90 && budgetUsed <= 100 && (
                  <div style={{ 
                    padding: '15px', 
                    background: '#fff4e6', 
                    borderRadius: '8px', 
                    color: '#e67700',
                    fontWeight: '500' 
                  }}>
                    ⚡ Warning: You're approaching your budget limit!
                  </div>
                )}
                {budgetUsed <= 70 && (
                  <div style={{ 
                    padding: '15px', 
                    background: '#e6f7f1', 
                    borderRadius: '8px', 
                    color: '#00a854',
                    fontWeight: '500' 
                  }}>
                    ✅ Great job! You're well within your budget.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="chart-card" style={{ marginTop: '30px' }}>
        <h3>💡 Budget Tips</h3>
        <div style={{ padding: '20px', lineHeight: '1.8' }}>
          <ul style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '10px' }}>Set a realistic budget based on your income and essential expenses</li>
            <li style={{ marginBottom: '10px' }}>Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings</li>
            <li style={{ marginBottom: '10px' }}>Review and adjust your budget monthly based on spending patterns</li>
            <li style={{ marginBottom: '10px' }}>Use budget alerts to stay on track throughout the month</li>
            <li style={{ marginBottom: '10px' }}>Build an emergency fund covering 3-6 months of expenses</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Budget;