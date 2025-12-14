import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Insights({ apiUrl }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await axios.get(`${apiUrl}/transactions/insights`);
      setInsights(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching insights:', error);
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '💡';
    }
  };

  if (loading) {
    return <div className="empty-state"><p>Loading insights...</p></div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>💡 AI-Powered Insights</h2>
      
      {insights.length === 0 ? (
        <div className="empty-state">
          <p>Not enough data to generate insights yet. Keep tracking your expenses!</p>
        </div>
      ) : (
        <div className="insights-list">
          {insights.map((insight, index) => (
            <div key={index} className={`insight-card ${insight.type}`}>
              <h4>{getIcon(insight.type)} {insight.title}</h4>
              <p>{insight.message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="chart-card" style={{ marginTop: '30px' }}>
        <h3>📋 What These Insights Mean</h3>
        <div style={{ padding: '20px', lineHeight: '1.8' }}>
          <p><strong>Budget Alerts:</strong> We monitor your spending against your monthly budget and warn you when you're approaching the limit.</p>
          <p><strong>Category Analysis:</strong> Identifies where most of your money is going so you can make informed decisions.</p>
          <p><strong>Spending Forecast:</strong> Predicts your future spending based on historical patterns to help you plan ahead.</p>
          <p><strong>Savings Rate:</strong> Tracks how much you're saving relative to your income, helping you build better financial habits.</p>
        </div>
      </div>
    </div>
  );
}

export default Insights;