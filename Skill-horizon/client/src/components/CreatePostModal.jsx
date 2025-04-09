import React, { useState } from 'react';
import './CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose }) => {
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files]);
    
    // Create preview URLs for the images
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview([...imagePreview, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreview(newPreviews);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle post submission logic here
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create a Post</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="description-section">
              <textarea
                placeholder="What do you want to talk about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="post-description"
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
                  />
                  <span>Add Photos</span>
                </label>
                <span className="upload-hint">You can add multiple images</span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal; 