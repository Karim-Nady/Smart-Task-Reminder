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

const createAuthHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const taskApi = {
  async createTask(token: string, task: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: createAuthHeaders(token),
      body: JSON.stringify(transformToBackend(task)),
    });
    if (!res.ok) throw new Error('Failed to create task');
    const data = await res.json();
    return transformToFrontend(data);
  },

  async updateTask(token: string, id: number, task: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: createAuthHeaders(token),
      body: JSON.stringify(transformToBackend(task)),
    });
    if (!res.ok) throw new Error('Failed to update task');
    const data = await res.json();
    return transformToFrontend(data);
  },

  async deleteTask(token: string, id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: createAuthHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to delete task');
  },
};