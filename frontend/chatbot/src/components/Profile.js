import React from 'react'
import ChatHistory from './ChatHistory'
import Navbar from './Navbar'
import UserDetails from './UserDetails'

const Profile = () => {
  return (
    <div>
      <Navbar />
      <ChatHistory />
      <UserDetails />
    </div>
  )
}

export default Profile
