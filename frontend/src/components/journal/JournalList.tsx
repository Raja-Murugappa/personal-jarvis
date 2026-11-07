import { useState, useMemo } from 'react';
import type { JournalEntry } from '@/types/journal';
import { JournalEntryCard } from './JournalEntryCard';
import { Search, Filter, BookOpen, AlertCircle, RefreshCw, Plus } from 'lucide-react';

interface JournalListProps {
  entries: JournalEntry[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (entry: JournalEntry) => void;
  onWriteNew: () => void;
  todayEntryId?: number;
}

export function JournalList({
  entries,
  isLoading,
  isError,
  onRetry,
  onEdit,
  onDelete,
  onWriteNew,
  todayEntryId,
}: JournalListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');

  // Filter out today's entry from the past entries list so it's not duplicated
  const pastEntries = useMemo(() => {
    return entries.filter((e) => e.id !== todayEntryId);
  }, [entries, todayEntryId]);

  // Extract distinct months for the filter (e.g. '2026-11')
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    pastEntries.forEach((e) => {
      if (e.entry_date && e.entry_date.length >= 7) {
        set.add(e.entry_date.substring(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [pastEntries]);

  // Filter by search query and selected month
  const filteredEntries = useMemo(() => {
    return pastEntries.filter((entry) => {
      // Month check
      if (selectedMonth !== 'all') {
        if (!entry.entry_date.startsWith(selectedMonth)) {
          return false;
        }
      }

      // Search check
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchDate = entry.entry_date.toLowerCase().includes(q);
      const matchCompleted = entry.completed?.toLowerCase().includes(q);
      const matchLearned = entry.learned?.toLowerCase().includes(q);
      const matchWentWrong = entry.went_wrong?.toLowerCase().includes(q);
      const matchCouldImprove = entry.could_improve?.toLowerCase().includes(q);
      const matchEvents = entry.important_events?.toLowerCase().includes(q);
      const matchReflections = entry.reflections?.toLowerCase().includes(q);
      const matchPriorities = entry.tomorrow_priorities?.toLowerCase().includes(q);

      return (
        matchDate ||
        matchCompleted ||
        matchLearned ||
        matchWentWrong ||
        matchCouldImprove ||
        matchEvents ||
        matchReflections ||
        matchPriorities
      );
    });
  }, [pastEntries, selectedMonth, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-border/60 bg-card/60 animate-pulse space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-4 w-16 bg-muted rounded" />
            </div>
            <div className="h-3 w-3/4 bg-muted/70 rounded" />
            <div className="h-3 w-1/2 bg-muted/50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 rounded-xl border border-destructive/30 bg-destructive/5 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Can't reach the backend</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Unable to retrieve journal entries. Please ensure the backend server is running.
          </p>
        </div>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Month Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search past entries (reflections, tasks, notes)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {availableMonths.length > 0 && (
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">All Months</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Entries List or Empty State */}
      {filteredEntries.length === 0 ? (
        <div className="p-8 rounded-xl border border-border/80 bg-card text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {entries.length === 0 ? 'No journal entries yet' : 'No matching entries found'}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {entries.length === 0
                ? 'Begin your daily reflection habit to track accomplishments and insights.'
                : 'Try adjusting your search query or month filter.'}
            </p>
          </div>
          {entries.length === 0 && (
            <button
              onClick={onWriteNew}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Write first entry</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onEdit={onEdit}
              onDelete={onDelete}
              isToday={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

