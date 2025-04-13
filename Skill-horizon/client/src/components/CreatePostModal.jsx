import React, { useState } from "react";
import "./CreatePostModal.css";

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [skill, setSkill] = useState("");

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert("You can upload a maximum of 5 images");
      return;
    }

    setImages([...images, ...files]);

    // Create preview URLs for the images
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreview([...imagePreview, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreview];

    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    setImages(newImages);
    setImagePreview(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("skill", skill);
      formData.append("content", description);

      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await fetch("http://localhost:8080/api/posts", {
        method: "POST",
        credentials: "include", // 👈 important for session cookies
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create post");
      }

      const createdPost = await response.json();
      console.log("Post created:", createdPost);

      setDescription("");
      setImages([]);
      setImagePreview([]);
      onClose();
      if (onPostCreated) onPostCreated(createdPost);
    } catch (error) {
      console.error("Error creating post:", error);
      setError(error.message || "An error occurred while creating the post");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create a Post</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}

            <div className="description-section">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Skill (e.g. JavaScript)"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                required
              />

              <textarea
                placeholder="What do you want to talk about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="post-description"
                required
              />
            </div>

            <div className="image-upload-section">
              <div className="image-preview-container">
                {imagePreview.map((preview, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="upload-controls">
                <label className="upload-button">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                    disabled={images.length >= 5}
                  />
                  <span>
                    {images.length >= 5 ? "Max 5 images" : "Add Photos"}
                  </span>
                </label>
                <span className="upload-hint">You can add up to 5 images</span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting || !description.trim()}
            >
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
