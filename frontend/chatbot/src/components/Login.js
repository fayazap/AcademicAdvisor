import React, { useState } from 'react';
import CareerChatbot from './CareerChatbot';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Set the access token in state and local storage
        localStorage.setItem('accessToken', data.access_token);
        window.location.href = '/chatbot';
        return <CareerChatbot />;
      } else if (response.status === 401) {
        setError('Invalid email or password');
      } else if (response.status === 400) {
        setError('Email and password are required');
      } else {
        setError('An error occurred. Please try again later.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className='login-wrapper'>
      <div className="login-container">
        <div className="login-logo">
          <img src="/Images/logo.png" alt="Logo" className="login_logo_image" />
        </div>
        <h2>Login</h2>
        <div className="login-input-section">
          <input
            className='login-input'
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br />
          <input
            className='login-input'
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button className='login-button' onClick={handleLogin}>Login</button>
        <p>New User? <a href="/signup">Signup</a></p>
      </div>
    </div>
  );
};

export default Login;
