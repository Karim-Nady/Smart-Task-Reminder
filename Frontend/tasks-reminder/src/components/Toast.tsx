import React from 'react';
interface ToastProps {
  message: string;
  type?: 'success' | 'error';
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => (
  <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  } text-white font-medium animate-slide-in z-50`}>
    {message}
  </div>
);