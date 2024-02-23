// Login.js

import React, { useState } from 'react';
import CareerChatbot from './CareerChatbot';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessToken, setAccessToken] = useState(null);

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
        setAccessToken(data.access_token);
        localStorage.setItem('accessToken', data.access_token);
        const token = localStorage.getItem('accessToken');
        console.log('Token:', token);

        // Render CareerChatbot directly after successful login 
        window.location.href = '/chatbot';
        return <CareerChatbot />;
      }
    } catch (error) {
      console.error('Login error:', error);
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
      <button className='login-button' onClick={handleLogin}>Login</button>
      <p>New User? <a href="/signup">Signup</a></p>
    </div>
    </div>
  );
};

export default Login;
