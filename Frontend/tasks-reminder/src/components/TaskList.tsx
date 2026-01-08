import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Trash2, Bell, BellOff } from 'lucide-react';
import { useTasks } from '../contexts/TaskContext';
import { format, formatDistanceToNow, isPast, isToday } from 'date-fns';
import clsx from 'clsx';

const TaskList = () => {
  const { state, deleteTask, toggleTaskCompletion, toggleReminder } = useTasks();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [search, setSearch] = useState('');

  const filteredTasks = state.tasks.filter(task => {
    if (filter === 'active' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    
    if (search) {
      return task.title.toLowerCase().includes(search.toLowerCase()) ||
             task.description.toLowerCase().includes(search.toLowerCase()) ||
             task.category.toLowerCase().includes(search.toLowerCase());
    }
    
    return true;
  });

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id);
    }
  };

  const handleToggleCompletion = async (id: string, completed: boolean) => {
    await toggleTaskCompletion(id, !completed);
  };

  const handleToggleReminder = async (id: string, enabled: boolean) => {
    await toggleReminder(id, !enabled);
  };


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDueDateStatus = (dueDate: string) => {
    if (!dueDate) return 'text-gray-500';
    
    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date)) return 'text-red-600';
    if (isToday(date)) return 'text-orange-600';
    return 'text-gray-600';
  };

  return (
    <div className="card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Tasks</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field md:w-64"
          />
          
          <div className="flex gap-2">
            {(['all', 'active', 'completed'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={clsx(
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  filter === filterType
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
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
              className={clsx(
                'group p-5 rounded-xl border transition-all duration-200 hover:shadow-md',
                task.completed
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-white border-gray-200'
              )}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => handleToggleCompletion(task.id, task.completed)}
                  className={clsx(
                    'mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                    task.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 hover:border-primary-500'
                  )}
                >
                  {task.completed && (
                    <CheckCircle className="w-4 h-4 text-white" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className={clsx(
                      'text-lg font-semibold truncate',
                      task.completed && 'line-through text-gray-500'
                    )}>
                      {task.title}
                    </h3>
                    
                    <span className={clsx(
                      'px-3 py-1 rounded-full text-xs font-medium',
                      getPriorityColor(task.priority)
                    )}>
                      {task.priority}
                    </span>
                    
                    {task.category && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {task.category}
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span className={getDueDateStatus(task.dueDate)}>
                          {format(new Date(task.dueDate), 'MMM d, yyyy h:mm a')}
                        </span>
                        {isPast(new Date(task.dueDate)) && !task.completed && (
                          <span className="flex items-center gap-1 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            Overdue
                          </span>
                        )}
                      </div>
                    )}
                    
                    <span className="text-gray-400">
                      Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleToggleReminder(task.id, !task.reminderEnabled)}
                    className={clsx(
                      'p-2 rounded-lg transition-colors',
                      task.reminderEnabled
                        ? 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                    title={task.reminderEnabled ? 'Disable reminder' : 'Enable reminder'}
                  >
                    {task.reminderEnabled ? (
                      <Bell className="w-5 h-5" />
                    ) : (
                      <BellOff className="w-5 h-5" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDeleteTask(task.id)}
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
          <span>
            Showing {filteredTasks.length} of {state.tasks.length} tasks
          </span>
          <span>
            {state.tasks.filter(t => t.completed).length} completed
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskList;