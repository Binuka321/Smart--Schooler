import React, { useState, useEffect } from 'react';
import { FaBell, FaComment, FaHeart } from 'react-icons/fa';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch notifications when component mounts
    fetchNotifications();
    
    // Set up WebSocket connection for real-time notifications
    const ws = new WebSocket('ws://localhost:8080/ws/notifications');
    
    ws.onmessage = (event) => {
      const newNotification = JSON.parse(event.data);
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    return () => ws.close();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'comment':
        return <FaComment className="notification-icon" />;
      case 'like':
        return <FaHeart className="notification-icon" />;
      default:
        return <FaBell className="notification-icon" />;
    }
  };

  return (
    <div className="notifications-container">
      <div 
        className="notification-bell" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaBell className="bell-icon" />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>
      
      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button 
                className="mark-all-read"
                onClick={() => notifications.forEach(n => markAsRead(n.id))}
              >
                Mark all as read
              </button>
            )}
          </div>
          
          {notifications.length === 0 ? (
            <div className="no-notifications">No notifications yet</div>
          ) : (
            <div className="notifications-list">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  {getNotificationIcon(notification.type)}
                  <div className="notification-content">
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications; 