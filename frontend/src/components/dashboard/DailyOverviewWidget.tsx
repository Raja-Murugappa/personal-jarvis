import { useState, useEffect } from 'react';
import { WidgetCard } from './WidgetCard';
import { Calendar, Clock, CheckSquare, AlertTriangle } from 'lucide-react';

export function DailyOverviewWidget() {
  const [dateInfo, setDateInfo] = useState<{ weekday: string; formattedDate: string } | null>(null);

  useEffect(() => {
    // Computed safely on the client after mount
    const now = new Date();
    const weekday = now.toLocaleDateString(undefined, { weekday: 'long' });
    const formattedDate = now.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    setDateInfo({ weekday, formattedDate });
  }, []);

  return (
    <WidgetCard
      title="Daily Overview"
      subtitle={dateInfo ? `${dateInfo.weekday}, ${dateInfo.formattedDate}` : 'Loading date...'}
      icon={<Calendar className="w-4 h-4 text-neutral-500" />}
      status="ready"
    >
      <div className="space-y-4">
        {/* Today's Classes */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Today's Classes</span>
          </div>
          <div className="p-2.5 rounded-lg border border-border/70 bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
            <span>No classes scheduled for today</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 bg-muted px-1.5 py-0.5 rounded">Empty</span>
          </div>
        </div>

        {/* Today's Tasks */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Today's Tasks</span>
          </div>
          <div className="p-2.5 rounded-lg border border-border/70 bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
            <span>No tasks due today</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 bg-muted px-1.5 py-0.5 rounded">Empty</span>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Upcoming Deadlines</span>
          </div>
          <div className="p-2.5 rounded-lg border border-border/70 bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
            <span>No upcoming deadlines</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 bg-muted px-1.5 py-0.5 rounded">Empty</span>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}
