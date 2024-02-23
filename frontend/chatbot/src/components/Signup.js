import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Signup.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessToken, setAccessToken] = useState(null);

  const handleSignup = async () => {
    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, username, email, password }),
      });

      const data = await response.json();

      console.log(data);

      if (response.ok) {
        // Set the access token in state and local storage
        setAccessToken(data.access_token);
        localStorage.setItem('accessToken', data.access_token);

        const token = localStorage.getItem('accessToken');
        console.log('Token:', token);

        // Redirect to the chatbot page or perform other actions based on the response
        window.location.href = '/chatbot';
      }

      // Handle other cases based on the response
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  return (
    <div className='signup-wrapper'>
      <div className="signup-container">
        <div className="signup-logo">
          <img src="/Images/logo.png" alt="Logo" className="signup_logo_image" />
        </div>
        <h2>Signup</h2>
        <input
          className='signup-input'
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br />
        <input
          className='signup-input'
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <input
          className='signup-input'
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <input
          className='signup-input'
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button className='signup-button' onClick={handleSignup}>Signup</button>
        <p>Already have an account? <Link to="/">Login</Link></p>
      </div>
    </div>
  );
};

export default Signup;
