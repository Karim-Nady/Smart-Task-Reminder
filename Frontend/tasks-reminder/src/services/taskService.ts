// src/services/taskService.ts
import api from './api';

export interface TaskCreateData {
  title: string;
  description?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'cancelled' | 'done';
  completed?: boolean;
  due_date?: string | null;        // ISO string
  reminder_enabled?: boolean;
}

export interface TaskResponse {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  priority?: string;
  category?: string;
  reminder_enabled?: boolean;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  due_before?: string;
  due_after?: string;
  limit?: number;
  offset?: number;
  sort_by?: string;
  order?: 'asc' | 'desc';
}

export interface InsightsResponse {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  tasks_due_today: number;
  upcoming_tasks: number;
  completion_rate: number;
  avg_completion_time: number | null;
}

export interface NotificationResponse {
    id: number;
    task_id: number;
    message: string;
    created_at: string;
    is_read: boolean;
}

class TaskService {
  private handleError(error: any): never {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    if (error.response?.status === 422) {
      const validationErrors = error.response.data?.detail || 'Validation error';
      throw new Error(`Validation failed: ${JSON.stringify(validationErrors)}`);
    }
    
    throw error;
  }

  async getTasks(filters: TaskFilters = {}): Promise<TaskResponse[]> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/tasks?${params.toString()}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTask(id: number): Promise<TaskResponse> {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createTask(taskData: TaskCreateData): Promise<TaskResponse> {
    try {
      // Ensure required fields
      const data = {
        title: taskData.title,
        description: taskData.description || '',
        due_date: taskData.due_date || null,
        priority: taskData.priority || 2, // Default to medium
        category: taskData.category || 'General',
        reminder_enabled: taskData.reminder_enabled ?? true,
        status: taskData.status || 'pending',
      };
      
      console.log('Creating task with data:', data);
      
      const response = await api.post('/tasks', data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateTask(id: number, taskData: Partial<TaskCreateData>): Promise<TaskResponse> {
    try {
      // Filter out undefined values
      const data = Object.fromEntries(
        Object.entries(taskData).filter(([_, v]) => v !== undefined)
      );
      
      console.log('Updating task with data:', data);
      
      const response = await api.put(`/tasks/${id}`, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteTask(id: number): Promise<void> {
    try {
      await api.delete(`/tasks/${id}`);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getUpcomingTasks(): Promise<TaskResponse[]> {
    try {
      const response = await api.get('/tasks/upcoming-tasks');
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch upcoming tasks:', error);
      return []; // Return empty array instead of throwing
    }
  }

  async getOverdueTasks(): Promise<TaskResponse[]> {
    try {
      const response = await api.get('/tasks/overdue-tasks');
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch overdue tasks:', error);
      return [];
    }
  }

  async getReminders(): Promise<TaskResponse[]> {
    try {
      const response = await api.get('/tasks/reminders');
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch reminders:', error);
      return [];
    }
  }

  async getNotifications(): Promise<NotificationResponse[]> {
    try{
      const res = await api.get('/notifications');
      return res.data;
    } catch(error) {
      console.warn("failed to get the notifications due: ", error);
      return [];
    }
  }

  async markNotifications(id: number): Promise<boolean> {
    try{
      const res = await api.put(`/notifications/${id}/read`);
      console.log(res);
      return true;
    } catch(error) {
      console.warn("failed to mark the notifications as read due: ", error);
      return false;
    }
  }

  async getInsights(): Promise<InsightsResponse> {
    try {
      const response = await api.get('/tasks/summary');
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch insights:', error);
      // Return default insights
      return {
        total_tasks: 0,
        completed_tasks: 0,
        pending_tasks: 0,
        overdue_tasks: 0,
        tasks_due_today: 0,
        upcoming_tasks: 0,
        completion_rate: 0,
        avg_completion_time: null,
      };
    }
  }
}

export default new TaskService();