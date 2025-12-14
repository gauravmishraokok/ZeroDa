import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b'];

function Analytics({ apiUrl, categoryBreakdown }) {
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      const response = await axios.get(`${apiUrl}/transactions/trends`);
      setTrends(response.data);
    } catch (error) {
      console.error('Error fetching trends:', error);
    }
  };

  const pieData = categoryBreakdown?.map(cat => ({
    name: cat.category,
    value: parseFloat(cat.total)
  })) || [];

  return (
    <div>
      <div className="charts-grid">
        <div className="chart-card">
          <h3>📈 Spending Trends</h3>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <p>No trend data available yet</p>
            </div>
          )}
        </div>

        <div className="chart-card">
          <h3>🥧 Category Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <p>No category data available yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="chart-card">
        <h3>📊 Category Details</h3>
        {pieData.length > 0 ? (
          <div style={{ display: 'grid', gap: '15px' }}>
            {pieData.map((cat, index) => (
              <div key={cat.name} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '15px',
                background: '#f9f9f9',
                borderRadius: '8px',
                borderLeft: `4px solid ${COLORS[index % COLORS.length]}`
              }}>
                <span style={{ fontWeight: '500' }}>{cat.name}</span>
                <span style={{ fontWeight: 'bold', color: '#ef4444' }}>₹{cat.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No spending data available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;