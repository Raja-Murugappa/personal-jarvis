import { describe, it, expect } from 'vitest';
import { filterTasks } from './filter-tasks';
import type { Task, TaskFiltersState } from '@/types/task';

describe('filterTasks', () => {
  const sampleTasks: Task[] = [
    {
      id: 1,
      title: 'Finish Operating Systems Assignment',
      description: 'Implement semaphore lock',
      priority: 'high',
      category: 'Academics',
      due_date: '2026-11-01', // today
      status: 'todo',
      created_at: '2026-10-30T10:00:00Z',
      updated_at: '2026-10-30T10:00:00Z',
    },
    {
      id: 2,
      title: 'Solve LeetCode Daily Problem',
      description: 'Graph BFS problem',
      priority: 'medium',
      category: 'Career',
      due_date: '2026-10-25', // overdue
      status: 'todo',
      created_at: '2026-10-25T10:00:00Z',
      updated_at: '2026-10-25T10:00:00Z',
    },
    {
      id: 3,
      title: 'Buy Groceries',
      description: 'Milk and eggs',
      priority: 'low',
      category: 'Personal',
      due_date: '2026-11-05', // this week
      status: 'in_progress',
      created_at: '2026-10-31T10:00:00Z',
      updated_at: '2026-10-31T10:00:00Z',
    },
    {
      id: 4,
      title: 'Read Documentation',
      description: null,
      priority: 'low',
      category: null,
      due_date: null, // no date
      status: 'done',
      created_at: '2026-10-20T10:00:00Z',
      updated_at: '2026-10-20T10:00:00Z',
    },
  ];

  const defaultFilters: TaskFiltersState = {
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    dueDate: 'any',
  };

  const refDate = new Date('2026-11-01T12:00:00Z');

  it('returns all tasks when default filters are active', () => {
    const result = filterTasks(sampleTasks, defaultFilters, refDate);
    expect(result).toHaveLength(4);
  });

  it('filters by search keyword in title or description', () => {
    const result = filterTasks(sampleTasks, { ...defaultFilters, search: 'semaphore' }, refDate);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('filters by status', () => {
    const result = filterTasks(sampleTasks, { ...defaultFilters, status: 'todo' }, refDate);
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.id)).toEqual([1, 2]);
  });

  it('filters by priority', () => {
    const result = filterTasks(sampleTasks, { ...defaultFilters, priority: 'high' }, refDate);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Finish Operating Systems Assignment');
  });

  it('filters by category', () => {
    const result = filterTasks(sampleTasks, { ...defaultFilters, category: 'Career' }, refDate);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('filters by due date today', () => {
    const result = filterTasks(sampleTasks, { ...defaultFilters, dueDate: 'today' }, refDate);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('filters by overdue due date', () => {
    const result = filterTasks(sampleTasks, { ...defaultFilters, dueDate: 'overdue' }, refDate);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('filters by this week due date', () => {
    const result = filterTasks(sampleTasks, { ...defaultFilters, dueDate: 'this_week' }, refDate);
    expect(result).toHaveLength(2); // Nov 1 and Nov 5
    expect(result.map((t) => t.id)).toEqual([1, 3]);
  });

  it('filters by no date', () => {
    const result = filterTasks(sampleTasks, { ...defaultFilters, dueDate: 'no_date' }, refDate);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(4);
  });
});
