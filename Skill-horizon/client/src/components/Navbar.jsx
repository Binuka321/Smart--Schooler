import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaBook, FaUser, FaSignOutAlt } from 'react-icons/fa';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any user session data
    localStorage.removeItem('user');
    // Redirect to login page
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/home">Skill Horizon</Link>
        </div>
        
        <div className="navbar-links">
          <Link to="/home" className="nav-link">
            <FaHome className="nav-icon" />
            <span>Home</span>
          </Link>
          
          <Link to="/learning-plan" className="nav-link">
            <FaBook className="nav-icon" />
            <span>Learning Plan</span>
          </Link>
          
          <Link to="/profile" className="nav-link">
            <FaUser className="nav-icon" />
            <span>Profile</span>
          </Link>

          <button onClick={handleLogout} className="nav-link logout-button">
            <FaSignOutAlt className="nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 