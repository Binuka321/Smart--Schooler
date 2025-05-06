import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaBook, FaUser, FaSignOutAlt } from 'react-icons/fa';
import Notifications from './Notifications';
import '../styles/Navbar.css';
import Swal from 'sweetalert2';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of your account",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!'
    });

    if (result.isConfirmed) {
      // Clear any user session data
      localStorage.removeItem('authToken');
      // Redirect to login page
      navigate('/');
      Swal.fire({
        title: 'Logged Out!',
        text: 'You have been successfully logged out.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
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

          <Notifications />

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