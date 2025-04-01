import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // The backend will handle the OAuth flow automatically
        // We just need to check if the user is authenticated
        const response = await fetch('http://localhost:8080/api/user/current', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to authenticate with Google');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } catch (error) {
        console.error('Google authentication error:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Completing sign in...</p>
    </div>
  );
};

export default GoogleCallback; 