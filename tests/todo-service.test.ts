import { describe, it, expect, beforeEach } from 'vitest';
import { TodoService } from '../src/services/todo-service';

describe('TodoService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads initial starter todos when storage is empty', () => {
    const service = new TodoService();
    const todos = service.getAll();
    expect(todos.length).toBeGreaterThan(0);
    expect(todos.some((t) => t.title.includes('Material 3'))).toBe(true);
  });

  it('adds a new todo item', () => {
    const service = new TodoService();
    const initialCount = service.getAll().length;

    const newTodo = service.add({
      title: 'New M3 Feature Test',
      description: 'Check floating action button click',
      dueDate: '2026-12-31',
      priority: 'high',
      category: 'Design',
      completed: false,
    });

    expect(newTodo.id).toBeDefined();
    expect(newTodo.title).toBe('New M3 Feature Test');
    expect(service.getAll().length).toBe(initialCount + 1);
  });

  it('toggles completion status', () => {
    const service = new TodoService();
    const first = service.getAll()[0];
    const originalStatus = first.completed;

    const updated = service.toggleComplete(first.id);
    expect(updated?.completed).toBe(!originalStatus);
  });

  it('updates an existing todo', () => {
    const service = new TodoService();
    const first = service.getAll()[0];

    const updated = service.update(first.id, {
      title: 'Updated Title',
      priority: 'low',
    });

    expect(updated?.title).toBe('Updated Title');
    expect(updated?.priority).toBe('low');
  });

  it('deletes and restores a todo item', () => {
    const service = new TodoService();
    const first = service.getAll()[0];
    const initialCount = service.getAll().length;

    const deleted = service.delete(first.id);
    expect(deleted?.id).toBe(first.id);
    expect(service.getAll().length).toBe(initialCount - 1);

    service.restore(deleted!);
    expect(service.getAll().length).toBe(initialCount);
  });

  it('filters by view, category, and search query', () => {
    const service = new TodoService();

    const searchResults = service.filter({
      view: 'all',
      searchQuery: 'dynamic',
    });
    expect(searchResults.every((t) => t.title.toLowerCase().includes('dynamic') || t.description.toLowerCase().includes('dynamic'))).toBe(true);

    const completedResults = service.filter({
      view: 'completed',
    });
    expect(completedResults.every((t) => t.completed)).toBe(true);
  });
});
