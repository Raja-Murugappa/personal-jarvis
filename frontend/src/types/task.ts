export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  category?: string | null;
  due_date?: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  priority: TaskPriority;
  category?: string;
  due_date?: string;
  status?: TaskStatus;
}

export interface TaskFiltersState {
  search: string;
  status: string; // 'all' | TaskStatus
  priority: string; // 'all' | TaskPriority
  category: string; // 'all' | specific category
  dueDate: string; // 'any' | 'overdue' | 'today' | 'this_week' | 'no_date'
}
