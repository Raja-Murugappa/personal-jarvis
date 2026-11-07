import { Search } from 'lucide-react';

interface ProjectFiltersBarProps {
  status: string;
  onStatusChange: (status: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  technology: string;
  onTechnologyChange: (tech: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  showArchived: boolean;
  onShowArchivedChange: (show: boolean) => void;
}

export function ProjectFiltersBar({
  status,
  onStatusChange,
  category,
  onCategoryChange,
  technology,
  onTechnologyChange,
  search,
  onSearchChange,
  showArchived,
  onShowArchivedChange,
}: ProjectFiltersBarProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl border border-border/80 bg-card/60">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search projects by title, headline, or description..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Filter Selects */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background text-foreground"
        >
          <option value="all">All Statuses</option>
          <option value="idea">Idea</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
        </select>

        <input
          type="text"
          placeholder="Filter category..."
          value={category === 'all' ? '' : category}
          onChange={(e) => onCategoryChange(e.target.value.trim() ? e.target.value : 'all')}
          className="w-28 px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground"
        />

        <input
          type="text"
          placeholder="Filter tech..."
          value={technology}
          onChange={(e) => onTechnologyChange(e.target.value)}
          className="w-28 px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground"
        />

        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none px-2 py-1.5 rounded-lg border border-transparent hover:bg-muted/50">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => onShowArchivedChange(e.target.checked)}
            className="rounded border-input text-primary"
          />
          <span>Archived</span>
        </label>
      </div>
    </div>
  );
}

