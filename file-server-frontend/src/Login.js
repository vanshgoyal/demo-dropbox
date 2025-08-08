import React, { useState } from 'react';
import axios from './axios';
import './App.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
  setError('');
  try {
    const response = await axios.post('/users/authenticate', {
      username,
      password,
    });
    localStorage.setItem('userId', response.data.user.id);
    onLogin(response.data.user.id);
  } catch (authError) {
    console.error('Auth error:', authError); // <-- Add this line
    if (authError.response && authError.response.status === 404) {
      // User not found, create a new one
      try {
        const createRes = await axios.post('/users', {
          username,
          password,
        });
        localStorage.setItem('userId', createRes.data.id);
        onLogin(createRes.data.id);
      } catch (createError) {
        console.error('Create user error:', createError); // <-- Add this line
        setError('Failed to create user');
      }
    } else {
      setError('Invalid credentials');
    }
  }
};

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
};

export default Login;