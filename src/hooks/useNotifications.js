import { useState, useEffect } from 'react';
import { useVestingContract } from './useVestingContract';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const { streams } = useVestingContract();

  useEffect(() => {
    // This would typically connect to a backend or indexer
    // For now, we'll simulate notifications based on stream changes
    const checkForNewNotifications = () => {
      // Check for streams that are about to start or have updates
      // This is a placeholder implementation
    };

    const interval = setInterval(checkForNewNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [streams]);

  const addNotification = (type, title, message) => {
    const newNotification = {
      id: Date.now(),
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  return {
    notifications,
    addNotification,
    markAsRead
  };
}