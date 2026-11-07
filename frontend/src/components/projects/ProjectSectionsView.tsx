import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  Globe,
  Video,
  BookOpen,
  Award,
  Database,
  FileText,
  Calendar,
  Users,
  Cpu,
  Trophy,
  Star,
  Edit3,
  Archive,
  RefreshCw,
  Trash2,
  Download,
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/showcase/BrandIcons';
import type { Project } from '@/types/project';
import { attachmentsApi, projectsApi } from '@/lib/api';
import { LightboxModal } from '@/components/showcase/LightboxModal';
import { ShowcaseCopyButtons } from '@/components/showcase/ShowcaseCopyButtons';

interface ProjectSectionsViewProps {
  project: Project;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
}

const LINK_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  github: GithubIcon,
  demo: Globe,
  linkedin: LinkedinIcon,
  video: Video,
  documentation: BookOpen,
  certificate: Award,
  dataset: Database,
  other: ExternalLink,
};

export function ProjectSectionsView({
  project,
  onArchive,
  onRestore,
  onDelete,
}: ProjectSectionsViewProps) {
  const navigate = useNavigate();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const images = project.attachments.filter((a) => a.mime_type !== 'application/pdf');
  const documents = project.attachments.filter((a) => a.mime_type === 'application/pdf');

  const coverAttachment = project.attachments.find((a) => a.is_cover) || images[0];

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Showcase Header Banner */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
        {coverAttachment && (
          <div className="w-full h-56 sm:h-72 bg-muted/40 relative border-b border-border/60 overflow-hidden">
            <img
              src={attachmentsApi.getFileUrl(coverAttachment.id)}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md">
                {coverAttachment.caption || 'Cover Photo'}
              </span>
            </div>
          </div>
        )}

        <div className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {project.title}
                </h1>
                {project.is_featured && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>Featured</span>
                  </span>
                )}
                {project.archived_at && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-500/10 text-neutral-500 border border-neutral-500/20">
                    Archived
                  </span>
                )}
              </div>

              {project.headline && (
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                  {project.headline}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <ShowcaseCopyButtons getShowcase={() => projectsApi.getShowcase(project.id)} />

              <button
                onClick={() => navigate(`/projects/${project.id}/edit`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              {project.archived_at ? (
                <button
                  onClick={onRestore}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors"
                  title="Restore from archive"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </button>
              ) : (
                <button
                  onClick={onArchive}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors"
                  title="Archive project"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archive</span>
                </button>
              )}

              <button
                onClick={onDelete}
                className="p-2 text-muted-foreground hover:text-destructive rounded-lg border border-border hover:bg-destructive/10 transition-colors"
                title="Delete project"
                aria-label="Delete project"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Metadata Chips: Status, Category, Dates */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground">
            <span className="px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground font-medium uppercase text-[10px]">
              {project.status.replace('_', ' ')}
            </span>

            {project.category && (
              <span className="px-2.5 py-1 rounded-md bg-muted text-foreground font-medium">
                {project.category}
              </span>
            )}

            {(project.start_date || project.end_date) && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {project.start_date || 'Start'} → {project.end_date || 'Present'}
                </span>
              </span>
            )}
          </div>

          {/* Links Row */}
          {project.links.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/60">
              {project.links.map((link) => {
                const IconComponent = LINK_ICON_MAP[link.kind] || ExternalLink;
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-background hover:bg-muted text-xs font-medium text-foreground transition-colors shadow-sm"
                  >
                    <IconComponent className="w-3.5 h-3.5 text-primary" />
                    <span>{link.label || link.kind.toUpperCase()}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Photo Gallery Grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span>Photo Gallery ({images.length})</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div
                key={img.id}
                onClick={() => handleOpenLightbox(idx)}
                className="group relative h-28 sm:h-36 rounded-xl overflow-hidden border border-border/80 cursor-pointer bg-muted/40 hover:border-primary/50 transition-all shadow-sm"
              >
                <img
                  src={attachmentsApi.getThumbnailUrl(img.id)}
                  alt={img.alt_text || img.original_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {img.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-[10px] text-white truncate">
                    {img.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents & Certificates */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span>Documents & Certificates ({documents.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((doc) => (
              <a
                key={doc.id}
                href={attachmentsApi.getFileUrl(doc.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-card hover:bg-muted/50 transition-colors shadow-sm group"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    {doc.kind === 'certificate' ? <Award className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {doc.caption || doc.original_name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {(doc.size_bytes / (1024 * 1024)).toFixed(2)} MB • PDF
                    </p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Detail Narrative Sections (each hidden when empty) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {project.description && (
            <section className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                About the Project
              </h2>
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {project.description}
              </div>
            </section>
          )}

          {project.problem_statement && (
            <section className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Problem Statement
              </h2>
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {project.problem_statement}
              </div>
            </section>
          )}

          {project.my_contribution && (
            <section className="p-5 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-primary">
                My Contribution & Role
              </h2>
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {project.my_contribution}
              </div>
            </section>
          )}

          {project.challenges && (
            <section className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Key Challenges
              </h2>
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {project.challenges}
              </div>
            </section>
          )}

          {project.lessons_learned && (
            <section className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Lessons Learned
              </h2>
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {project.lessons_learned}
              </div>
            </section>
          )}

          {project.future_improvements && (
            <section className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Future Improvements
              </h2>
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {project.future_improvements}
              </div>
            </section>
          )}

          {project.notes && (
            <section className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Important Private Notes
              </h2>
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {project.notes}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Column: Tech, Team, Linked Hackathons */}
        <div className="space-y-6">
          {/* Technologies */}
          {project.technologies.length > 0 && (
            <div className="p-5 rounded-xl border border-border/80 bg-card space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>Technologies</span>
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((t) => (
                  <span
                    key={t.id}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Team Members */}
          {project.team_members.length > 0 && (
            <div className="p-5 rounded-xl border border-border/80 bg-card space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Team ({project.team_members.length})</span>
              </h2>
              <div className="space-y-2">
                {project.team_members.map((tm) => (
                  <div key={tm.id} className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-foreground">{tm.name}</p>
                      {tm.role && <p className="text-[11px] text-muted-foreground">{tm.role}</p>}
                    </div>
                    {tm.linkedin_url && (
                      <a
                        href={tm.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                        title="LinkedIn Profile"
                      >
                        <LinkedinIcon className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Linked Hackathons */}
          {project.hackathons.length > 0 && (
            <div className="p-5 rounded-xl border border-border/80 bg-card space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-primary" />
                <span>Hackathons ({project.hackathons.length})</span>
              </h2>
              <div className="space-y-2">
                {project.hackathons.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => navigate(`/hackathons/${h.id}`)}
                    className="p-2.5 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    <p className="text-xs font-medium text-foreground truncate">{h.name}</p>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                      <span className="capitalize">{h.result.replace('_', ' ')}</span>
                      {h.start_date && <span>{h.start_date.split('-')[0]}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      <LightboxModal
        images={images}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}

