import { Trophy, Plus, SearchX } from 'lucide-react';
import type { HackathonListItem } from '@/types/hackathon';
import { HackathonTimelineCard } from './HackathonTimelineCard';

interface HackathonTimelineProps {
  hackathons: HackathonListItem[];
  onAddHackathon: () => void;
  isFiltered: boolean;
}

export function HackathonTimeline({
  hackathons,
  onAddHackathon,
  isFiltered,
}: HackathonTimelineProps) {
  if (hackathons.length === 0) {
    if (isFiltered) {
      return (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <SearchX className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No hackathons match your filters</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your result, year, or technology filters to see more competitions.
          </p>
        </div>
      );
    }

    return (
      <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
          <Trophy className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">No hackathons logged yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Track your competitive programming, hackathons, team wins, and awards.
          </p>
        </div>
        <button
          onClick={onAddHackathon}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add your first hackathon</span>
        </button>
      </div>
    );
  }

  // Group by year
  const groupedByYear: Record<string, HackathonListItem[]> = {};
  hackathons.forEach((h) => {
    const yr = h.start_date ? h.start_date.split('-')[0] : 'Undated';
    if (!groupedByYear[yr]) groupedByYear[yr] = [];
    groupedByYear[yr].push(h);
  });

  const years = Object.keys(groupedByYear).sort((a, b) => {
    if (a === 'Undated') return 1;
    if (b === 'Undated') return -1;
    return Number(b) - Number(a);
  });

  return (
    <div className="space-y-8">
      {years.map((year) => (
        <div key={year} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-muted text-xs font-bold font-mono text-foreground">
              {year}
            </span>
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-xs text-muted-foreground font-mono">
              {groupedByYear[year].length} event{groupedByYear[year].length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-3">
            {groupedByYear[year].map((hackathon) => (
              <HackathonTimelineCard key={hackathon.id} hackathon={hackathon} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

