import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Clock, Calendar } from 'lucide-react';
import { useTasks } from '../contexts/TaskContext';
import taskService from '../services/taskService';
import type { InsightsResponse } from '../services/taskService';
import { format, isPast, isToday, isFuture, differenceInDays } from 'date-fns';

const TaskInsights = () => {
 const { state } = useTasks();
  const [backendInsights, setBackendInsights] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const insights = await taskService.getInsights();
        setBackendInsights(insights);
      } catch (error) {
        console.error('Failed to fetch insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const calculateLocalInsights = () => {
    const now = new Date();
    const completedTasks = state.tasks.filter(t => t.completed);
    const activeTasks = state.tasks.filter(t => !t.completed);
    
    const overdueTasks = activeTasks.filter(task => 
      task.dueDate && isPast(new Date(task.dueDate))
    );
    
    const todayTasks = activeTasks.filter(task =>
      task.dueDate && isToday(new Date(task.dueDate))
    );
    
    const upcomingTasks = activeTasks.filter(task =>
      task.dueDate && isFuture(new Date(task.dueDate))
    );
    
    const completionRate = state.tasks.length > 0 
      ? Math.round((completedTasks.length / state.tasks.length) * 100)
      : 0;

    let avgCompletionTime = 0;
    if (completedTasks.length > 0) {
      const totalDays = completedTasks.reduce((sum, task) => {
        const created = new Date(task.createdAt);
        const due = task.dueDate ? new Date(task.dueDate) : new Date();
        return sum + Math.max(0, differenceInDays(due, created));
      }, 0);
      avgCompletionTime = Math.round(totalDays / completedTasks.length);
    }
    return {
      total: state.tasks.length,
      completed: completedTasks.length,
      active: activeTasks.length,
      overdue: overdueTasks.length,
      today: todayTasks.length,
      upcoming: upcomingTasks.length,
      completionRate,
      avgCompletionTime,
    };
  };

  const localInsights = calculateLocalInsights();
  const insights = backendInsights || {
    total_tasks: localInsights.total,
    completed_tasks: localInsights.completed,
    pending_tasks: localInsights.active,
    overdue_tasks: localInsights.overdue,
    tasks_due_today: localInsights.today,
    upcoming_tasks: localInsights.upcoming,
    completion_rate: localInsights.completionRate,
    avg_completion_time: localInsights.avgCompletionTime,
  };

  // Use backend data if available, otherwise use local calculations
  const statCards = [
    {
      title: 'Total Tasks',
      value: insights.total_tasks,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Completed',
      value: insights.completed_tasks,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Overdue',
      value: insights.overdue_tasks,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Due Today',
      value: insights.tasks_due_today,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const priorityDistribution = [
    { label: 'High', value: state.tasks.filter(t => t.priority === 'high').length, color: 'bg-red-500' },
    { label: 'Medium', value: state.tasks.filter(t => t.priority === 'medium').length, color: 'bg-yellow-500' },
    { label: 'Low', value: state.tasks.filter(t => t.priority === 'low').length, color: 'bg-green-500' },
  ];

  const totalPriority = priorityDistribution.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Task Insights</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          {statCards.map((stat) => (
            <div key={stat.title} className="p-4 rounded-xl bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">
                  {stat.title}
                </span>
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
              <span className="text-2xl font-bold text-primary-600">
                {insights.completion_rate}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-600 rounded-full transition-all duration-500"
                style={{ width: `${insights.completion_rate}%` }}
              />
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Priority Distribution</h3>
            <div className="space-y-2">
              {priorityDistribution.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {item.value}
                    </span>
                    {totalPriority > 0 && (
                      <span className="text-xs text-gray-500">
                        ({Math.round((item.value / totalPriority) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {insights.avg_completion_time > 0 && (
            <div className="p-4 bg-primary-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-primary-600" />
                <div>
                  <p className="font-medium text-primary-900">Average Completion</p>
                  <p className="text-sm text-primary-700">
                    {insights.avg_completion_time} days per task
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Productivity Tips */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4">Productivity Tips</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
            <span className="text-sm text-gray-600">
              Complete high-priority tasks first
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
            <span className="text-sm text-gray-600">
              Set realistic due dates
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
            <span className="text-sm text-gray-600">
              Enable reminders for important deadlines
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
            <span className="text-sm text-gray-600">
              Review overdue tasks daily
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TaskInsights;