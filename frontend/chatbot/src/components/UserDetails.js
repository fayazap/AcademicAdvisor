import React, { useState, useEffect } from 'react';
import '../styles/UserDetails.css';

const UserDetails = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [changePassword, setChangePassword] = useState(false);
  const [changeUsername, setChangeUsername] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Function to fetch user details
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('accessToken');

        const response = await fetch('http://localhost:5000/get_user_details', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setUserDetails(data);
        } else {
          console.error('Error fetching user details:', data.error);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    // Call the function to fetch user details
    fetchUserDetails();
  }, []); // Empty dependency array to run the effect only once

  const handleChangePassword = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await fetch('http://localhost:5000/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: userDetails.user_details.email,
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message);
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError('An error occurred. Please try again later.');
    }
  };

  const handleChangeUsername = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await fetch('http://localhost:5000/change-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          new_username: newUsername,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message);
        setNewUsername('');
      } else {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error changing username:', error);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div>
      {userDetails ? (
        <div>
          <h2>User Details</h2>
          <p>Name: {userDetails.user_details.name}</p>
          <p>Username: {userDetails.user_details.username}</p>
          <p>Email: {userDetails.user_details.email}</p>
          {/* Add any other user details you want to display */}
          <p><b>Want to change the username?</b></p>
          <button className='change-username-button' onClick={() => setChangeUsername(!changeUsername)}>Click Here</button>
          {changeUsername && (
            <>
              <br />
              <input
                type="text"
                placeholder="New Username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="username-input"
              />
              <br />
              <button className='change-username-button' onClick={handleChangeUsername}>Update</button>
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            </>
          )}

          <p><b>Want to change the password?</b></p>
          <button className='change-password-button' onClick={() => setChangePassword(!changePassword)}>Click Here</button>
          {changePassword && (
            <>
              <br />
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="password-input"
              />
              <br />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="password-input"
              />
              <br />
              <button className='login-button' onClick={handleChangePassword}>Update</button>
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            </>
          )}
        </div>
      ) : (
        <p>Loading user details...</p>
      )}
    </div>
  );
};

export default UserDetails;
