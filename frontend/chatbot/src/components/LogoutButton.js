// LogoutButton.js
import React from 'react';
import '../styles/LogoutButton.css';

const LogoutButton = () => {

  const handleLogout = async () => {
    try {
      
      localStorage.removeItem('token');

      // Redirect to the login page or another appropriate page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Logout
    </button>
  );
};

export default LogoutButton;
