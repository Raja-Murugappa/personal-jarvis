import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, RefreshCw, Loader2, Trash2 } from 'lucide-react';
import {
  useHackathon,
  useArchiveHackathon,
  useRestoreHackathon,
  useDeleteHackathon,
} from '@/hooks/useHackathons';
import { HackathonSectionsView } from '@/components/hackathons/HackathonSectionsView';
import { useToast } from '@/components/ui/Toast';

export function HackathonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const hackathonId = id ? parseInt(id, 10) : null;

  const { data: hackathon, isLoading, isError, refetch } = useHackathon(hackathonId);
  const archiveMutation = useArchiveHackathon();
  const restoreMutation = useRestoreHackathon();
  const deleteMutation = useDeleteHackathon();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleArchive = async () => {
    if (!hackathonId) return;
    try {
      await archiveMutation.mutateAsync(hackathonId);
      toast('Hackathon moved to archive');
    } catch {
      toast('Failed to archive hackathon');
    }
  };

  const handleRestore = async () => {
    if (!hackathonId) return;
    try {
      await restoreMutation.mutateAsync(hackathonId);
      toast('Hackathon restored from archive');
    } catch {
      toast('Failed to restore hackathon');
    }
  };

  const handleDelete = async () => {
    if (!hackathonId) return;
    try {
      await deleteMutation.mutateAsync(hackathonId);
      toast('Hackathon and all its files deleted');
      navigate('/hackathons');
    } catch {
      toast('Failed to delete hackathon');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">Loading hackathon details...</span>
      </div>
    );
  }

  if (isError || !hackathon) {
    return (
      <div className="p-8 max-w-xl mx-auto mt-8 rounded-xl border border-destructive/30 bg-destructive/5 text-center space-y-4">
        <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Hackathon Not Found</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            The requested hackathon could not be found or the backend service is offline.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
          <button
            onClick={() => navigate('/hackathons')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Hackathons</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/hackathons')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Hackathons</span>
        </button>
      </div>

      {/* Main Showcase View */}
      <HackathonSectionsView
        hackathon={hackathon}
        onArchive={handleArchive}
        onRestore={handleRestore}
        onDelete={() => setIsDeleteDialogOpen(true)}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteDialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-sm rounded-xl border border-destructive/30 bg-card p-6 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Delete Hackathon Permanently?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This will delete <strong className="text-foreground">{hackathon.name}</strong>, its links, team members, and permanently unlink all photos and documents from disk. Any linked project will NOT be deleted.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

