import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

const API_BASE_URL = 'http://localhost:8000';

export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  completed: boolean;
  reminderEnabled: boolean;
  status: string;
  createdAt: string;
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

type TaskAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

interface TaskContextType {
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const { token, isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    loading: true,
    error: null,
  });

  const refreshTasks = async () => {
    if (!token) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const res = await fetch(`${API_BASE_URL}/tasks?limit=1000`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error('Failed to fetch tasks');
      
      const data = await res.json();
      const tasks = data.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description || '',
        dueDate: t.due_date || '',
        priority: ['', 'low', 'medium', 'high'][t.priority] as 'low' | 'medium' | 'high',
        category: t.category || 'General',
        completed: t.completed,
        reminderEnabled: t.reminder_enabled,
        status: t.status,
        createdAt: t.created_at,
      }));
      
      dispatch({ type: 'SET_TASKS', payload: tasks });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshTasks();
    }
  }, [token, isAuthenticated]);

  return (
    <TaskContext.Provider value={{ state, dispatch, refreshTasks }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider');
  return context;
};