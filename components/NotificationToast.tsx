import React, { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';

export const NotificationToast: React.FC = () => {
  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe(({ message, type }) => {
      setNotification({ message, type: type || 'info' });
      setVisible(true);
      
      // Auto hide after 3 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    });

    return unsubscribe;
  }, []);

  if (!visible || !notification) return null;

  return (
    <div className="fixed top-20 right-4 z-[90] pointer-events-none">
      <div className="bg-white dark:bg-gray-800 border-l-4 border-indigo-500 rounded shadow-lg p-4 flex items-center pr-8 max-w-sm pointer-events-auto transform transition-all duration-300 animate-[slideIn_0.3s_ease-out]">
        <div className="text-indigo-500 mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Notification</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{notification.message}</p>
        </div>
        <button 
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
