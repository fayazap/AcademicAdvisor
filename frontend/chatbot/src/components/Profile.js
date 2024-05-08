import React from 'react';
import ChatHistory from './ChatHistory';
import Navbar from './Navbar';
import UserDetails from './UserDetails';
import '../styles/Profile.css';

const Profile = () => {
  return (
    <div className='profile-wrapper'>
      <Navbar />
      <div className='profile-container'>
        <div className='profile-header'>
        </div>
        <div className='profile-content'>
          <div className='user-details-section'>
            <UserDetails />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
