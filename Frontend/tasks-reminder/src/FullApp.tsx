import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Trash2, Bell, BellOff, PlusCircle, Calendar, Tag, TrendingUp, AlertTriangle, X, LogOut, User } from 'lucide-react';
import NotificationDropdown from './components/NotificationDropdown';

// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// Types
interface Task {
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

interface AuthState {
  token: string | null;
  user: { id: number; email: string; username: string } | null;
  isAuthenticated: boolean;
}

type TaskAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { token: string; user: any } }
  | { type: 'LOGOUT' };

// Data transformation utilities
const transformToFrontend = (backendTask: any): Task => ({
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
const authApi = {
  async register(email: string, password: string, username: string) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Registration failed');
    }
    return await res.json();
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Login failed');
    }
    return await res.json();
  },
};

// Task API Service with Auth
const createApi = (token: string | null) => ({
  async fetchTasks(): Promise<Task[]> {
    const res = await fetch(`${API_BASE_URL}/tasks?limit=1000`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to fetch tasks');
    const data = await res.json();
    return data.map(transformToFrontend);
  },

  async createTask(task: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(transformToBackend(task)),
    });
    if (!res.ok) throw new Error('Failed to create task');
    const data = await res.json();
    return transformToFrontend(data);
  },

  async updateTask(id: number, task: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(transformToBackend(task)),
    });
    if (!res.ok) throw new Error('Failed to update task');
    const data = await res.json();
    return transformToFrontend(data);
  },

  async deleteTask(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to delete task');
  },
});

// Toast notifications
const Toast = ({ message, type = 'success' }: { message: string; type?: 'success' | 'error' }) => (
  <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  } text-white font-medium animate-slide-in z-50`}>
    {message}
  </div>
);

// Auth Context
const AuthContext = createContext<{
  authState: AuthState;
  authDispatch: React.Dispatch<AuthAction>;
} | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        token: null,
        user: null,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

// Task Context
const TaskContext = createContext<{
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
  refreshTasks: () => Promise<void>;
} | undefined>(undefined);

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

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, authDispatch] = useReducer(authReducer, {
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    isAuthenticated: !!localStorage.getItem('token'),
  });

  useEffect(() => {
    if (authState.token) {
      localStorage.setItem('token', authState.token);
      localStorage.setItem('user', JSON.stringify(authState.user));
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [authState]);

  return (
    <AuthContext.Provider value={{ authState, authDispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const { authState } = useAuth();
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    loading: true,
    error: null,
  });

  const refreshTasks = async () => {
    if (!authState.isAuthenticated) {
      dispatch({ type: 'SET_TASKS', payload: [] });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const api = createApi(authState.token);
      const tasks = await api.fetchTasks();
      dispatch({ type: 'SET_TASKS', payload: tasks });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: (err as Error).message });
    }
  };

  useEffect(() => {
    refreshTasks();
  }, [authState.isAuthenticated]);

  return (
    <TaskContext.Provider value={{ state, dispatch, refreshTasks }}>
      {children}
    </TaskContext.Provider>
  );
};

const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider');
  return context;
};

// Auth Modal Component
const AuthModal = ({ onClose }: { onClose?: () => void }) => {
  const { authDispatch } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await authApi.login(formData.email, formData.password);
        authDispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { token: data.access_token, user: data.user } 
        });
        onClose?.();
      } else {
        await authApi.register(formData.email, formData.password, formData.username);
        const data = await authApi.login(formData.email, formData.password);
        authDispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { token: data.access_token, user: data.user } 
        });
        onClose?.();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to access your tasks' : 'Sign up to get started'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Header Component with User Info
const AppHeader = () => {
  const { authState, authDispatch } = useAuth();

  const handleLogout = () => {
    authDispatch({ type: 'LOGOUT' });
  };

  return (
    <header className="text-center mb-12">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Smart Task Reminder</h1>
          <p className="text-gray-600">Stay organized and never miss a deadline</p>
        </div>
        
        {authState.isAuthenticated && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <User className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">{authState.user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

// TaskManager Component
const TaskManager = () => {
  const { authState } = useAuth();
  const { dispatch } = useTasks();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: '',
    reminderEnabled: true,
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      showToast('Please enter a task title', 'error');
      return;
    }

    try {
      const api = createApi(authState.token);
      const newTask = await api.createTask({
        ...formData,
        completed: false,
      });
      dispatch({ type: 'ADD_TASK', payload: newTask });
      showToast('Task created successfully!');
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        category: '',
        reminderEnabled: true,
      });
    } catch (err) {
      showToast('Failed to create task', 'error');
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <PlusCircle className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Create New Task</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What needs to be done?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add details..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </label>
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4" />
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Work, Personal, Shopping..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.reminderEnabled}
                  onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Enable Reminder</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <PlusCircle className="w-5 h-5" />
              Add Task
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// TaskList Component
const TaskList = () => {
  const { authState } = useAuth();
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
      const api = createApi(authState.token);
      const updated = await api.updateTask(task.id, { ...task, completed: !task.completed });
      dispatch({ type: 'UPDATE_TASK', payload: updated });
      showToast(updated.completed ? 'Task completed!' : 'Task reopened');
    } catch (err) {
      showToast('Failed to update task', 'error');
    }
  };

  const deleteTask = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const api = createApi(authState.token);
      await api.deleteTask(id);
      dispatch({ type: 'DELETE_TASK', payload: id });
      showToast('Task deleted');
    } catch (err) {
      showToast('Failed to delete task', 'error');
    }
  };

  const toggleReminder = async (task: Task) => {
    try {
      const api = createApi(authState.token);
      const updated = await api.updateTask(task.id, { ...task, reminderEnabled: !task.reminderEnabled });
      dispatch({ type: 'UPDATE_TASK', payload: updated });
      showToast(updated.reminderEnabled ? 'Reminder enabled' : 'Reminder disabled');
    } catch (err) {
      showToast('Failed to update reminder', 'error');
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
  // console.log(state);

  if (state.error) {
    return (
      <div className="bg-red-50 rounded-2xl border border-red-200 p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
        <p className="text-red-800 font-medium mb-2">Error loading tasks</p>
        <p className="text-red-600 text-sm">{state.error}</p>
        <p className="text-red-600 text-sm mt-2">Make sure the backend is running on {API_BASE_URL}</p>
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

// TaskInsights Component
const TaskInsights = () => {
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
    
    const highPriorityTasks = activeTasks.filter(t => t.priority === 'high');
    const completionRate = state.tasks.length > 0 
      ? Math.round((completedTasks.length / state.tasks.length) * 100)
      : 0;
    
    return {
      total: state.tasks.length,
      completed: completedTasks.length,
      active: activeTasks.length,
      overdue: overdueTasks.length,
      today: todayTasks.length,
      highPriority: highPriorityTasks.length,
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
      <div className="flex flex-row justify-between">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Task Insights</h2>
        <NotificationDropdown />
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
      </div>
    </div>
  );
};

// Main App
export default function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <AuthProvider>
      <AuthWrapper showAuthModal={showAuthModal} setShowAuthModal={setShowAuthModal} />
    </AuthProvider>
  );
}

const AuthWrapper = ({ showAuthModal, setShowAuthModal }: { showAuthModal: boolean; setShowAuthModal: (show: boolean) => void }) => {
  const { authState } = useAuth();

  useEffect(() => {
    if (!authState.isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setShowAuthModal(false);
    }
  }, [authState.isAuthenticated]);

  return (
    <TaskProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <AppHeader />

          {authState.isAuthenticated ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <TaskManager />
                <TaskList />
              </div>
              <div>
                <TaskInsights />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Please sign in to access your tasks</p>
            </div>
          )}
        </div>
      </div>

      {showAuthModal && <AuthModal onClose={() => {}} />}
    </TaskProvider>
  );
};