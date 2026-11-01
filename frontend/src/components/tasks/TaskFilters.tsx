import type { TaskFiltersState } from '@/types/task';
import { Search, RotateCcw } from 'lucide-react';

interface TaskFiltersProps {
  filters: TaskFiltersState;
  onChange: (filters: TaskFiltersState) => void;
  categories: string[];
}

export function TaskFilters({ filters, onChange, categories }: TaskFiltersProps) {
  const updateFilter = (key: keyof TaskFiltersState, value: string) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.category !== 'all' ||
    filters.dueDate !== 'any';

  const resetFilters = () => {
    onChange({
      search: '',
      status: 'all',
      priority: 'all',
      category: 'all',
      dueDate: 'any',
    });
  };

  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-3.5 space-y-3 shadow-sm">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Filter by title, description, or category..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Dropdown Filters Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 text-xs">
        {/* Status */}
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">Priority</label>
          <select
            value={filters.priority}
            onChange={(e) => updateFilter('priority', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">Category</label>
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground mb-1">Due Date</label>
          <select
            value={filters.dueDate}
            onChange={(e) => updateFilter('dueDate', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="any">Any date</option>
            <option value="today">Due Today</option>
            <option value="this_week">Due This Week</option>
            <option value="overdue">Overdue</option>
            <option value="no_date">No Due Date</option>
          </select>
        </div>

        {/* Reset Filters button */}
        {hasActiveFilters && (
          <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-end">
            <button
              onClick={resetFilters}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
