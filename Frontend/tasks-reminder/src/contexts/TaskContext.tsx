import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type {ReactNode} from 'react';
import toast from 'react-hot-toast';
import taskService from '../services/taskService';
import type { TaskResponse, TaskCreateData } from '../services/taskService';
import type { Task, TaskState, TaskAction } from '../types/task';

// Map backend response to frontend format
// Map backend response to frontend format
const mapBackendToFrontend = (task: TaskResponse): Task => ({
  id: task.id.toString(),
  title: task.title,
  description: task.description || '',
  dueDate: task.due_date || new Date().toISOString(),
  priority: task.priority as 'low'| 'medium'| 'high',
  category: task.category || 'General',
  completed: task.status === 'completed',
  reminderEnabled: task.reminder_enabled ?? true,
  createdAt: task.created_at,
});

// Map frontend format to backend format
const mapFrontendToBackend = (task: Partial<Task>): Partial<TaskCreateData> => ({
  title: task.title,
  description: task.description || '',
  due_date: task.dueDate,
  priority: task.priority,
  category: task.category || 'General',
  reminder_enabled: task.reminderEnabled ?? true,
  status: task.completed ? 'completed' : 'pending',
});
const TaskContext = createContext<{
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
} | undefined>(undefined);

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
      };
    
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        ),
      };
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id 
            ? { ...task, completed: !task.completed }
            : task
        ),
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    
    default:
      return state;
  }
};

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(taskReducer, { 
    tasks: [], 
    isLoading: false, 
    error: null 
  });

  // Fetch all tasks from backend
  const fetchTasks = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const tasks = await taskService.getTasks();
      const mappedTasks = tasks.map(mapBackendToFrontend);
      dispatch({ type: 'SET_TASKS', payload: mappedTasks });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tasks';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error('Failed to load tasks');
      console.error('Error fetching tasks:', error);
      
      // Fallback to localStorage if backend fails
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        dispatch({ type: 'SET_TASKS', payload: tasks });
        toast('Using offline data', { icon: '⚠️' });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Create task with backend API
  const createTask = async (taskData: Partial<Task>) => {
    try {
      const backendData = mapFrontendToBackend(taskData);
      const response = await taskService.createTask(backendData as TaskCreateData);
      const newTask = mapBackendToFrontend(response);
      
      dispatch({ type: 'ADD_TASK', payload: newTask });
      toast.success('Task created successfully!');
      return newTask;
    } catch (error) {
      toast.error('Failed to create task');
      console.error('Error creating task:', error);
      
      // Fallback: Create task locally
      const newTask: Task = {
        id: crypto.randomUUID(),
        ...taskData as Omit<Task, 'id'>,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_TASK', payload: newTask });
      return newTask;
    }
  };

  // Update task with backend API
  const updateTask = async (id: string, taskData: Partial<Task>) => {
    try {
      const backendData = mapFrontendToBackend(taskData);
      const response = await taskService.updateTask(parseInt(id), backendData);
      const updatedTask = mapBackendToFrontend(response);
      
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      toast.success('Task updated successfully!');
      return updatedTask;
    } catch (error) {
      toast.error('Failed to update task');
      console.error('Error updating task:', error);
      
      // Fallback: Update task locally
      const existingTask = state.tasks.find(t => t.id === id);
      if (existingTask) {
        const updatedTask = { ...existingTask, ...taskData };
        dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
        return updatedTask;
      }
    }
  };

  // Delete task with backend API
  const deleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(parseInt(id));
      dispatch({ type: 'DELETE_TASK', payload: id });
      toast.success('Task deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete task');
      console.error('Error deleting task:', error);
      
      // Fallback: Delete task locally
      dispatch({ type: 'DELETE_TASK', payload: id });
    }
  };

  // Toggle task completion
  const toggleTaskCompletion = async (id: string, completed: boolean) => {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
      await updateTask(id, { ...task, completed });
    }
  };

  // Toggle reminder
  const toggleReminder = async (id: string, enabled: boolean) => {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
      await updateTask(id, { ...task, reminderEnabled: enabled });
    }
  };

  // Load tasks on initial mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Check for reminders
  useEffect(() => {
    const checkReminders = async () => {
      try {
        const reminders = await taskService.getReminders();
        reminders.forEach(task => {
          if (!task.status || task.status !== 'completed') {
            const frontendTask = mapBackendToFrontend(task);
            const dueDate = new Date(frontendTask.dueDate);
            const now = new Date();
            const hoursDiff = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
            
            if (hoursDiff <= 24 && hoursDiff > 0) {
              toast(
                `⏰ Reminder: "${frontendTask.title}" is due in ${Math.ceil(hoursDiff)} hours!`,
                { duration: 6000, icon: '🔔' }
              );
            }
          }
        });
      } catch (error) {
        console.error('Error checking reminders:', error);
        // Fallback to local reminder check
        const now = new Date();
        state.tasks.forEach(task => {
          if (task.reminderEnabled && !task.completed && task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const hoursDiff = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
            
            if (hoursDiff <= 24 && hoursDiff > 0) {
              toast(
                `⏰ Reminder: "${task.title}" is due in ${Math.ceil(hoursDiff)} hours!`,
                { duration: 6000, icon: '🔔' }
              );
            }
          }
        });
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [state.tasks]);

  return (
    <TaskContext.Provider value={{
      state,
      dispatch,
      isLoading: state.isLoading,
      error: state.error,
      fetchTasks,
      createTask,
      updateTask,
      deleteTask,
      toggleTaskCompletion,
      toggleReminder,
    }}>
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