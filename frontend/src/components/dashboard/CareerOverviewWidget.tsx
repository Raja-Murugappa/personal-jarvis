import { WidgetCard } from './WidgetCard';
import { Target, Code, Cpu, FolderGit2, AlertCircle } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { Link } from 'react-router-dom';

export function CareerOverviewWidget() {
  const { data: projects = [], isLoading } = useProjects();

  const inProgressCount = projects.filter((p) => p.status === 'in_progress').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;

  return (
    <WidgetCard
      title="Career Overview"
      subtitle="Professional development & skills"
      icon={<Target className="w-4 h-4 text-neutral-500" />}
      status="ready"
    >
      <div className="space-y-3">
        {/* Career Goal */}
        <div className="p-2.5 rounded-lg border border-border/70 bg-muted/30">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium text-foreground flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-muted-foreground" />
              Career Goal
            </span>
            <span className="text-muted-foreground">Unset</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Define your target roles and ambitions in Settings.</p>
        </div>

        {/* Skills In Progress */}
        <div className="p-2.5 rounded-lg border border-border/70 bg-muted/30 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-foreground font-medium">
            <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
            Skills In Progress
          </span>
          <span className="text-muted-foreground">0 active</span>
        </div>

        {/* DSA Progress */}
        <div className="p-2.5 rounded-lg border border-border/70 bg-muted/30 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-foreground font-medium">
            <Code className="w-3.5 h-3.5 text-muted-foreground" />
            DSA Progress
          </span>
          <span className="text-muted-foreground">0 problems logged</span>
        </div>

        {/* Project Progress */}
        <Link
          to="/projects"
          className="p-2.5 rounded-lg border border-border/70 bg-muted/30 flex items-center justify-between text-xs hover:bg-muted/60 transition-colors group"
        >
          <span className="flex items-center gap-1.5 text-foreground font-medium group-hover:text-primary transition-colors">
            <FolderGit2 className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
            Project Progress
          </span>
          <span className="text-muted-foreground">
            {isLoading
              ? 'Loading...'
              : projects.length === 0
              ? '0 projects'
              : `${projects.length} total (${inProgressCount} active, ${completedCount} done)`}
          </span>
        </Link>

        {/* Skill Gaps */}
        <div className="p-2.5 rounded-lg border border-border/70 bg-muted/30 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-foreground font-medium">
            <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
            Skill Gaps
          </span>
          <span className="text-muted-foreground">No gaps analyzed</span>
        </div>
      </div>
    </WidgetCard>
  );
}
