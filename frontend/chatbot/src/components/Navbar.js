import React from "react";
import { NavLink } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const [showNavbar, setShowNavbar] = useState(false);

  const navbarHandler = () => {
    setShowNavbar(!showNavbar);
  };


  const logoutHandler = async (req, res) => {
    try {
      const apiUrl = "http://127.0.0.1:5000/logout";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div>
      <div className="navbar">
        <img
          src="/images/Logo.png"
          alt="Logo"
          border="0"
          className="logo_image"
        />
        <div className="navbar_list">
          <ul>
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? "active" : undefined)}
                end
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/profile"
                className={({ isActive }) => (isActive ? "active" : undefined)}
              >
                Profile
              </NavLink>
            </li>
            <li>
              <a className="logout__button" onClick={logoutHandler}>
                Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mobile_navbar">
        <div className="hamburger-menu">
          <GiHamburgerMenu onClick={navbarHandler} className="" />
        </div>
        
      </div>
    </div>
  );
};

export default Navbar;
