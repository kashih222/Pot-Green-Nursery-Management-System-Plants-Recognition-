import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import { useAuth } from '../components/auth/AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { token, currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    if (!token || !currentUser || currentUser.role !== 'admin') {
      console.log('Skipping notification fetch:', { 
        hasToken: !!token, 
        hasUser: !!currentUser, 
        userRole: currentUser?.role 
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching notifications with token:', token.substring(0, 10) + '...');
      
      const response = await axios.get('http://localhost:8020/api/admin/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Notifications response:', response.data);

      if (response.data?.success) {
        const fetchedNotifications = response.data.notifications || [];
        console.log('Setting notifications:', fetchedNotifications);
        setNotifications(fetchedNotifications);
        setUnreadCount(fetchedNotifications.filter(n => !n.read).length);
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    if (!token || !currentUser || currentUser.role !== 'admin') return;

    try {
      console.log('Marking notification as read:', notificationId);
      
      const response = await axios.put(
        `http://localhost:8020/api/admin/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Mark as read response:', response.data);

      if (response.data?.success) {
        setNotifications(prev =>
          prev.map(notification =>
            notification._id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError(`Failed to mark notification as read: ${error.message}`);
    }
  };

  const removeNotification = async (notificationId) => {
    if (!token || !currentUser || currentUser.role !== 'admin') return;

    try {
      console.log('Removing notification:', notificationId);
      
      const response = await axios.delete(
        `http://localhost:8020/api/admin/notifications/${notificationId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Remove notification response:', response.data);

      if (response.data?.success) {
        setNotifications(prev =>
          prev.filter(notification => notification._id !== notificationId)
        );
        setUnreadCount(prev =>
          Math.max(0, prev - (notifications.find(n => n._id === notificationId)?.read ? 0 : 1))
        );
      }
    } catch (error) {
      console.error('Error removing notification:', error);
      setError(`Failed to remove notification: ${error.message}`);
    }
  };

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (token && currentUser && currentUser.role === 'admin') {
      console.log('Setting up notification polling for admin user');
      fetchNotifications(); // Initial fetch
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token, currentUser]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        removeNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 
