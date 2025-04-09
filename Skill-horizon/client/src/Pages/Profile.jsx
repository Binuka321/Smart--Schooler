import React, { useEffect, useState } from "react";
import axios from "axios";
import { getUserId, getUserRole, getToken, logout } from "../util/auth";
import "./Profile.css"; // Import the CSS file
import CreatePostModal from '../components/CreatePostModal';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authInfo, setAuthInfo] = useState({ userId: null, role: null });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    location: "",
    about: "",
    experience: "",
    education: "",
    phone: "",
    website: "",
    skills: [],
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

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
          if (response.data.profilePicUrl) {
            setImagePreview(response.data.profilePicUrl);
          }
          setEditForm({
            title: response.data.title || "",
            location: response.data.location || "",
            about: response.data.about || "",
            experience: response.data.experience || "",
            education: response.data.education || "",
            phone: response.data.phone || "",
            website: response.data.website || "",
            skills: response.data.skills || [],
          });
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

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const token = getToken();
      const response = await axios.post(
        `http://localhost:8080/api/users/${authInfo.userId}/profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUser({ ...user, profilePicUrl: response.data.profilePicUrl });
      setSelectedImage(null);
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload profile picture. Please try again.");
    }
  };

  const handleEditClick = (section) => {
    setEditingSection(section);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSkillsChange = (value) => {
    const skills = value.split(",").map((skill) => skill.trim());
    setEditForm((prev) => ({ ...prev, skills }));
  };

  const handleSaveEdit = async () => {
    try {
      const token = getToken();
      if (!token) {
        setError("Not authenticated. Please log in.");
        return;
      }

      const response = await axios.put(
        `http://localhost:8080/api/users/${authInfo.userId}/profile`,
        editForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setUser(response.data);
        setEditingSection(null);
        setSuccessMessage("Profile updated successfully!");
        setError(""); // Clear any existing errors
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        throw new Error("No data received from server");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response?.status === 401) {
        setError("Session expired. Please log in again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setError(error.response?.data?.message || "Failed to update profile. Please try again.");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditForm({
      title: user.title || "",
      location: user.location || "",
      about: user.about || "",
      experience: user.experience || "",
      education: user.education || "",
      phone: user.phone || "",
      website: user.website || "",
      skills: user.skills || [],
    });
  };

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

  const renderEditableSection = (section, title, field, multiline = false) => (
    <div className="profile-section">
      <div className="section-header">
        <h2>{title}</h2>
        {editingSection === section ? (
          <div className="edit-actions">
            <button className="save-button" onClick={handleSaveEdit}>
              Save
            </button>
            <button className="cancel-button" onClick={handleCancelEdit}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="edit-button" onClick={() => handleEditClick(section)}>
            Edit
          </button>
        )}
      </div>
      {editingSection === section ? (
        multiline ? (
          <textarea
            className="edit-textarea"
            value={editForm[field]}
            onChange={(e) => handleEditChange(field, e.target.value)}
          />
        ) : (
          <input
            className="edit-input"
            type="text"
            value={editForm[field]}
            onChange={(e) => handleEditChange(field, e.target.value)}
          />
        )
      ) : (
        <p>{user[field] || `No ${title.toLowerCase()} yet`}</p>
      )}
    </div>
  );

  return (
    <div className="profile-page">
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      <div className="profile-header">
        <div className="profile-cover-photo"></div>
        <div className="profile-info">
          <div className="profile-picture-container">
            <img
              src={imagePreview || "https://via.placeholder.com/150"}
              alt="Profile"
              className="profile-image"
            />
            <div className="profile-picture-upload">
              <label htmlFor="image-upload" className="upload-button">
                Change photo
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              {selectedImage && (
                <button className="save-button" onClick={handleImageUpload}>
                  Save
                </button>
              )}
            </div>
          </div>
          <div className="profile-details">
            <h1>{user.username}</h1>
            <div className="profile-title-section">
              {editingSection === "title" ? (
                <div className="edit-container">
                  <input
                    className="edit-input"
                    type="text"
                    value={editForm.title}
                    onChange={(e) => handleEditChange("title", e.target.value)}
                    placeholder="Add your title"
                  />
                  <div className="edit-actions">
                    <button className="save-button" onClick={handleSaveEdit}>
                      Save
                    </button>
                    <button className="cancel-button" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-title">
                  <span>{user.title || "Add your title"}</span>
                  <button className="edit-button" onClick={() => handleEditClick("title")}>
                    Edit
                  </button>
                </div>
              )}
            </div>
            <div className="profile-location-section">
              {editingSection === "location" ? (
                <div className="edit-container">
                  <input
                    className="edit-input"
                    type="text"
                    value={editForm.location}
                    onChange={(e) => handleEditChange("location", e.target.value)}
                    placeholder="Add your location"
                  />
                  <div className="edit-actions">
                    <button className="save-button" onClick={handleSaveEdit}>
                      Save
                    </button>
                    <button className="cancel-button" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-location">
                  <span>{user.location || "Add your location"}</span>
                  <button className="edit-button" onClick={() => handleEditClick("location")}>
                    Edit
                  </button>
                </div>
              )}
            </div>
            <div className="profile-actions">
              <button className="primary-button" onClick={() => setIsPostModalOpen(true)}>POST</button>
              <button className="secondary-button">Add profile section</button>
              <button className="secondary-button">More</button>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-main">
          {renderEditableSection("about", "About", "about", true)}
          {renderEditableSection("experience", "Experience", "experience", true)}
          {renderEditableSection("education", "Education", "education", true)}
          <div className="profile-section">
            <div className="section-header">
              <h2>Skills</h2>
              {editingSection === "skills" ? (
                <div className="edit-actions">
                  <button className="save-button" onClick={handleSaveEdit}>
                    Save
                  </button>
                  <button className="cancel-button" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button className="edit-button" onClick={() => handleEditClick("skills")}>
                  Edit
                </button>
              )}
            </div>
            {editingSection === "skills" ? (
              <input
                className="edit-input"
                type="text"
                value={editForm.skills.join(", ")}
                onChange={(e) => handleSkillsChange(e.target.value)}
                placeholder="Enter skills separated by commas"
              />
            ) : (
              <div className="skills-container">
                {user.skills?.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                )) || "No skills listed"}
              </div>
            )}
          </div>
        </div>

        <div className="profile-sidebar">
          <div className="profile-section">
            <h3>Contact info</h3>
            {renderEditableSection("phone", "Phone", "phone")}
            {renderEditableSection("website", "Website", "website")}
            <p>{user.email}</p>
          </div>

          <div className="profile-section">
            <h3>Background</h3>
            <p>Member since {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      
      <CreatePostModal 
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
      />
    </div>
  );
};

export default Profile;