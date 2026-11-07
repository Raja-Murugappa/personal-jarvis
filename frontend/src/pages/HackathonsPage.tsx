import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { useHackathons } from '@/hooks/useHackathons';
import { HackathonFiltersBar } from '@/components/hackathons/HackathonFiltersBar';
import { HackathonTimeline } from '@/components/hackathons/HackathonTimeline';

export function HackathonsPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<string>('all');
  const [year, setYear] = useState<string>('');
  const [technology, setTechnology] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [showArchived, setShowArchived] = useState<boolean>(false);

  const numericYear = year ? parseInt(year, 10) : undefined;

  const {
    data: hackathons = [],
    isLoading,
    isError,
    refetch,
  } = useHackathons({
    result: result !== 'all' ? result : undefined,
    year: Number.isFinite(numericYear) ? numericYear : undefined,
    technology: technology.trim() ? technology.trim() : undefined,
    search: search.trim() ? search.trim() : undefined,
    include_archived: showArchived,
  });

  const isFiltered =
    result !== 'all' ||
    Boolean(year.trim()) ||
    Boolean(technology.trim()) ||
    Boolean(search.trim());

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Hackathons & Competitions
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Timeline of competitive hackathons, team wins, problem statements, and awards.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/hackathons/new')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Hackathon</span>
        </button>
      </div>

      {/* Filters Bar */}
      <HackathonFiltersBar
        result={result}
        onResultChange={setResult}
        year={year}
        onYearChange={setYear}
        technology={technology}
        onTechnologyChange={setTechnology}
        search={search}
        onSearchChange={setSearch}
        showArchived={showArchived}
        onShowArchivedChange={setShowArchived}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl border border-border/60 bg-card/60 animate-pulse p-4 space-y-3"
            >
              <div className="h-4 w-1/4 bg-muted rounded" />
              <div className="h-5 w-1/2 bg-muted rounded" />
              <div className="h-3 w-3/4 bg-muted/60 rounded" />
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
              Failed to load hackathons timeline. Please verify your backend server is online.
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
        <HackathonTimeline
          hackathons={hackathons}
          onAddHackathon={() => navigate('/hackathons/new')}
          isFiltered={isFiltered}
        />
      )}
    </div>
  );
}

