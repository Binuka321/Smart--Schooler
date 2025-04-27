import React, { useEffect, useState } from "react";
import axios from "axios";
import { getUserId, getToken } from "../util/auth";
import { useNavigate } from 'react-router-dom';
import CreatePostModal from "../components/CreatePostModal";
import Swal from 'sweetalert2';
import "./Profile.css";

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
  const [learningPlans, setLearningPlans] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndPlans = async () => {
      try {
        const token = getToken();
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        const userId = await getUserId();
        if (!userId) {
          setError("User ID not found");
          setLoading(false);
          return;
        }

        setAuthInfo({ userId });

        const userResponse = await axios.get(
          `http://localhost:8080/api/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(userResponse.data);

        const plansResponse = await axios.get(
          `http://localhost:8080/api/plans`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLearningPlans(plansResponse.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndPlans();
  }, []);

  const handleDeletePlan = async (planId) => {
    const token = getToken();
    if (!token) {
      setError("Not authenticated. Please log in.");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8080/api/plans/${planId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLearningPlans((prevPlans) => prevPlans.filter((plan) => plan.id !== planId));

      Swal.fire({
        title: 'Success!',
        text: 'Learning plan deleted successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error deleting plan:", error);
      setError("Failed to delete learning plan. Please try again.");
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete learning plan. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

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

      setUser({ ...user, profilePicBase64: response.data.profilePicBase64 });
      setSelectedImage(null);
      setImagePreview(null);

      Swal.fire({
        title: 'Success!',
        text: 'Profile picture updated successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload profile picture. Please try again.");
      Swal.fire({
        title: 'Error!',
        text: 'Failed to upload profile picture. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleEditClick = (section) => {
    setEditingSection(section);
    setEditForm({
      ...editForm,
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
        setError("");

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
        <button className="login-button" onClick={() => (window.location.href = "/")}>
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
        <button className="login-button" onClick={() => (window.location.href = "/login")}>
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
            <button className="save-button" onClick={handleSaveEdit}>Save</button>
            <button className="cancel-button" onClick={handleCancelEdit}>Cancel</button>
          </div>
        ) : (
          <button className="edit-button" onClick={() => handleEditClick(section)}>Edit</button>
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
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="profile-header">
        <div className="profile-cover-photo"></div>
        <div className="profile-info">
          <div className="profile-picture-container">
            <img
              src={user?.profilePicBase64 ? `data:image/jpeg;base64,${user.profilePicBase64}` : "https://via.placeholder.com/150"}
              alt="Profile"
              className="profile-image"
            />
            <div className="profile-picture-upload">
              <label htmlFor="image-upload" className="upload-button">Change photo</label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              {selectedImage && (
                <button className="save-button" onClick={handleImageUpload}>Save</button>
              )}
            </div>
          </div>

          <div className="profile-details">
            <h1>{user.username}</h1>

            <div className="profile-actions">
              <button className="primary-button" onClick={() => setIsPostModalOpen(true)}>POST</button>
              <button className="secondary-button" onClick={() => navigate('/home')}>Home</button>
              <button className="secondary-button" onClick={() => navigate('/learning-plans')}>Learning Plan</button>
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
                  <button className="save-button" onClick={handleSaveEdit}>Save</button>
                  <button className="cancel-button" onClick={handleCancelEdit}>Cancel</button>
                </div>
              ) : (
                <button className="edit-button" onClick={() => handleEditClick("skills")}>Edit</button>
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
                  <span key={index} className="skill-tag">{skill}</span>
                )) || "No skills listed"}
              </div>
            )}
          </div>

          <div className="learning-plans-section">
            <h2 className="section-title">Learning Plans</h2>
            <div className="learning-plans-grid">
              {learningPlans.length > 0 ? (
                learningPlans.map((plan) => (
                  <div key={plan.id} className="learning-plan-card">
                    <h3 className="plan-title">{plan.title}</h3>
                    <p className="plan-description">{plan.description}</p>
                    <div className="plan-buttons">
                      <button className="delete-button" onClick={() => handleDeletePlan(plan.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No learning plans available.</p>
              )}
            </div>
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

      {isPostModalOpen && (
        <CreatePostModal
          isOpen={isPostModalOpen}
          onClose={() => setIsPostModalOpen(false)}
          onPostCreated={(newPost) => {
            console.log('New Post Created:', newPost);
          }}
        />
      )}
    </div>
  );
};

export default Profile;
