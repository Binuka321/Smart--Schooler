import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, List, Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import axios from 'axios';
import WebSocketService from '../services/WebSocketService';

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Fetch initial notifications
        fetchNotifications();

        // Connect to WebSocket
        WebSocketService.connect(
            () => {
                console.log('Connected to WebSocket');
                const userId = localStorage.getItem('userId');
                if (userId) {
                    WebSocketService.subscribeToNotifications(userId, handleNewNotification);
                }
            },
            (error) => {
                console.error('WebSocket connection error:', error);
            }
        );

        return () => {
            const userId = localStorage.getItem('userId');
            if (userId) {
                WebSocketService.unsubscribeFromNotifications(userId);
            }
            WebSocketService.disconnect();
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('/api/notifications');
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleNewNotification = (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.post(`/api/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, read: true } : n
                )
            );
            setUnreadCount(prev => prev - 1);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const notificationList = (
        <List
            dataSource={notifications}
            renderItem={notification => (
                <List.Item
                    actions={[
                        !notification.read && (
                            <Button
                                type="link"
                                onClick={() => markAsRead(notification.id)}
                            >
                                Mark as read
                            </Button>
                        )
                    ]}
                >
                    <List.Item.Meta
                        title={notification.message}
                        description={new Date(notification.createdAt).toLocaleString()}
                    />
                </List.Item>
            )}
        />
    );

    return (
        <Dropdown overlay={notificationList} trigger={['click']}>
            <Badge count={unreadCount}>
                <BellOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
            </Badge>
        </Dropdown>
    );
};

export default Notification; 