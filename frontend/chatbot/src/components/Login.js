import React, { useState } from 'react';
import CareerChatbot from './CareerChatbot';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user_id, setUserId] = useState(null);

  const handleLogin = async () => {
    try {
      // Make a POST request to your backend API for login
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log(data); // Log the response from the server

      if (response.ok) {
        // Set the user_id in state
        setUserId(data.user_id);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // If user_id is available, render CareerChatbot
  if (user_id) {
    return <CareerChatbot user_id={user_id} />;
  }

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
