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
  const [editingPost, setEditingPost] = useState(null);
  const [editPostContent, setEditPostContent] = useState("");
  const [editPostImages, setEditPostImages] = useState([]);
  const [editPostImagePreview, setEditPostImagePreview] = useState([]);
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
  const [userPosts, setUserPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndPlans = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        let userId;
        try {
          userId = await getUserId(token);
        } catch (err) {
          console.error("Error getting user ID:", err);
          setError("Failed to get user ID. Please try logging in again.");
          setLoading(false);
          return;
        }

        if (!userId) {
          setError("User ID not found");
          setLoading(false);
          return;
        }

        setAuthInfo({ userId });

        // Fetch user profile
        const userResponse = await axios.get(
          `http://localhost:8080/api/users/${userId}`,
          { 
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true 
          }
        );
        
        if (!userResponse.data) {
          throw new Error("No user data received");
        }
        setUser(userResponse.data);

        // Fetch learning plans
        const plansResponse = await axios.get(
          `http://localhost:8080/api/plans`,
          { 
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true 
          }
        );
        setLearningPlans(plansResponse.data || []);

        // Fetch user's posts
        const postsResponse = await axios.get(
          `http://localhost:8080/api/posts/user/${userId}`,
          { 
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true 
          }
        );
        setUserPosts(postsResponse.data || []);

      } catch (err) {
        console.error("Error fetching profile data:", err);
        if (err.response?.status === 401) {
          setError("Session expired. Please log in again.");
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        } else if (err.response?.status === 404) {
          // Handle 404 gracefully - just set empty posts array
          setUserPosts([]);
        } else {
          setError(err.response?.data?.message || "Failed to load profile. Please try again.");
        }
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeletePost = async (postId) => {
    try {
      const token = getToken();
      if (!token) {
        setError("Not authenticated. Please log in.");
        return;
      }

      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await axios.delete(
          `http://localhost:8080/api/posts/${postId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUserPosts(prevPosts => prevPosts.filter(post => post.id !== postId));

        Swal.fire({
          title: 'Deleted!',
          text: 'Your post has been deleted.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete post. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditPostContent(post.content);
    setEditPostImages([]);
    setEditPostImagePreview(post.images || []);
  };

  const handleSaveEditPost = async (postId) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      formData.append('content', editPostContent);

      // Append new images if any
      editPostImages.forEach((image) => {
        formData.append('images', image);
      });

      const response = await fetch(`http://localhost:8080/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      const updatedPost = await response.json();
      
      // Update the posts list with the edited post
      setUserPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId ? updatedPost : post
        )
      );

      // Show success message
      Swal.fire({
        title: 'Success!',
        text: 'Post updated successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      // Reset edit state
      handleCancelEdit();
    } catch (error) {
      console.error('Error updating post:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update post. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleCancelEditPost = () => {
    setEditingPost(null);
    setEditPostContent("");
    setEditPostImages([]);
    setEditPostImagePreview([]);
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

          {/* New Posts Section */}
          <div className="posts-section">
            <div className="section-header">
              <h2 className="section-title">My Posts</h2>
            </div>
            <div className="posts-grid">
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <div key={post.id} className="post-card">
                    <div className="post-header">
                      <div className="post-user-info">
                        <img 
                          src={user?.profilePicBase64 ? `data:image/jpeg;base64,${user.profilePicBase64}` : "https://via.placeholder.com/40"} 
                          alt="User" 
                          className="post-user-avatar"
                        />
                        <div className="post-user-details">
                          <h3>{user.username}</h3>
                          <span className="post-timestamp">{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                      <div className="post-actions">
                        <button 
                          className="edit-post-button"
                          onClick={() => handleEditPost(post)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-post-button"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="post-content">
                      {editingPost?.id === post.id ? (
                        <div className="edit-post-form">
                          <textarea
                            value={editPostContent}
                            onChange={(e) => setEditPostContent(e.target.value)}
                            className="edit-post-textarea"
                            placeholder="Edit your post..."
                          />
                          <div className="edit-post-images">
                            {editPostImagePreview.map((image, index) => (
                              <div key={index} className="edit-post-image-preview">
                                <img src={`data:image/jpeg;base64,${image}`} alt={`Preview ${index + 1}`} />
                                <button
                                  type="button"
                                  className="remove-image"
                                  onClick={() => {
                                    const newPreviews = [...editPostImagePreview];
                                    newPreviews.splice(index, 1);
                                    setEditPostImagePreview(newPreviews);
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="edit-post-buttons">
                            <button
                              className="save-edit-button"
                              onClick={() => handleSaveEditPost(post.id)}
                            >
                              Save
                            </button>
                            <button
                              className="cancel-edit-button"
                              onClick={handleCancelEditPost}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p>{post.content}</p>
                          {post.images && post.images.length > 0 && (
                            <div className="post-images">
                              {post.images.map((image, index) => (
                                <img 
                                  key={index} 
                                  src={`data:image/jpeg;base64,${image}`} 
                                  alt={`Post image ${index + 1}`} 
                                  className="post-image"
                                />
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className="post-stats">
                      <span>{post.likes || 0} likes</span>
                      <span>{post.comments ? post.comments.length : 0} comments</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-posts-message">No posts yet. Create your first post!</p>
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
            setUserPosts(prevPosts => [newPost, ...prevPosts]);
          }}
        />
      )}
    </div>
  );
};

export default Profile;
