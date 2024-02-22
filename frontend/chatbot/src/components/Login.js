import React, { useState } from 'react';
import CareerChatbot from './CareerChatbot';

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
    <div>
      <h2>Login</h2>
      <label>Email:</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <br />
      <label>Password:</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <br />
      <button onClick={handleLogin}>Login</button>
      New User? <a href="/signup">Signup</a>
    </div>
  );
};

export default Login;
