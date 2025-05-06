import React, { useState } from 'react';
import { FaReply, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import './Comment.css';

const Comment = ({ 
  comment, 
  currentUserId, 
  onEdit, 
  onDelete, 
  onReply,
  level = 0 
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText('');
      setIsReplying(false);
    }
  };

  const handleEdit = () => {
    if (editText.trim()) {
      onEdit(comment.id, editText);
      setIsEditing(false);
    }
  };

  return (
    <div className={`comment ${level > 0 ? 'reply' : ''}`} style={{ marginLeft: `${level * 20}px` }}>
      <div className="comment-header">
        <div className="comment-user-info">
          <img 
            src={comment.profilePicBase64 ? `data:image/jpeg;base64,${comment.profilePicBase64}` : "https://via.placeholder.com/30"} 
            alt="User" 
            className="comment-avatar"
          />
          <div className="comment-user-details">
            <span className="comment-username">{comment.username}</span>
            <span className="comment-timestamp">{new Date(comment.createdAt).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="comment-actions">
          <button 
            className="comment-action-button"
            onClick={() => setIsReplying(!isReplying)}
            title="Reply"
          >
            <FaReply />
          </button>
          
          {currentUserId === comment.userId && (
            <>
              {isEditing ? (
                <>
                  <button 
                    className="comment-action-button"
                    onClick={handleEdit}
                    title="Save"
                  >
                    <FaSave />
                  </button>
                  <button 
                    className="comment-action-button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditText(comment.content);
                    }}
                    title="Cancel"
                  >
                    <FaTimes />
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="comment-action-button"
                    onClick={() => setIsEditing(true)}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="comment-action-button"
                    onClick={() => onDelete(comment.id)}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="comment-content">
        {isEditing ? (
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="edit-comment-input"
            rows="2"
          />
        ) : (
          <p>{comment.content}</p>
        )}
      </div>

      {isReplying && (
        <div className="reply-form">
          <textarea
            placeholder={`Reply to ${comment.username}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="reply-input"
            rows="2"
          />
          <div className="reply-actions">
            <button 
              className="reply-cancel-button"
              onClick={() => {
                setIsReplying(false);
                setReplyText('');
              }}
            >
              Cancel
            </button>
            <button 
              className="reply-submit-button"
              onClick={handleReply}
              disabled={!replyText.trim()}
            >
              Reply
            </button>
          </div>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="replies-container">
          {comment.replies.map(reply => (
            <Comment
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onReply}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment; 