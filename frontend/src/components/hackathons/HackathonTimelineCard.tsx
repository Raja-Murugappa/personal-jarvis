import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, MapPin, FolderGit2, Star } from 'lucide-react';
import type { HackathonListItem, HackathonResult } from '@/types/hackathon';

interface HackathonTimelineCardProps {
  hackathon: HackathonListItem;
}

const RESULT_CONFIG: Record<HackathonResult, { label: string; bg: string; text: string }> = {
  winner: { label: 'Winner 🏆', bg: 'bg-amber-500/15 border-amber-500/30', text: 'text-amber-600 dark:text-amber-400 font-bold' },
  runner_up: { label: 'Runner-up 🥈', bg: 'bg-indigo-500/15 border-indigo-500/30', text: 'text-indigo-600 dark:text-indigo-400 font-semibold' },
  finalist: { label: 'Finalist 🎖️', bg: 'bg-purple-500/15 border-purple-500/30', text: 'text-purple-600 dark:text-purple-400 font-medium' },
  shortlisted: { label: 'Shortlisted', bg: 'bg-blue-500/15 border-blue-500/30', text: 'text-blue-600 dark:text-blue-400 font-medium' },
  participated: { label: 'Participated', bg: 'bg-neutral-500/10 border-neutral-500/20', text: 'text-neutral-600 dark:text-neutral-400 font-normal' },
  other: { label: 'Other', bg: 'bg-neutral-500/10 border-neutral-500/20', text: 'text-neutral-600 dark:text-neutral-400 font-normal' },
};

export function HackathonTimelineCard({ hackathon }: HackathonTimelineCardProps) {
  const navigate = useNavigate();
  const resultInfo = RESULT_CONFIG[hackathon.result] || RESULT_CONFIG.participated;

  return (
    <div
      onClick={() => navigate(`/hackathons/${hackathon.id}`)}
      className="group p-4 sm:p-5 rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
    >
      <div className="flex items-start gap-4 flex-1 min-w-0">
        {/* Cover thumbnail or Trophy Icon */}
        {hackathon.cover_thumbnail_url ? (
          <img
            src={hackathon.cover_thumbnail_url}
            alt={hackathon.name}
            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-border/60 shrink-0"
          />
        ) : (
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Trophy className="w-6 h-6" />
          </div>
        )}

        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
              {hackathon.name}
            </h3>

            <span
              className={`px-2 py-0.5 rounded-full text-[10px] border uppercase ${resultInfo.bg} ${resultInfo.text}`}
            >
              {resultInfo.label}
            </span>

            {hackathon.is_featured && (
              <span title="Featured">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              </span>
            )}
          </div>

          {/* Organiser and Mode */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {hackathon.organiser && <span>By {hackathon.organiser}</span>}
            <span className="capitalize">• {hackathon.mode}</span>
            {hackathon.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{hackathon.location}</span>
              </span>
            )}
            {hackathon.start_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{hackathon.start_date}</span>
              </span>
            )}
          </div>

          {/* Linked Project Pill */}
          {hackathon.project_id && (
            <div className="pt-1">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/projects/${hackathon.project_id}`);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                title="View linked project"
              >
                <FolderGit2 className="w-3 h-3" />
                <span>Project: {hackathon.project_title || `#${hackathon.project_id}`}</span>
              </span>
            </div>
          )}

          {/* Technologies */}
          {hackathon.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {hackathon.technologies.slice(0, 5).map((tech) => (
                <span key={tech} className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground">
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

