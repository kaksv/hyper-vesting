import { useState, useEffect } from 'react';
import { useVestingContract } from '../hooks/useVestingContract';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationCenter() {
  const { streams } = useVestingContract();
  const { notifications, markAsRead } = useNotifications();
  const [filter, setFilter] = useState('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    return notification.type === filter;
  });

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>
      
      <div className="mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Notifications</option>
          <option value="claim">Token Claims</option>
          <option value="create">Stream Created</option>
          <option value="cancel">Stream Cancelled</option>
        </select>
      </div>
      
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No notifications</p>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`p-3 rounded-md border ${
                notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
                
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}