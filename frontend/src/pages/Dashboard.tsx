import { useState } from 'react';
import { useWidgetVisibility } from '@/components/dashboard/useWidgetVisibility';
import { DailyOverviewWidget } from '@/components/dashboard/DailyOverviewWidget';
import { AcademicOverviewWidget } from '@/components/dashboard/AcademicOverviewWidget';
import { CareerOverviewWidget } from '@/components/dashboard/CareerOverviewWidget';
import { JarvisSummaryWidget } from '@/components/dashboard/JarvisSummaryWidget';
import { PersonalLifeWidget } from '@/components/dashboard/PersonalLifeWidget';
import { QuickActionsWidget } from '@/components/dashboard/QuickActionsWidget';
import { CustomizeWidgetsDialog } from '@/components/dashboard/CustomizeWidgetsDialog';
import { SlidersHorizontal, LayoutGrid, RotateCcw } from 'lucide-react';

export function Dashboard() {
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const { visibility, toggleWidget, restoreAll, allHidden, isMounted } = useWidgetVisibility();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your single-user personal command center and overview
          </p>
        </div>

        <button
          onClick={() => setIsCustomizeOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors shadow-sm self-start sm:self-auto"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Customize widgets</span>
        </button>
      </div>

      {/* Main Grid Area */}
      {isMounted && allHidden ? (
        /* Empty state when all widgets are hidden */
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-xl text-center bg-card/40 my-8">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">All widgets are hidden</h2>
          <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
            You have toggled off all dashboard widgets. You can restore them anytime or enable individual widgets in the customize menu.
          </p>
          <button
            onClick={restoreAll}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore all widgets
          </button>
        </div>
      ) : (
        /* Responsive Grid: 1 col mobile, 2 col tablet, 3 col desktop */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
          {visibility['daily-overview'] && <DailyOverviewWidget />}
          {visibility['academic-overview'] && <AcademicOverviewWidget />}
          {visibility['career-overview'] && <CareerOverviewWidget />}
          {visibility['jarvis-summary'] && <JarvisSummaryWidget />}
          {visibility['personal-life'] && <PersonalLifeWidget />}
          {visibility['quick-actions'] && <QuickActionsWidget />}
        </div>
      )}

      {/* Customize Widgets Dialog */}
      <CustomizeWidgetsDialog
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        visibility={visibility}
        onToggle={toggleWidget}
        onRestoreAll={restoreAll}
      />
    </div>
  );
}
export default Dashboard;
