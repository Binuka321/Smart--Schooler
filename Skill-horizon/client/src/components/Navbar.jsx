import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { getToken, getUserId } from '../util/auth';
import './Navbar.css';

const Navbar = ({ notificationCount = 0 }) => {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = getToken();
        const userId = await getUserId();
        
        if (!token || !userId) return;

        const response = await axios.get(`http://localhost:8080/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.profilePicture) {
          setProfilePic(response.data.profilePicture);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/home" className="nav-link">Home</Link>
        <Link to="/learning-plans" className="nav-link">Learning Plan</Link>
      </div>
      
      <div className="nav-right">
        <div className="nav-icon">
          <FontAwesomeIcon icon={faBell} size="lg" />
          {notificationCount > 0 && (
            <span className="notification-badge">{notificationCount}</span>
          )}
        </div>
        
        <img 
          src={profilePic || "https://via.placeholder.com/40"} 
          alt="Profile" 
          className="profile-icon"
          onClick={handleProfileClick}
        />
      </div>
    </nav>
  );
};

export default Navbar; 