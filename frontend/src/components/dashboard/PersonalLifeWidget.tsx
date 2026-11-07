import { useMemo } from 'react';
import { WidgetCard } from './WidgetCard';
import { HeartPulse, Wallet, BookHeart, Flame, AlertCircle, Loader2 } from 'lucide-react';
import { useJournalEntries } from '@/hooks/useJournal';

function getTodayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function PersonalLifeWidget() {
  const todayStr = useMemo(() => getTodayLocalDate(), []);
  const { data: entries, isLoading, isError } = useJournalEntries({
    from: todayStr,
    to: todayStr,
  });

  const isWrittenToday = Boolean(entries && entries.length > 0);

  return (
    <WidgetCard
      title="Personal Life"
      subtitle="Habits, wellness & personal tracking"
      icon={<HeartPulse className="w-4 h-4 text-neutral-500" />}
      status="ready"
    >
      <div className="space-y-3.5">
        {/* Expenses this month - stays empty */}
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-muted/30">
          <div className="flex items-center gap-2 text-xs">
            <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">Expenses This Month</span>
          </div>
          <span className="text-xs text-muted-foreground">$0.00 logged</span>
        </div>

        {/* Journal status - live data */}
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-muted/30">
          <div className="flex items-center gap-2 text-xs">
            <BookHeart className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">Journal Status</span>
          </div>
          {isLoading ? (
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Checking...
            </span>
          ) : isError ? (
            <span className="text-[11px] text-destructive inline-flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3" />
              Unavailable
            </span>
          ) : isWrittenToday ? (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Written today
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              Not written today
            </span>
          )}
        </div>

        {/* Workout streak - stays empty */}
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-muted/30">
          <div className="flex items-center gap-2 text-xs">
            <Flame className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">Workout Streak</span>
          </div>
          <span className="text-xs text-muted-foreground">0 days</span>
        </div>
      </div>
    </WidgetCard>
  );
}
