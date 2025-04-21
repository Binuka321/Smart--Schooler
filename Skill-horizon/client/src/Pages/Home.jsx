import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../util/auth';
import './Home.css';
import Swal from 'sweetalert2';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [activeCommentPost, setActiveCommentPost] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/posts');
      setPosts(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = getToken();
      if (!token) {
        Swal.fire({
          title: 'Error!',
          text: 'You need to be logged in to like posts',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        return;
      }

      // Toggle like status
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          const isLiked = post.liked || false;
          return { ...post, liked: !isLiked, likes: isLiked ? (post.likes || 1) - 1 : (post.likes || 0) + 1 };
        }
        return post;
      });
      setPosts(updatedPosts);

      // Send like to server
      await axios.post(`http://localhost:8080/api/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire({
        title: 'Success!',
        text: 'Post liked successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Error liking post:', err);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to like post. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleCommentTextChange = (postId, value) => {
    setCommentText(prevState => ({
      ...prevState,
      [postId]: value
    }));
  };

  const handleComment = async (postId) => {
    if (!commentText[postId]?.trim()) return;

    try {
      const token = getToken();
      if (!token) {
        Swal.fire({
          title: 'Error!',
          text: 'You need to be logged in to comment',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        return;
      }

      // Add comment to UI
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          const newComment = {
            id: Date.now().toString(),
            text: commentText[postId],
            userId: 'current-user', // This would come from the server
            username: 'You', // This would come from the server
            createdAt: new Date().toISOString()
          };
          return {
            ...post,
            comments: [...(post.comments || []), newComment]
          };
        }
        return post;
      });
      setPosts(updatedPosts);

      // Send comment to server
      await axios.post(`http://localhost:8080/api/posts/${postId}/comment`, 
        { text: commentText[postId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Clear comment input
      setCommentText(prevState => ({ ...prevState, [postId]: '' }));
      setActiveCommentPost(null);

      Swal.fire({
        title: 'Success!',
        text: 'Comment added successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Error commenting on post:', err);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to add comment. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleShare = (postId) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      Swal.fire({
        title: 'Success!',
        text: 'Post link copied to clipboard',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }).catch(() => {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to copy link to clipboard',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    });
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchPosts}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Home</h1>
        <div className="home-actions">
          <button className="refresh-button" onClick={fetchPosts}>
            Refresh
          </button>
        </div>
      </div>

      <div className="posts-container">
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts yet. Be the first to post!</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="post-user-info">
                  <img 
                    src={post.userProfilePic ? `data:image/jpeg;base64,${post.userProfilePic}` : "https://via.placeholder.com/40"} 
                    alt="User" 
                    className="post-user-avatar"
                  />
                  <div className="post-user-details">
                    <h3>{post.username || "User"}</h3>
                    <span className="post-timestamp">{formatDate(post.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="post-content">
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
              </div>

              <div className="post-stats">
                <span>{post.likes || 0} likes</span>
                <span>{post.comments ? post.comments.length : 0} comments</span>
              </div>

              <div className="post-actions">
                <button 
                  className={`action-button ${post.liked ? 'liked' : ''}`}
                  onClick={() => handleLike(post.id)}
                >
                  <i className="fas fa-thumbs-up"></i> Like
                </button>
                <button 
                  className="action-button"
                  onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                >
                  <i className="fas fa-comment"></i> Comment
                </button>
                <button 
                  className="action-button"
                  onClick={() => handleShare(post.id)}
                >
                  <i className="fas fa-share"></i> Share
                </button>
              </div>

              {activeCommentPost === post.id && (
                <div className="comment-section">
                  <div className="comment-input-container">
                    <textarea
                      placeholder="Write a comment..."
                      value={commentText[post.id] || ''}
                      onChange={(e) => handleCommentTextChange(post.id, e.target.value)}
                      className="comment-input"
                    />
                    <button 
                      className="comment-submit-button"
                      onClick={() => handleComment(post.id)}
                      disabled={!commentText[post.id]?.trim()}
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}

              {post.comments && post.comments.length > 0 && (
                <div className="comments-container">
                  {post.comments.map(comment => (
                    <div key={comment.id} className="comment">
                      <div className="comment-user-info">
                        <img 
                          src={comment.userProfilePic ? `data:image/jpeg;base64,${comment.userProfilePic}` : "https://via.placeholder.com/30"} 
                          alt="User" 
                          className="comment-user-avatar"
                        />
                        <div className="comment-content">
                          <h4>{comment.username || "User"}</h4>
                          <p>{comment.text}</p>
                          <span className="comment-timestamp">{formatDate(comment.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
