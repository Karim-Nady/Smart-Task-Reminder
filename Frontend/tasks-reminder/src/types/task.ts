// src/types/task.ts

export type { Task, TaskState, TaskAction };

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  completed: boolean;
  reminderEnabled: boolean;
  createdAt: string;
}

interface TaskState {
  tasks: Task[];
}

type TaskAction = 
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'SET_REMINDER'; payload: { taskId: string; enabled: boolean } }
  | { type: 'LOAD_TASKS'; payload: Task[] };