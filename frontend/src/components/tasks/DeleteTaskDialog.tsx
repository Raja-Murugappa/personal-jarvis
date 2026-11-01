import { useState } from 'react';
import type { Task } from '@/types/task';
import { useDeleteTask } from '@/hooks/useTasks';
import { useToast } from '@/components/ui/Toast';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface DeleteTaskDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteTaskDialog({ task, isOpen, onClose }: DeleteTaskDialogProps) {
  const { toast } = useToast();
  const deleteTaskMutation = useDeleteTask();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !task) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTaskMutation.mutateAsync(task.id);
      toast('Task deleted successfully');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete task';
      toast(msg);
      // Dialog remains open on failure as required
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="bg-card text-card-foreground border border-border w-full max-w-md rounded-xl shadow-lg p-6 relative">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-rose-500/10 text-rose-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 id="delete-dialog-title" className="text-base font-semibold text-foreground">
              Delete Task
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Are you sure you want to delete <span className="font-semibold text-foreground">"{task.title}"</span>? This action is permanent and cannot be undone.
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
