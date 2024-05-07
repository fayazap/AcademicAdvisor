// frontend/src/App.js
import React from 'react';
import CareerChatbot from './components/CareerChatbot';
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Route from './components/Route';
import Login from './components/Login';
import Signup from './components/Signup';
import ChatHistory from './components/ChatHistory';
import Profile from './components/Profile';
import AdminLogin from './components/Admin-Login';

const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/admin/login", element: <AdminLogin />},
  { path: "/signup", element: <Signup /> },
  { path: "/chatbot", element: <CareerChatbot /> },
  { path: "/history", element: <ChatHistory /> },
  { path: "/profile", element: <Profile /> },
  { path: "/route", element: <Route /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
