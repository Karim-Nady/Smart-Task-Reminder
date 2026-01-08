import React from 'react';
import { Toaster } from 'react-hot-toast';
import TaskManager from './components/TaskManager';
import TaskInsights from './components/TaskInsights';
import TaskList from './components/TaskList';
import { TaskProvider } from './contexts/TaskContext';
import './styles/App.css';

function App() {
  return (
    <TaskProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        
        <div className="container mx-auto px-4 py-8">
          <header className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Task Reminder Pro
            </h1>
            <p className="text-gray-600">
              Stay organized and never miss a deadline again
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <TaskManager />
              <TaskList />
            </div>
            
            <div>
              <TaskInsights />
            </div>
          </div>
        </div>
      </div>
    </TaskProvider>
  );
}

export default App;