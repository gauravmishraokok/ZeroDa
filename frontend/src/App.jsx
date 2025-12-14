import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [view, setView] = useState('login');

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const handleLogin = (newToken, newUsername) => {
    setToken(newToken);
    setUsername(newUsername);
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', newUsername);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const handleLogout = () => {
    setToken(null);
    setUsername(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    delete axios.defaults.headers.common['Authorization'];
  };

  if (!token) {
    return (
      <div className="container">
        {view === 'login' ? (
          <Login onLogin={handleLogin} apiUrl={API_URL} setView={setView} />
        ) : (
          <Register onRegister={handleLogin} apiUrl={API_URL} setView={setView} />
        )}
      </div>
    );
  }

  return <Dashboard username={username} onLogout={handleLogout} apiUrl={API_URL} />;
}

export default App;