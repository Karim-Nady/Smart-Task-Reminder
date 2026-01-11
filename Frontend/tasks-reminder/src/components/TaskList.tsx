import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Trash2, Bell, BellOff } from 'lucide-react';
import { taskApi } from '../services/api';
import { useTasks } from '../hooks/useTasks';
import { Toast } from './Toast';
import type { Task } from '../types';

export const TaskList: React.FC = () => {
  const { state, dispatch } = useTasks();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredTasks = state.tasks.filter(task => {
    if (filter === 'active' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return task.title.toLowerCase().includes(searchLower) ||
             task.description.toLowerCase().includes(searchLower) ||
             task.category.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const toggleTask = async (task: Task) => {
    try {
      const updated = await taskApi.updateTask(task.id, { ...task, completed: !task.completed });
      dispatch({ type: 'UPDATE_TASK', payload: updated });
      showToast(updated.completed ? 'Task completed!' : 'Task reopened');
    } catch (err) {
      if(err instanceof Error){
        showToast(err.message, 'error');
      }
      else{
        showToast('Failed to update task', 'error');
      }
    }
  };

  const deleteTask = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskApi.deleteTask(id);
      dispatch({ type: 'DELETE_TASK', payload: id });
      showToast('Task deleted');
    } catch (err) {
      if(err instanceof Error){
        showToast(err.message, 'error');
      }
      else{
        showToast('Failed to update task', 'error');
      }
    }
  };

  const toggleReminder = async (task: Task) => {
    try {
      const updated = await taskApi.updateTask(task.id, { ...task, reminderEnabled: !task.reminderEnabled });
      dispatch({ type: 'UPDATE_TASK', payload: updated });
      showToast(updated.reminderEnabled ? 'Reminder enabled' : 'Reminder disabled');
    } catch (err) {
      if(err instanceof Error){
        showToast(err.message, 'error');
      }
      else{
        showToast('Failed to update task', 'error');
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const isOverdue = (dateStr: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  if (state.loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading tasks...</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="bg-red-50 rounded-2xl border border-red-200 p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
        <p className="text-red-800 font-medium mb-2">Error loading tasks</p>
        <p className="text-red-600 text-sm">{state.error}</p>
      </div>
    );
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Tasks</h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:w-64"
            />
            
            <div className="flex gap-2">
              {(['all', 'active', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === f
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No tasks found</p>
            <p className="text-gray-400">Create your first task to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`group p-5 rounded-xl border transition-all hover:shadow-md ${
                  task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleTask(task)}
                    className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className={`text-lg font-semibold ${task.completed && 'line-through text-gray-500'}`}>
                        {task.title}
                      </h3>
                      
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      
                      {task.category && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {task.category}
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span className={isOverdue(task.dueDate) && !task.completed ? 'text-red-600' : ''}>
                            {formatDate(task.dueDate)}
                          </span>
                          {isOverdue(task.dueDate) && !task.completed && (
                            <span className="flex items-center gap-1 text-red-600">
                              <AlertCircle className="w-4 h-4" />
                              Overdue
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleReminder(task)}
                      className={`p-2 rounded-lg transition-colors ${
                        task.reminderEnabled
                          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={task.reminderEnabled ? 'Disable reminder' : 'Enable reminder'}
                    >
                      {task.reminderEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                    </button>
                    
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredTasks.length} of {state.tasks.length} tasks</span>
            <span>{state.tasks.filter(t => t.completed).length} completed</span>
          </div>
        </div>
      </div>
    </>
  );
};