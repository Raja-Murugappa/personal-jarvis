import type { Task, TaskFiltersState } from '@/types/task';

export function filterTasks(
  tasks: Task[],
  filters: TaskFiltersState,
  referenceDate: Date = new Date()
): Task[] {
  const searchLower = filters.search.trim().toLowerCase();
  const todayStr = referenceDate.toISOString().split('T')[0];

  // Calculate start and end of this week (next 7 days starting from today)
  const endOfWeek = new Date(referenceDate);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  const endOfWeekStr = endOfWeek.toISOString().split('T')[0];

  return tasks.filter((task) => {
    // 1. Search text filter (title, description, category)
    if (searchLower) {
      const matchTitle = task.title.toLowerCase().includes(searchLower);
      const matchDesc = task.description ? task.description.toLowerCase().includes(searchLower) : false;
      const matchCat = task.category ? task.category.toLowerCase().includes(searchLower) : false;
      if (!matchTitle && !matchDesc && !matchCat) {
        return false;
      }
    }

    // 2. Status filter
    if (filters.status && filters.status !== 'all') {
      if (task.status !== filters.status) {
        return false;
      }
    }

    // 3. Priority filter
    if (filters.priority && filters.priority !== 'all') {
      if (task.priority !== filters.priority) {
        return false;
      }
    }

    // 4. Category filter
    if (filters.category && filters.category !== 'all') {
      if (task.category !== filters.category) {
        return false;
      }
    }

    // 5. Due date filter
    if (filters.dueDate && filters.dueDate !== 'any') {
      if (filters.dueDate === 'no_date') {
        if (task.due_date) return false;
      } else if (!task.due_date) {
        return false;
      } else {
        if (filters.dueDate === 'overdue') {
          if (task.due_date >= todayStr || task.status === 'done') {
            return false;
          }
        } else if (filters.dueDate === 'today') {
          if (task.due_date !== todayStr) {
            return false;
          }
        } else if (filters.dueDate === 'this_week') {
          if (task.due_date < todayStr || task.due_date > endOfWeekStr) {
            return false;
          }
        }
      }
    }

    return true;
  });
}
