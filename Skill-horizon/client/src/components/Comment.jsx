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
  const [editInput, setEditInput] = useState(comment.content);

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText('');
      setIsReplying(false);
    }
  };

  const handleEdit = () => {
    if (editInput.trim()) {
      // If this is a reply (has parentCommentId), pass true for isReply and the parent comment ID
      if (comment.parentCommentId) {
        onEdit(comment.id, editInput, true, comment.parentCommentId);
      } else {
        onEdit(comment.id, editInput, false);
      }
      setEditInput('');
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    // If this is a reply (has parentCommentId), pass true for isReply and the parent comment ID
    if (comment.parentCommentId) {
      onDelete(comment.id, true, comment.parentCommentId);
    } else {
      onDelete(comment.id, false);
    }
  };

  return (
    <div className={`comment ${level > 0 ? 'reply' : ''}`} style={{ marginLeft: `${level * 20}px` }}>
      <div className="comment-header">
        <div className="comment-user-info">
          <img 
            src={comment.userProfilePic ? `data:image/jpeg;base64,${comment.userProfilePic}` : "https://via.placeholder.com/30"} 
            alt="User" 
            className="comment-avatar"
          />
          <div className="comment-user-details">
            <span className="comment-username">{comment.username}</span>
            <span className="comment-timestamp">{new Date(comment.timestamp).toLocaleString()}</span>
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
                      setEditInput(comment.content);
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
                    onClick={handleDelete}
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
            value={editInput}
            onChange={(e) => setEditInput(e.target.value)}
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
              onEdit={(commentId, content) => onEdit(commentId, content, true, comment.id)}
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