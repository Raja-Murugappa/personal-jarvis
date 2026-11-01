import { WidgetCard } from './WidgetCard';
import { HeartPulse, Wallet, BookHeart, Flame } from 'lucide-react';

export function PersonalLifeWidget() {
  return (
    <WidgetCard
      title="Personal Life"
      subtitle="Habits, wellness & personal tracking"
      icon={<HeartPulse className="w-4 h-4 text-neutral-500" />}
      status="ready"
    >
      <div className="space-y-3.5">
        {/* Expenses this month */}
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-muted/30">
          <div className="flex items-center gap-2 text-xs">
            <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">Expenses This Month</span>
          </div>
          <span className="text-xs text-muted-foreground">$0.00 logged</span>
        </div>

        {/* Journal status */}
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-muted/30">
          <div className="flex items-center gap-2 text-xs">
            <BookHeart className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">Journal Status</span>
          </div>
          <span className="text-xs text-muted-foreground">Not logged today</span>
        </div>

        {/* Workout streak */}
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
