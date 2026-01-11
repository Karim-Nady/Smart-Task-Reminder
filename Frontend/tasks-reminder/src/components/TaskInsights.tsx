import React from 'react';
import { CheckCircle, Calendar, TrendingUp, AlertTriangle, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../contexts/TaskContext';
import NotificationDropdown from './NotificationDropdown';

const TaskInsights = () => {
  const { logout } = useAuth();
  const { state } = useTasks();

  const calculateInsights = () => {
    const now = new Date();
    const completedTasks = state.tasks.filter(t => t.completed);
    const activeTasks = state.tasks.filter(t => !t.completed);
    
    const overdueTasks = activeTasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < now
    );
    
    const todayTasks = activeTasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate.toDateString() === now.toDateString();
    });
    
    const completionRate = state.tasks.length > 0 
      ? Math.round((completedTasks.length / state.tasks.length) * 100)
      : 0;
    
    return {
      total: state.tasks.length,
      completed: completedTasks.length,
      active: activeTasks.length,
      overdue: overdueTasks.length,
      today: todayTasks.length,
      completionRate,
    };
  };

  const insights = calculateInsights();

  const statCards = [
    { title: 'Total Tasks', value: insights.total, icon: TrendingUp, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Completed', value: insights.completed, icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
    { title: 'Overdue', value: insights.overdue, icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' },
    { title: 'Due Today', value: insights.today, icon: Calendar, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  ];

  const priorityDist = [
    { label: 'High', value: state.tasks.filter(t => t.priority === 'high').length, color: 'bg-red-500' },
    { label: 'Medium', value: state.tasks.filter(t => t.priority === 'medium').length, color: 'bg-yellow-500' },
    { label: 'Low', value: state.tasks.filter(t => t.priority === 'low').length, color: 'bg-green-500' },
  ];

  const total = priorityDist.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Task Insights</h2>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.title} className="p-4 rounded-xl bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{stat.title}</span>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-900">Completion Rate</span>
            <span className="text-2xl font-bold text-blue-600">{insights.completionRate}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${insights.completionRate}%` }}
            />
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-3">Priority Distribution</h3>
          <div className="space-y-2">
            {priorityDist.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  {total > 0 && (
                    <span className="text-xs text-gray-500">
                      ({Math.round((item.value / total) * 100)}%)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <NotificationDropdown />
        </div>
      </div>
    </div>
  );
};

export default TaskInsights;