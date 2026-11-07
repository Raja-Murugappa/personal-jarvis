import { useState } from 'react';
import type { JournalEntry } from '@/types/journal';
import { useDeleteJournalEntry } from '@/hooks/useJournal';
import { useToast } from '@/components/ui/Toast';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface DeleteJournalDialogProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteJournalDialog({ entry, isOpen, onClose }: DeleteJournalDialogProps) {
  const { toast } = useToast();
  const deleteMutation = useDeleteJournalEntry();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !entry) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(entry.id);
      toast('Journal entry deleted successfully');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete journal entry';
      toast(msg);
      // Dialog remains open on failure
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-journal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="bg-card text-card-foreground border border-border w-full max-w-md rounded-xl shadow-lg p-6 relative">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-rose-500/10 text-rose-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 id="delete-journal-title" className="text-base font-semibold text-foreground">
              Delete Journal Entry
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Are you sure you want to delete the journal entry for{' '}
              <span className="font-semibold text-foreground">{entry.entry_date}</span>? This action is permanent and cannot be undone.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

