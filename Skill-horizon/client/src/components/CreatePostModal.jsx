import React, { useState } from 'react';
import './CreatePostModal.css';
import Swal from 'sweetalert2';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert('You can upload a maximum of 5 images');
      return;
    }

    setImages([...images, ...files]);

    // Create preview URLs for the images
    const newPreviews = files.map(file => URL.createObjectURL(file));
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
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Not authenticated. Please log in.');
      }

      // Create FormData to handle both text and files
      const formData = new FormData();
      formData.append('content', description);

      // Append each image to the form data
      images.forEach((image) => {
        formData.append('images', image);
      });

      //calling the API 
      const response = await fetch('http://localhost:8080/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }

      const createdPost = await response.json();
      console.log('Post created:', createdPost);

      // Show success message with SweetAlert
      Swal.fire({
        title: 'Success!',
        text: 'Your post has been created successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

      // Reset form
      setDescription('');
      setImages([]);
      setImagePreview([]);

      // Close modal and notify parent component
      onClose();
      if (onPostCreated) {
        onPostCreated(createdPost);  // Trigger parent callback to update UI
      }

    } catch (error) {
      // Error Logging
      console.error('Error creating post:', error);  // This logs the error to the browser console

      // Set error message state to display on UI
      setError(error.message || 'An error occurred while creating the post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;  // Don't render anything if the modal isn't open

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create a Post</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>} {/* Display the error message */}
            
            <div className="description-section">
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
                    style={{ display: 'none' }}
                    disabled={images.length >= 5}
                  />
                  <span>{images.length >= 5 ? 'Max 5 images' : 'Add Photos'}</span>
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
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;

// -----------------------------------------
// Developer Notes by chanuka
// -----------------------------------------

/*
  Enhancement Considerations:
  - The current image upload functionality limits users to 5 images, which is handled on the client-side before submission.
  - If this limit is to be dynamically managed or validated server-side in the future, additional logic would be required in the backend API as well.
  - Additionally, image preview URLs are generated using URL.createObjectURL(), which works fine but should be revoked when the modal closes to prevent memory leaks in long-running sessions.
*/
