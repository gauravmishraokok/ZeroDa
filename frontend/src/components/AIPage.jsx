import React, { useState } from 'react';
import { useAI } from '../contexts/AIContext';
import { useTransactions } from '../contexts/TransactionContext';
import { ArrowLeft } from 'lucide-react';

export default function AIPage() {
  const {
    predictions,
    insights,
    mergeLoading,
    predictLoading,
    insightsLoading,
    error,
    syncResult,
    predictMonthlySpend,
    getAIInsights,
    syncInboxSMS
  } = useAI();
  const { transactions } = useTransactions();

  const handlePredictMonthly = async () => {
    await predictMonthlySpend();
  };

  const handleGetInsights = async () => {
    await getAIInsights();
  };

  const handleSyncMessages = async () => {
    await syncInboxSMS();
  };

  return (
    <div className="ai-container">
      <h2>AI Insights & Predictions</h2>

      <div className="ai-feature-section">
        {/* AI Message Merge */}
        <div className="ai-card ai-uniform-card">
          <h3>AI Message Merge</h3>
          <button
            className="btn"
            onClick={handleSyncMessages}
            disabled={mergeLoading}
          >
            {mergeLoading ? (
              <>
                <span className="loading-dots">Processing<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></span>
              </>
            ) : (
              'Merge SMS Messages'
            )}
          </button>

          {error && (
            <div className="error-message">{error}</div>
          )}

          {mergeLoading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Merging messages...</p>
            </div>
          )}

          {syncResult && (
            <div className="insights-results ai-merge-results">
              <table className="merge-summary-table">
                <tbody>
                  <tr>
                    <td colSpan="4" style={{ fontWeight: 700, fontSize: '1.2em', paddingBottom: 8 }}>
                      Processing Summary
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="4"><strong>Successfully processed:</strong> {syncResult.transactions.length} transactions</td>
                  </tr>
                  <tr>
                    <td colSpan="4"><strong>Total messages analyzed:</strong> {syncResult.processedCount}</td>
                  </tr>
                </tbody>
              </table>
              <div className="merge-table-wrapper">
                <table
                  className="merge-table merge-table-fullwidth"
                  style={{ border: '2.5px solid #bbb', borderCollapse: 'collapse', width: '100%', padding: '10px', backgroundColor: '' }}
                >
                  <thead>
                    <tr>
                      <th style={{ border: '2.5px solid #bbb', background: '#f8f9fa', fontWeight: 600, color: '#495057' }}>Date</th>
                      <th style={{ border: '2.5px solid #bbb', background: '#f8f9fa', fontWeight: 600, color: '#495057' }}>Description</th>
                      <th style={{ border: '2.5px solid #bbb', background: '#f8f9fa', fontWeight: 600, color: '#495057' }}>Amount</th>
                      <th style={{ border: '2.5px solid #bbb', background: '#f8f9fa', fontWeight: 600, color: '#495057' }}>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {syncResult.transactions.map((transaction) => (
                      <tr key={transaction._id}>
                        <td style={{ border: '1.5px solid #bbb' }}>
                          {new Date(transaction.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td style={{ border: '1.5px solid #bbb' }}>{transaction.text}</td>
                        <td style={{ border: '1.5px solid #bbb' }} className={`amount-cell ${transaction.amount < 0 ? 'expense' : 'income'}`}>₹{Math.abs(transaction.amount).toFixed(2)}</td>
                        <td style={{ border: '1.5px solid #bbb' }}>{transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="merge-footer merge-footer-beautiful">
                <p className="success-message">✔ Message processing complete!</p>
                <p className="updated-message">Your <b>expense tracker</b> has been <span className="updated-highlight">updated</span> with the new transactions.</p>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Spending Forecast */}
        <div className="ai-card ai-uniform-card">
          <h3>Monthly Spending Forecast</h3>
          <button
            className="btn"
            onClick={handlePredictMonthly}
            disabled={predictLoading}
          >
            {predictLoading ? (
              <>
                <span className="loading-dots">Calculating<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></span>
              </>
            ) : (
              'Predict Monthly Spend'
            )}
          </button>

          {predictLoading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Calculating forecast...</p>
            </div>
          )}

          {predictions && (
            <div className="insights-results ai-forecast-results simple-forecast-card">
              <div className="simple-forecast-header">
                <h4>Predicted Monthly Spend</h4>
              </div>
              <div className="simple-forecast-main">
                <div className="predicted-amount">₹{Number(predictions.total).toFixed(2)}</div>
                <div className={`verdict ${predictions.total > predictions.totalIncome ? 'verdict-bad' : 'verdict-good'}`}>
                  {predictions.total > predictions.totalIncome ? '⚠ Over Budget' : '✔ Within Budget'}
                </div>
                <div className="simple-forecast-message">
                  {predictions.total > predictions.totalIncome
                    ? 'Your predicted spending exceeds your income. Consider reducing expenses.'
                    : 'Your predicted spending is within your income. Keep it up!'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Financial Insights */}
        <div className="ai-card ai-uniform-card">
          <h3>Financial Insights</h3>
          <button
            className="btn"
            onClick={handleGetInsights}
            disabled={insightsLoading}
          >
            {insightsLoading ? (
              <>
                <span className="loading-dots">Analyzing<span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></span>
              </>
            ) : (
              'Generate Insights'
            )}
          </button>

          {insightsLoading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Generating insights...</p>
            </div>
          )}

          {insights && (
            <div className="insights-results ai-uniform-card" dangerouslySetInnerHTML={{ __html: insights.aiInsights }} />
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        className="btn"
        style={{
          background: '#453596',
          color: '#fff',
          fontWeight: 700,
          fontSize: '1.1em',
          borderRadius: 10,
          padding: '0.9em 1.5em',
          marginTop: 24,
          width: '100%'
        }}
        onClick={() => window.location.href = '/'}
      >
        <ArrowLeft size={20} style={{ marginRight: 8 }} />
        Return to Dashboard
      </button>
    </div>
  );
}
