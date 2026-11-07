import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, RefreshCw, Loader2, Trash2 } from 'lucide-react';
import {
  useProject,
  useArchiveProject,
  useRestoreProject,
  useDeleteProject,
} from '@/hooks/useProjects';
import { ProjectSectionsView } from '@/components/projects/ProjectSectionsView';
import { useToast } from '@/components/ui/Toast';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const projectId = id ? parseInt(id, 10) : null;

  const { data: project, isLoading, isError, refetch } = useProject(projectId);
  const archiveMutation = useArchiveProject();
  const restoreMutation = useRestoreProject();
  const deleteMutation = useDeleteProject();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleArchive = async () => {
    if (!projectId) return;
    try {
      await archiveMutation.mutateAsync(projectId);
      toast('Project moved to archive');
    } catch {
      toast('Failed to archive project');
    }
  };

  const handleRestore = async () => {
    if (!projectId) return;
    try {
      await restoreMutation.mutateAsync(projectId);
      toast('Project restored from archive');
    } catch {
      toast('Failed to restore project');
    }
  };

  const handleDelete = async () => {
    if (!projectId) return;
    try {
      await deleteMutation.mutateAsync(projectId);
      toast('Project and all its files deleted');
      navigate('/projects');
    } catch {
      toast('Failed to delete project');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">Loading project showcase...</span>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="p-8 max-w-xl mx-auto mt-8 rounded-xl border border-destructive/30 bg-destructive/5 text-center space-y-4">
        <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Project Not Found</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            The requested project could not be found or the backend service is offline.
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
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects</span>
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
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects Vault</span>
        </button>
      </div>

      {/* Main Showcase View */}
      <ProjectSectionsView
        project={project}
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
              <h3 className="text-sm font-semibold text-foreground">Delete Project Permanently?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This will delete <strong className="text-foreground">{project.title}</strong>, its links, team members, and permanently unlink all photos and documents from disk. Any hackathons linked to this project will remain intact.
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

