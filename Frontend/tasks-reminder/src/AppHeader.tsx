import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuth } from './hooks/useAuth';

export const AppHeader: React.FC = () => {
  const { authState, authDispatch } = useAuth();

  const handleLogout = () => {
    authDispatch({ type: 'LOGOUT' });
  };

  return (
    <header className="text-center mb-12">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Smart Task Reminder</h1>
          <p className="text-gray-600">Stay organized and never miss a deadline</p>
        </div>
        
        {authState.isAuthenticated && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <User className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">{authState.user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};