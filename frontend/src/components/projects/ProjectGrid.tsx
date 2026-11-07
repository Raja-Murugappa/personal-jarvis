import { Star, FolderPlus, SearchX } from 'lucide-react';
import type { ProjectListItem } from '@/types/project';
import { ProjectCard } from './ProjectCard';

interface ProjectGridProps {
  projects: ProjectListItem[];
  onAddProject: () => void;
  isFiltered: boolean;
}

export function ProjectGrid({ projects, onAddProject, isFiltered }: ProjectGridProps) {
  if (projects.length === 0) {
    if (isFiltered) {
      return (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <SearchX className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No projects match your filters</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your status, search query, or technology filters to see more results.
          </p>
        </div>
      );
    }

    return (
      <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
          <FolderPlus className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">No projects yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Add your builds, open-source repositories, and portfolio work to start showcasing your accomplishments.
          </p>
        </div>
        <button
          onClick={onAddProject}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>Add your first project</span>
        </button>
      </div>
    );
  }

  const featuredProjects = projects.filter((p) => p.is_featured);
  const otherProjects = projects.filter((p) => !p.is_featured);

  return (
    <div className="space-y-8">
      {/* Featured Projects Showcase Row */}
      {featuredProjects.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-amber-500/10 text-amber-500">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Featured Work ({featuredProjects.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {/* Other Projects Grid */}
      {otherProjects.length > 0 && (
        <div className="space-y-3">
          {featuredProjects.length > 0 && (
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              All Projects ({otherProjects.length})
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

