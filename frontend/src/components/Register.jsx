import React, { useState } from 'react';
import axios from 'axios';

function Register({ onRegister, apiUrl, setView }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${apiUrl}/auth/register`, {
        username,
        email,
        password
      });
      onRegister(response.data.token, response.data.username);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-card">
      <h2>Create Account</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Register
        </button>
      </form>
      <div className="auth-switch">
        Already have an account?{' '}
        <button onClick={() => setView('login')}>Login</button>
      </div>
    </div>
  );
}

export default Register;