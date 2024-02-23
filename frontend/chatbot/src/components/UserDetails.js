import React, { useState, useEffect } from 'react';

const UserDetails = () => {
  const [userDetails, setUserDetails] = useState(null);

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

  return (
    <div>
      {userDetails ? (
        <div>
          <h2>User Details</h2>
          <p>Name: {userDetails.user_details.name}</p>
          <p>Username: {userDetails.user_details.username}</p>
          <p>Email: {userDetails.user_details.email}</p>
          {/* Add any other user details you want to display */}
        </div>
      ) : (
        <p>Loading user details...</p>
      )}
    </div>
  );
};

export default UserDetails;
