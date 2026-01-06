import React, { useState } from 'react';
import { PlusCircle, Calendar, Tag, Bell } from 'lucide-react';
import { useTasks } from '../contexts/TaskContext';
import { format } from 'date-fns';

const TaskManager = () => {
  const { dispatch } = useTasks();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: '',
    reminderEnabled: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    const newTask = {
      id: crypto.randomUUID(),
      ...formData,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_TASK', payload: newTask });
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium',
      category: '',
      reminderEnabled: true,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <div className="card animate-slide-in">
      <div className="flex items-center gap-3 mb-6">
        <PlusCircle className="w-6 h-6 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-900">Create New Task</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="What needs to be done?"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Add details about your task..."
            className="input-field min-h-[100px] resize-none"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              Due Date
            </label>
            <input
              type="datetime-local"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4" />
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="input-field"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Work, Personal, Shopping..."
              className="input-field"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Enable Reminder</p>
                <p className="text-sm text-gray-600">Get notified before due date</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="reminderEnabled"
                checked={formData.reminderEnabled}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                peer-checked:after:translate-x-full peer-checked:after:border-white 
                after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                peer-checked:bg-primary-600">
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Add Task
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskManager;