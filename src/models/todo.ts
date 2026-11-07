export type Priority = 'low' | 'medium' | 'high';

export type Category = 'Work' | 'Personal' | 'Design' | 'Study' | 'General';

export type FilterView = 'all' | 'today' | 'upcoming' | 'completed';

export interface TodoItem {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO date string YYYY-MM-DD or empty
  priority: Priority;
  category: Category;
  completed: boolean;
  createdAt: number; // timestamp
  completedAt?: number;
}

export interface TodoFilterOptions {
  view: FilterView;
  category?: Category | 'All';
  priority?: Priority | 'All';
  searchQuery?: string;
}
