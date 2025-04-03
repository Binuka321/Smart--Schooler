import React, { useEffect, useState } from "react";
import axios from "axios";
import { getUserId, getUserRole, getToken, logout } from "../util/auth";
import "./Profile.css"; // Import the CSS file

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authInfo, setAuthInfo] = useState({ userId: null, role: null });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Check if we have a token first
        const token = getToken();
        if (!token) {
          setError("Not authenticated. Please log in.");
          setLoading(false);
          return;
        }

        let role;
        let userId;

        // Try to get user role and handle errors
        try {
          role = await getUserRole();
        } catch (roleError) {
          console.error("Failed to get user role:", roleError);
        }

        // Try to get user ID and handle errors
        try {
          userId = await getUserId();
        } catch (idError) {
          console.error("Failed to get user ID:", idError);
          setError("Failed to authenticate user. Please try logging in again.");
          setLoading(false);
          return;
        }

        if (!userId) {
          setError("User ID not found. Please try logging in again.");
          setLoading(false);
          return;
        }

        setAuthInfo({ userId, role });

        // Fetch user details with the userId
        try {
          const response = await axios.get(
            `http://localhost:8080/api/users/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setUser(response.data);
        } catch (fetchError) {
          console.error("Failed to fetch user details:", fetchError);
          setError("Failed to load user profile. Please try again later.");
        }
      } catch (err) {
        console.error("Error in profile:", err);
        setError(err.message || "Failed to fetch user details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button
          className="login-button"
          onClick={() => (window.location.href = "/")}
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-not-found-container">
        <h2>User Not Found</h2>
        <p>We couldn't find your user profile. Please try logging in again.</p>
        <button
          className="login-button"
          onClick={() => (window.location.href = "/login")}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img
          src={user.profilePicUrl || "https://via.placeholder.com/150"}
          alt="Profile"
          className="profile-image"
        />
        <h1>{user.username}</h1>
        <p className="profile-email">{user.email}</p>
        {authInfo.role && (
          <p className="profile-role">Role: {authInfo.role}</p>
        )}
      </div>
      <div className="profile-details">
        <h2>Details</h2>
        <p>
          <strong>ID:</strong> {user.id}
        </p>
        <div className="logout-container">
          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;