import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Calendar,
  MapPin,
  FolderGit2,
  Users,
  Cpu,
  Star,
  Edit3,
  Archive,
  RefreshCw,
  Trash2,
  Award,
  Download,
  ExternalLink,
  Globe,
  Video,
  BookOpen,
  Database,
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/showcase/BrandIcons';
import type { Hackathon } from '@/types/hackathon';
import { attachmentsApi, hackathonsApi } from '@/lib/api';
import { LightboxModal } from '@/components/showcase/LightboxModal';
import { ShowcaseCopyButtons } from '@/components/showcase/ShowcaseCopyButtons';

interface HackathonSectionsViewProps {
  hackathon: Hackathon;
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

export function HackathonSectionsView({
  hackathon,
  onArchive,
  onRestore,
  onDelete,
}: HackathonSectionsViewProps) {
  const navigate = useNavigate();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const images = hackathon.attachments.filter((a) => a.mime_type !== 'application/pdf');
  const certificates = hackathon.attachments.filter((a) => a.kind === 'certificate' || a.mime_type === 'application/pdf');
  const coverAttachment = hackathon.attachments.find((a) => a.is_cover) || images[0];

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
        {coverAttachment && (
          <div className="w-full h-56 sm:h-72 bg-muted/40 relative border-b border-border/60 overflow-hidden">
            <img
              src={attachmentsApi.getFileUrl(coverAttachment.id)}
              alt={hackathon.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        )}

        <div className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {hackathon.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase">
                  {hackathon.result.replace('_', ' ')}
                </span>
                {hackathon.is_featured && (
                  <span title="Featured">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  </span>
                )}
              </div>

              {hackathon.organiser && (
                <p className="text-sm font-medium text-muted-foreground">
                  Organised by <span className="text-foreground">{hackathon.organiser}</span>
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <ShowcaseCopyButtons getShowcase={() => hackathonsApi.getShowcase(hackathon.id)} />

              <button
                onClick={() => navigate(`/hackathons/${hackathon.id}/edit`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              {hackathon.archived_at ? (
                <button
                  onClick={onRestore}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </button>
              ) : (
                <button
                  onClick={onArchive}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archive</span>
                </button>
              )}

              <button
                onClick={onDelete}
                className="p-2 text-muted-foreground hover:text-destructive rounded-lg border border-border hover:bg-destructive/10 transition-colors"
                aria-label="Delete hackathon"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Event Metadata */}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground">
            <span className="capitalize px-2 py-0.5 rounded bg-muted text-foreground font-medium">
              {hackathon.mode}
            </span>

            {hackathon.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>{hackathon.location}</span>
              </span>
            )}

            {(hackathon.start_date || hackathon.end_date) && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {hackathon.start_date || 'Start'} → {hackathon.end_date || 'End'}
                </span>
              </span>
            )}

            {hackathon.project && (
              <span
                onClick={() => navigate(`/projects/${hackathon.project!.id}`)}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 cursor-pointer font-medium"
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Project: {hackathon.project.title}</span>
              </span>
            )}
          </div>

          {/* External Links */}
          {hackathon.links.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/60">
              {hackathon.links.map((link) => {
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

      {/* Certificates & Documents */}
      {certificates.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Award className="w-4 h-4 text-primary" />
            <span>Certificates & Submissions ({certificates.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {certificates.map((cert) => (
              <a
                key={cert.id}
                href={attachmentsApi.getFileUrl(cert.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-card hover:bg-muted/50 transition-colors shadow-sm group"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {cert.caption || cert.original_name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {(cert.size_bytes / (1024 * 1024)).toFixed(2)} MB • {cert.kind.toUpperCase()}
                    </p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Photo Gallery Grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span>Event Photos ({images.length})</span>
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

      {/* Detail Narrative Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {hackathon.submission_summary && (
            <section className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                What We Built
              </h2>
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {hackathon.submission_summary}
              </div>
            </section>
          )}

          {hackathon.problem_statement && (
            <section className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Problem Statement
                </h2>
                {hackathon.problem_statement_id && (
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Track ID: {hackathon.problem_statement_id}
                  </span>
                )}
              </div>
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {hackathon.problem_statement}
              </div>
            </section>
          )}

          {hackathon.result_detail && (
            <section className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                <span>Result & Awards</span>
              </h2>
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {hackathon.result_detail}
              </div>
            </section>
          )}

          {hackathon.feedback && (
            <section className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Judges Feedback
              </h2>
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {hackathon.feedback}
              </div>
            </section>
          )}

          {hackathon.lessons_learned && (
            <section className="p-5 rounded-xl border border-border/80 bg-card space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Lessons Learned
              </h2>
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {hackathon.lessons_learned}
              </div>
            </section>
          )}

          {hackathon.notes && (
            <section className="p-5 rounded-xl border border-neutral-500/20 bg-neutral-500/5 space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Important Private Notes
              </h2>
              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {hackathon.notes}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Column: Team, Role, Tech */}
        <div className="space-y-6">
          {hackathon.my_role && (
            <div className="p-5 rounded-xl border border-border/80 bg-card space-y-1.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                My Role
              </h2>
              <p className="text-xs font-medium text-foreground">{hackathon.my_role}</p>
            </div>
          )}

          {hackathon.team_name && (
            <div className="p-5 rounded-xl border border-border/80 bg-card space-y-1.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Team Name
              </h2>
              <p className="text-xs font-medium text-foreground">{hackathon.team_name}</p>
            </div>
          )}

          {/* Team Members */}
          {hackathon.team_members.length > 0 && (
            <div className="p-5 rounded-xl border border-border/80 bg-card space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Team Members ({hackathon.team_members.length})</span>
              </h2>
              <div className="space-y-2">
                {hackathon.team_members.map((tm) => (
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

          {/* Technologies */}
          {hackathon.technologies.length > 0 && (
            <div className="p-5 rounded-xl border border-border/80 bg-card space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>Technologies</span>
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {hackathon.technologies.map((t) => (
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

