import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import type { Task, TaskState, TaskAction } from '../types/task';

const TaskContext = createContext<{
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
} | undefined>(undefined);

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'ADD_TASK':
      toast.success('Task added successfully!');
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };
    
    case 'UPDATE_TASK':
      toast.success('Task updated successfully!');
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        ),
      };
    
    case 'DELETE_TASK':
      toast.success('Task deleted successfully!');
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload 
            ? { ...task, completed: !task.completed }
            : task
        ),
      };
    
    case 'SET_REMINDER':
      toast.success('Reminder set!');
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? { ...task, reminderEnabled: action.payload.enabled }
            : task
        ),
      };
    
    default:
      return state;
  }
};

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(taskReducer, { tasks: [] });

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      const tasks = JSON.parse(savedTasks);
      dispatch({ type: 'LOAD_TASKS', payload: tasks });
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(state.tasks));
  }, [state.tasks]);

  // Check for reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      state.tasks.forEach(task => {
        if (task.reminderEnabled && !task.completed && task.dueDate) {
          const dueDate = new Date(task.dueDate);
          const timeDiff = dueDate.getTime() - now.getTime();
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          
          if (hoursDiff <= 24 && hoursDiff > 0) {
            toast(
              `⏰ Reminder: "${task.title}" is due in ${Math.ceil(hoursDiff)} hours!`,
              { duration: 6000, icon: '🔔' }
            );
          }
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [state.tasks]);

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};