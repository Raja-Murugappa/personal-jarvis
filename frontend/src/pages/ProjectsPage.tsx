import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderGit2, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { ProjectFiltersBar } from '@/components/projects/ProjectFiltersBar';
import { ProjectGrid } from '@/components/projects/ProjectGrid';

export function ProjectsPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>('all');
  const [category, setCategory] = useState<string>('all');
  const [technology, setTechnology] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [showArchived, setShowArchived] = useState<boolean>(false);

  const {
    data: projects = [],
    isLoading,
    isError,
    refetch,
  } = useProjects({
    status: status !== 'all' ? status : undefined,
    category: category !== 'all' ? category : undefined,
    technology: technology.trim() ? technology.trim() : undefined,
    search: search.trim() ? search.trim() : undefined,
    include_archived: showArchived,
  });

  const isFiltered = status !== 'all' || category !== 'all' || Boolean(technology.trim()) || Boolean(search.trim());

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Projects Vault
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Portfolio builds, repositories, and featured showcases stored locally.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/projects/new')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </button>
      </div>

      {/* Filters Bar */}
      <ProjectFiltersBar
        status={status}
        onStatusChange={setStatus}
        category={category}
        onCategoryChange={setCategory}
        technology={technology}
        onTechnologyChange={setTechnology}
        search={search}
        onSearchChange={setSearch}
        showArchived={showArchived}
        onShowArchivedChange={setShowArchived}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-xl border border-border/60 bg-card/60 animate-pulse p-4 space-y-3">
              <div className="h-32 bg-muted rounded-lg" />
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted/60 rounded" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 rounded-xl border border-destructive/30 bg-destructive/5 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Can't reach the backend</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Failed to load projects vault data. Please verify your backend server is online.
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
        <ProjectGrid
          projects={projects}
          onAddProject={() => navigate('/projects/new')}
          isFiltered={isFiltered}
        />
      )}
    </div>
  );
}

