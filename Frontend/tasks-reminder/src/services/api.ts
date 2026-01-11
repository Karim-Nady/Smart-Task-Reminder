import axios from 'axios';
import type { Task } from '../types';
import type { BackendTask } from '../types/mapped';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - automatically add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Data transformation utilities
const transformToFrontend = (backendTask: BackendTask): Task => ({
  id: backendTask.id,
  title: backendTask.title,
  description: backendTask.description || '',
  dueDate: backendTask.due_date || '',
  priority: ['', 'low', 'medium', 'high'][backendTask.priority] as 'low' | 'medium' | 'high',
  category: backendTask.category || 'General',
  completed: backendTask.completed,
  reminderEnabled: backendTask.reminder_enabled,
  status: backendTask.status,
  createdAt: backendTask.created_at,
});

const transformToBackend = (frontendTask: Partial<Task>) => ({
  title: frontendTask.title,
  description: frontendTask.description || '',
  due_date: frontendTask.dueDate || null,
  priority: { low: 1, medium: 2, high: 3 }[frontendTask.priority || 'medium'],
  category: frontendTask.category || 'General',
  completed: frontendTask.completed ?? false,
  reminder_enabled: frontendTask.reminderEnabled ?? true,
  status: frontendTask.completed ? 'done' : 'pending',
});

// Auth API
export const authApi = {
  async register(email: string, password: string, username: string) {
    const { data } = await axiosInstance.post('/auth/register', {
      email,
      password,
      username,
    });
    return data;
  },

  async login(email: string, password: string) {
    const { data } = await axiosInstance.post('/auth/login', {
      email,
      password,
    });
    return data;
  },
};

// Task API
export const taskApi = {
  async fetchTasks(): Promise<Task[]> {
    const { data } = await axiosInstance.get('/tasks', {
      params: { limit: 1000 },
    });
    return data.map(transformToFrontend);
  },

  async createTask(task: Partial<Task>): Promise<Task> {
    const { data } = await axiosInstance.post('/tasks', transformToBackend(task));
    return transformToFrontend(data);
  },

  async updateTask(id: number, task: Partial<Task>): Promise<Task> {
    const { data } = await axiosInstance.put(`/tasks/${id}`, transformToBackend(task));
    return transformToFrontend(data);
  },

  async deleteTask(id: number): Promise<void> {
    await axiosInstance.delete(`/tasks/${id}`);
  },
};