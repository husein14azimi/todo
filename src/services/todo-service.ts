import { TodoItem, TodoFilterOptions } from '../models/todo';

const STORAGE_KEY = 'm3_todo_items_v1';

export const INITIAL_TODOS: TodoItem[] = [
  {
    id: 'm3-1',
    title: 'Explore Material 3 Dynamic Theming',
    description: 'Switch between theme colors and observe how primary, container, and surface colors adapt seamlessly.',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'high',
    category: 'Design',
    completed: false,
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'm3-2',
    title: 'Review Material 3 Elevation & States',
    description: 'Notice the surface container tonal elevation and interactive ripple states on buttons and cards.',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    priority: 'medium',
    category: 'Design',
    completed: false,
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'm3-3',
    title: 'Test Responsive Navigation Rail & Bar',
    description: 'Resize the browser window to see navigation transition between bottom bar on mobile and rail on desktop.',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    priority: 'low',
    category: 'Work',
    completed: false,
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'm3-4',
    title: 'Completed M3 Design Audit',
    description: 'Check off items to see the strikethrough animation, subtle opacity shift, and completion timestamp.',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    category: 'Study',
    completed: true,
    createdAt: Date.now() - 3600000 * 10,
    completedAt: Date.now() - 3600000 * 2,
  },
];

export class TodoService {
  private todos: TodoItem[] = [];
  private listeners: Array<(todos: TodoItem[]) => void> = [];

  constructor() {
    this.todos = this.loadTodos();
  }

  private loadTodos(): TodoItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    this.saveTodos(INITIAL_TODOS);
    return INITIAL_TODOS;
  }

  private saveTodos(todos: TodoItem[]): void {
    this.todos = todos;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.todos));
    } catch {
      // ignore
    }
    this.notify();
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener([...this.todos]);
    }
  }

  public subscribe(callback: (todos: TodoItem[]) => void): () => void {
    this.listeners.push(callback);
    callback([...this.todos]);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public getAll(): TodoItem[] {
    return [...this.todos];
  }

  public getById(id: string): TodoItem | undefined {
    return this.todos.find((t) => t.id === id);
  }

  public add(item: Omit<TodoItem, 'id' | 'createdAt'>): TodoItem {
    const newTodo: TodoItem = {
      ...item,
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
    };
    this.saveTodos([newTodo, ...this.todos]);
    return newTodo;
  }

  public update(id: string, updates: Partial<Omit<TodoItem, 'id' | 'createdAt'>>): TodoItem | undefined {
    const index = this.todos.findIndex((t) => t.id === id);
    if (index === -1) return undefined;

    const updated: TodoItem = {
      ...this.todos[index],
      ...updates,
    };
    const next = [...this.todos];
    next[index] = updated;
    this.saveTodos(next);
    return updated;
  }

  public toggleComplete(id: string): TodoItem | undefined {
    const item = this.getById(id);
    if (!item) return undefined;

    return this.update(id, {
      completed: !item.completed,
      completedAt: !item.completed ? Date.now() : undefined,
    });
  }

  public delete(id: string): TodoItem | undefined {
    const item = this.getById(id);
    if (!item) return undefined;

    const next = this.todos.filter((t) => t.id !== id);
    this.saveTodos(next);
    return item;
  }

  public restore(item: TodoItem): void {
    const existing = this.todos.find((t) => t.id === item.id);
    if (!existing) {
      this.saveTodos([item, ...this.todos]);
    }
  }

  public filter(options: TodoFilterOptions): TodoItem[] {
    const todayStr = new Date().toISOString().split('T')[0];

    return this.todos.filter((item) => {
      // View filter
      if (options.view === 'completed') {
        if (!item.completed) return false;
      } else if (options.view === 'today') {
        if (item.completed || item.dueDate !== todayStr) return false;
      } else if (options.view === 'upcoming') {
        if (item.completed || !item.dueDate || item.dueDate <= todayStr) return false;
      } else if (options.view === 'all') {
        // default all
      }

      // Category filter
      if (options.category && options.category !== 'All') {
        if (item.category !== options.category) return false;
      }

      // Priority filter
      if (options.priority && options.priority !== 'All') {
        if (item.priority !== options.priority) return false;
      }

      // Search query
      if (options.searchQuery && options.searchQuery.trim() !== '') {
        const query = options.searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    });
  }

  public getStats() {
    const total = this.todos.length;
    const completed = this.todos.filter((t) => t.completed).length;
    const pending = total - completed;
    const todayStr = new Date().toISOString().split('T')[0];
    const today = this.todos.filter((t) => !t.completed && t.dueDate === todayStr).length;

    return { total, completed, pending, today };
  }
}

export const todoService = new TodoService();
