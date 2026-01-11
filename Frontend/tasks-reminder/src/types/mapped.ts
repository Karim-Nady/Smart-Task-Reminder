
export interface BackendTask {
  id: number;
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority: number; // 1 | 2 | 3
  category?: string | null;
  completed: boolean;
  reminder_enabled: boolean;
  status: string;
  created_at: string;
}
