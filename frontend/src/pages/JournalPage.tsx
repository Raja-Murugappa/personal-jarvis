import { useState, useMemo } from 'react';
import { useJournalEntries } from '@/hooks/useJournal';
import type { JournalEntry } from '@/types/journal';
import { JournalEntryForm } from '@/components/journal/JournalEntryForm';
import { JournalEntryCard } from '@/components/journal/JournalEntryCard';
import { JournalList } from '@/components/journal/JournalList';
import { DeleteJournalDialog } from '@/components/journal/DeleteJournalDialog';
import {
  BookMarked,
  Plus,
  Calendar,
  AlertCircle,
  RefreshCw,
  Sparkles,
  PenLine,
} from 'lucide-react';

function getTodayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function JournalPage() {
  const { data: entries = [], isLoading, isError, refetch } = useJournalEntries();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<JournalEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);
  const [formDefaultDate, setFormDefaultDate] = useState<string | undefined>(undefined);

  const todayStr = useMemo(() => getTodayLocalDate(), []);

  const todayEntry = useMemo(() => {
    return entries.find((e) => e.entry_date === todayStr);
  }, [entries, todayStr]);

  const handleOpenNewEntry = (date?: string) => {
    const targetDate = date || todayStr;
    const existing = entries.find((e) => e.entry_date === targetDate);
    if (existing) {
      handleEditEntry(existing);
      return;
    }
    setEntryToEdit(null);
    setFormDefaultDate(targetDate);
    setIsFormOpen(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEntryToEdit(entry);
    setFormDefaultDate(entry.entry_date);
    setIsFormOpen(true);
  };

  const handleDeleteEntry = (entry: JournalEntry) => {
    setEntryToDelete(entry);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Daily Journal
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Private, local-only daily reflections, accomplishments, and learnings.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenNewEntry()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Write Entry</span>
        </button>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="p-6 rounded-xl border border-border/60 bg-card/60 animate-pulse space-y-3">
            <div className="h-5 w-40 bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted/60 rounded" />
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-5 rounded-xl border border-border/60 bg-card/60 animate-pulse space-y-3"
              >
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-2/3 bg-muted/60 rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="p-8 rounded-xl border border-destructive/30 bg-destructive/5 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Can't reach the backend
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Failed to load daily journal data. Please verify your backend server is online.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section: Today */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Today's Journal</span>
              </h2>
            </div>

            {todayEntry ? (
              <JournalEntryCard
                entry={todayEntry}
                onEdit={handleEditEntry}
                onDelete={handleDeleteEntry}
                isToday={true}
              />
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-border bg-card/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0">
                    <PenLine className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-foreground">
                      No entry written for today
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Take 2 minutes to record what you completed, what you learned, and tomorrow's focus.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenNewEntry(todayStr)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Write today's entry</span>
                </button>
              </div>
            )}
          </div>

          {/* Section: Past Entries */}
          <div className="space-y-3 pt-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Past Entries</span>
            </h2>

            <JournalList
              entries={entries}
              isLoading={false}
              isError={false}
              onRetry={refetch}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
              onWriteNew={() => handleOpenNewEntry()}
              todayEntryId={todayEntry?.id}
            />
          </div>
        </div>
      )}

      {/* Form Dialog for Add & Edit */}
      <JournalEntryForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEntryToEdit(null);
        }}
        entryToEdit={entryToEdit}
        defaultDate={formDefaultDate}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteJournalDialog
        isOpen={Boolean(entryToDelete)}
        entry={entryToDelete}
        onClose={() => setEntryToDelete(null)}
      />
    </div>
  );
}
export default JournalPage;

