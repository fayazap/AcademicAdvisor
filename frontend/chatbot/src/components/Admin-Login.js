import React, { useState } from 'react';
// import '../styles/AdminLogin.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        window.location.href = '/admin/dashboard'; // Redirect to admin dashboard
      } else if (response.status === 401) {
        setError('Invalid username or password');
      } else {
        setError('An error occurred. Please try again later.');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className='admin-login-wrapper'>
      <div className="admin-login-container">
        <h2>Admin Login</h2>
        <div className="admin-login-input-section">
          <input
            className='admin-login-input'
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <br />
          <input
            className='admin-login-input'
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          {error && <p className="admin-error-message">{error}</p>}
          <button className='admin-login-button' onClick={handleLogin}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
