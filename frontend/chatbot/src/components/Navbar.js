import React from "react";
import { NavLink } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import LogoutButton from "./LogoutButton";

const Navbar = () => {
  const [showNavbar, setShowNavbar] = useState(false);

  const navbarHandler = () => {
    setShowNavbar(!showNavbar);
  };


  return (
    <div>
      <div className="navbar">
        <Link to="/chatbot">
        <img
          src="/Images/Logo.png"
          alt="Logo"
          border="0"
          className="logo_image"
        />
        </Link>
        <div className="navbar_list">
          <ul>
            <li>
              <NavLink
                to="/chatbot"
                className={({ isActive }) => (isActive ? "active" : undefined)}
                end
              >
                Home
              </NavLink>
            </li>

            <li>
              <NavLink
              to="/history"
              className={({ isActive }) => (isActive ? "active" : undefined)}
              >History</NavLink>
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
              <LogoutButton />
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
