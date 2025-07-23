import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import VisualizationPage from './components/VisualizationPage'
import AIPage from './components/AIPage'
import { TransactionProvider, useTransactions } from './contexts/TransactionContext'
import { AIProvider } from './contexts/AIContext'
import './App.css'

// Add CSP headers
if (typeof window !== 'undefined') {
  const meta = document.createElement('meta')
  meta.httpEquiv = 'Content-Security-Policy'
  meta.content = "default-src 'self' http://localhost:5000; font-src 'self' https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src-elem 'self' https://fonts.googleapis.com; script-src 'self' 'unsafe-eval' 'unsafe-inline'; connect-src 'self' http://localhost:5000 https://generativelanguage.googleapis.com; img-src 'self' data:";
  document.head.appendChild(meta)

  // Add font preload
  const fontLink = document.createElement('link')
  fontLink.rel = 'preload'
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap'
  fontLink.as = 'style'
  fontLink.crossOrigin = 'anonymous'
  document.head.appendChild(fontLink)

  // Add font CSS
  const fontStyle = document.createElement('link')
  fontStyle.rel = 'stylesheet'
  fontStyle.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap'
  document.head.appendChild(fontStyle)
}

function App() {
  return (
    <Router>
      <TransactionProvider>
        <AIProvider>
          <AppContent />
        </AIProvider>
      </TransactionProvider>
    </Router>
  )
}

function AppContent() {
  const { transactions, loading, addTransaction, deleteTransaction } = useTransactions();
  const [fadeClass, setFadeClass] = useState('fade-in');
  const [route, setRoute] = useState(window.location.pathname);

  useEffect(() => {
    const handleNav = (e) => {
      if (e.target.tagName === 'A' && e.target.href) {
        setFadeClass('fade-out');
        setTimeout(() => {
          setRoute(new URL(e.target.href).pathname);
          setFadeClass('fade-in');
        }, 500);
        e.preventDefault();
      }
    };
    document.querySelector('.navbar').addEventListener('click', handleNav);
    return () => document.querySelector('.navbar').removeEventListener('click', handleNav);
  }, []);

  const totalBalance = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = Math.abs(transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0));

  return (
    <div className="app-container">
      <nav className="navbar">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/visualization" className="nav-link">Visualization</Link>
        <Link to="/ai" className="nav-link">AI Insights</Link>
      </nav>
      <div className={fadeClass}>
        <Routes location={{ pathname: route }}>
          <Route path="/" element={
            <div className="home-content">
              <div className="balance-section">
                <div className="balance-label">YOUR BALANCE</div>
                <div className="balance-value">₹{totalBalance.toFixed(2)}</div>
              </div>
              <div className="ie-card">
                <div className="ie-col">
                  <div className="ie-label">INCOME</div>
                  <div className="ie-amount income">+₹{totalIncome.toFixed(2)}</div>
                </div>
                <div className="ie-divider" />
                <div className="ie-col">
                  <div className="ie-label">EXPENSE</div>
                  <div className="ie-amount expense">-₹{totalExpense.toFixed(2)}</div>
                </div>
              </div>
              <TransactionForm onAddTransaction={addTransaction} />
              <TransactionList transactions={transactions} onDelete={deleteTransaction} />
            </div>
          } />
          <Route path="/visualization" element={<VisualizationPage />} />
          <Route path="/ai" element={<AIPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
