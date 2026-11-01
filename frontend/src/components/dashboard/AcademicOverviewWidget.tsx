import { WidgetCard } from './WidgetCard';
import { GraduationCap, BookOpen, Clock, CalendarDays, Percent } from 'lucide-react';

export function AcademicOverviewWidget() {
  return (
    <WidgetCard
      title="Academic Overview"
      subtitle="Curriculum and schedule metrics"
      icon={<GraduationCap className="w-4 h-4 text-neutral-500" />}
      status="ready"
    >
      <div className="space-y-3.5">
        {/* Current Semester */}
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-muted/30">
          <div className="flex items-center gap-2 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">Current Semester</span>
          </div>
          <span className="text-xs text-muted-foreground">Not set</span>
        </div>

        {/* Upcoming Exams */}
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-muted/30">
          <div className="flex items-center gap-2 text-xs">
            <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">Upcoming Exams</span>
          </div>
          <span className="text-xs text-muted-foreground">No exams scheduled</span>
        </div>

        {/* Assignment Deadlines */}
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-muted/30">
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">Assignment Deadlines</span>
          </div>
          <span className="text-xs text-muted-foreground">No active assignments</span>
        </div>

        {/* Attendance */}
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-muted/30">
          <div className="flex items-center gap-2 text-xs">
            <Percent className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium text-foreground">Attendance</span>
          </div>
          <span className="text-xs text-muted-foreground">No records</span>
        </div>
      </div>
    </WidgetCard>
  );
}
