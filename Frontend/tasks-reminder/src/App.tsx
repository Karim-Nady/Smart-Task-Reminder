// import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/providers/AuthContext';
import { TaskProvider } from './contexts/providers/TaskContext';
import { AuthModal } from './components/AuthModal';
import { AppHeader } from './AppHeader';
import { TaskManager } from './components/TaskManager';
import { TaskList } from './components/TaskList';
import { TaskInsights } from './components/TaskInsights';
import {useAuth} from "./hooks//useAuth";

const AppContent: React.FC = () => {
  const { authState } = useAuth();
  // const [showAuthModal, setShowAuthModal] = useState(false);

  // useEffect(() => {
  //   if (!authState.isAuthenticated) {
  //     setShowAuthModal(true);
  //   } else {
  //     setShowAuthModal(false);
  //   }
  // }, [authState.isAuthenticated]);

  return (
    <TaskProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <AppHeader />

          {authState.isAuthenticated ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <TaskManager />
                <TaskList />
              </div>
              <div>
                <TaskInsights />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Please sign in to access your tasks</p>
            </div>
          )}
        </div>
      </div>

      {!authState.isAuthenticated && <AuthModal />}

    </TaskProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
