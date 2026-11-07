import { useNavigate } from 'react-router-dom';
import { Star, Link as LinkIcon, Paperclip, FolderGit2 } from 'lucide-react';
import type { ProjectListItem } from '@/types/project';

interface ProjectCardProps {
  project: ProjectListItem;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  idea: { label: 'Idea', bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-600 dark:text-amber-400' },
  in_progress: { label: 'In Progress', bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-600 dark:text-blue-400' },
  completed: { label: 'Completed', bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400' },
  paused: { label: 'Paused', bg: 'bg-neutral-500/10 border-neutral-500/20', text: 'text-neutral-600 dark:text-neutral-400' },
};

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();
  const statusInfo = STATUS_CONFIG[project.status] || STATUS_CONFIG.idea;

  const visibleTechs = project.technologies.slice(0, 4);
  const remainingCount = project.technologies.length - visibleTechs.length;

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="group rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Cover Image or Neutral Placeholder */}
        <div className="relative w-full h-40 bg-muted/40 overflow-hidden border-b border-border/60">
          {project.cover_thumbnail_url ? (
            <img
              src={project.cover_thumbnail_url}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/60 bg-gradient-to-br from-muted/30 to-muted/80">
              <FolderGit2 className="w-10 h-10 stroke-[1.2]" />
            </div>
          )}

          {/* Badges on Cover */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border uppercase ${statusInfo.bg} ${statusInfo.text} backdrop-blur-md`}
            >
              {statusInfo.label}
            </span>
            {project.category && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 text-white backdrop-blur-md">
                {project.category}
              </span>
            )}
          </div>

          {project.is_featured && (
            <div className="absolute top-2.5 right-2.5 p-1 rounded-full bg-amber-500 text-white shadow-sm" title="Featured Project">
              <Star className="w-3.5 h-3.5 fill-white" />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {project.title}
          </h3>

          {project.headline ? (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {project.headline}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/50 italic">No headline set.</p>
          )}

          {/* Technology Chips */}
          {project.technologies.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 pt-1.5">
              {visibleTechs.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground"
                >
                  {tech}
                </span>
              ))}
              {remainingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-muted-foreground bg-muted">
                  +{remainingCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 py-2.5 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {project.start_date ? project.start_date.split('-')[0] : 'No date'}
        </span>

        <div className="flex items-center gap-2.5">
          {project.link_count > 0 && (
            <span className="flex items-center gap-1" title={`${project.link_count} links`}>
              <LinkIcon className="w-3 h-3" />
              <span>{project.link_count}</span>
            </span>
          )}
          {project.attachment_count > 0 && (
            <span className="flex items-center gap-1" title={`${project.attachment_count} attachments`}>
              <Paperclip className="w-3 h-3" />
              <span>{project.attachment_count}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

