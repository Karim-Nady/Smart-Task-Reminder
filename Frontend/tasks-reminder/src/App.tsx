import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { TaskProvider } from './contexts/TaskContext';
import AuthModal from './components/AuthModal';
import TaskManager from './components/TaskManager';
import TaskList from './components/TaskList';
import TaskInsights from './components/TaskInsights';

export default function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <header className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Smart Task Reminder
              </h1>
              <p className="text-gray-600">
                Stay organized and never miss a deadline
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <TaskManager />
                <TaskList />
              </div>
              <div>
                <TaskInsights />
              </div>
            </div>
          </div>
        </div>

        <AuthModal />
      </TaskProvider>
    </AuthProvider>
  );
}