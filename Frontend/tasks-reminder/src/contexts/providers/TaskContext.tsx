import {useReducer, useEffect, useCallback } from 'react';
import type {ReactNode} from 'react';
import type {TaskState, TaskAction} from '../../types';
import { taskApi } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { TaskContext } from '../tuskContext';

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

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const { authState } = useAuth();
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    loading: true,
    error: null,
  });

  const refreshTasks = useCallback(async () => {
    if (!authState.isAuthenticated) {
      dispatch({ type: 'SET_TASKS', payload: [] });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const tasks = await taskApi.fetchTasks();
      dispatch({ type: 'SET_TASKS', payload: tasks });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }, [authState.isAuthenticated]);

  useEffect(() => {
    refreshTasks();
  }, [authState.isAuthenticated, refreshTasks]);

  return (
    <TaskContext.Provider value={{ state, dispatch, refreshTasks }}>
      {children}
    </TaskContext.Provider>
  );
};

