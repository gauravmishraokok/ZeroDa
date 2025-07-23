import React from 'react';
import axios from 'axios';
import { Trash2, Clock } from 'lucide-react';
import { useState } from 'react';

const TransactionList = ({ transactions, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Sort transactions by date descending
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  const [deletingId, setDeletingId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div className="transaction-list" style={{ width: '100%' }}>
      <h2><Clock size={20} style={{marginRight: 8}}/>History</h2>
      {sortedTransactions.map((transaction) => {
        const isHovered = hoveredId === transaction._id;
        return (
          <div
            key={transaction._id}
            className={`transaction-item ${transaction.amount >= 0 ? 'income' : 'expense'}${deletingId === transaction._id ? ' deleting' : ''}`}
            style={{
              borderLeft: `8px solid ${transaction.amount >= 0 ? '#2ecc71' : '#c0392b'}`,
              background: '#fff',
              marginBottom: '1.2em',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(69,53,150,0.06)',
              position: 'relative',
              transition: 'box-shadow 0.2s, opacity 0.4s, transform 0.4s',
              fontWeight: 600,
              opacity: deletingId === transaction._id ? 0 : 1,
              transform: deletingId === transaction._id ? 'translateX(40px)' : 'none',
              display: 'flex',
              alignItems: 'center',
              minHeight: 64,
              width: '100%',
              overflow: 'hidden'
            }}
            onMouseEnter={() => setHoveredId(transaction._id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div
              className="transaction-content"
              style={{
                flex: 1,
                paddingRight: isHovered ? 56 : 16,
                paddingLeft: 0,
                transition: 'padding 0.3s',
                position: 'relative',
                zIndex: 1
              }}
            >
              <div className="transaction-details" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="transaction-text" style={{ color: transaction.amount >= 0 ? '#2ecc71' : '#a93226', fontWeight: 700, fontSize: '1.1em' }}>
                  {transaction.text}
                </div>
                <div className="transaction-amount" style={{ color: transaction.amount >= 0 ? '#2ecc71' : '#c0392b', fontWeight: 700, fontSize: '1.1em' }}>
                  {transaction.amount >= 0 ? '+ ' : '- '}₹{Math.abs(transaction.amount).toFixed(0)}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span className="transaction-category" style={{ color: '#888', fontWeight: 500 }}>{transaction.category}</span>
                <span className="transaction-date" style={{ color: '#888', fontWeight: 500 }}>{formatDate(transaction.date)}</span>
              </div>
            </div>
            <div
              className="delete-btn-bar"
              style={{
                width: isHovered ? 48 : 8,
                height: '100%',
                background: transaction.amount >= 0 ? '#2ecc71' : '#c0392b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderTopRightRadius: 12,
                borderBottomRightRadius: 12,
                cursor: 'pointer',
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                zIndex: 2,
                transition: 'width 0.3s',
                overflow: 'hidden'
              }}
              onClick={async () => {
                setDeletingId(transaction._id);
                setTimeout(() => onDelete(transaction._id), 400);
              }}
            >
              {isHovered && <Trash2 size={22} color="#fff" />}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionList;
