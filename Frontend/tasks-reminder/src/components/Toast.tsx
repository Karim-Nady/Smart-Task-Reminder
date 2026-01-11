import React from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
}

const Toast = ({ message, type = 'success' }: ToastProps) => (
  <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  } text-white font-medium animate-slide-in z-50`}>
    {message}
    <style>{`
      @keyframes slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      .animate-slide-in {
        animation: slide-in 0.3s ease-out;
      }
    `}</style>
  </div>
);

export default Toast;