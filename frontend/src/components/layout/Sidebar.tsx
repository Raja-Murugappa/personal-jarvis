import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  GraduationCap,
  CalendarCheck,
  BrainCircuit,
  Briefcase,
  Newspaper,
  FolderGit2,
  Trophy,
  Dumbbell,
  Wallet,
  BookMarked,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

export interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'JARVIS Assistant', path: '/assistant', icon: Bot },
  { name: 'Academics', path: '/academics', icon: GraduationCap },
  { name: 'Tasks and Calendar', path: '/tasks', icon: CalendarCheck },
  { name: 'Skills and Learning', path: '/skills', icon: BrainCircuit },
  { name: 'Career Intelligence', path: '/career', icon: Briefcase },
  { name: 'AI News', path: '/ai-news', icon: Newspaper },
  { name: 'Projects', path: '/projects', icon: FolderGit2 },
  { name: 'Hackathons', path: '/hackathons', icon: Trophy },
  { name: 'Fitness and Health', path: '/fitness', icon: Dumbbell },
  { name: 'Finance', path: '/finance', icon: Wallet },
  { name: 'Daily Journal', path: '/journal', icon: BookMarked },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Settings and Backup', path: '/settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const content = (
    <aside
      className={`h-full flex flex-col bg-card text-card-foreground border-r border-border transition-all duration-200 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-border/80">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 text-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 flex items-center justify-center font-bold text-xs tracking-wider shrink-0">
              J
            </div>
            <div className="truncate">
              <span className="font-semibold text-sm tracking-tight text-foreground">Personal JARVIS</span>
              <span className="block text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Local First</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto w-7 h-7 rounded-lg bg-neutral-900 text-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 flex items-center justify-center font-bold text-xs">
            J
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List - 14 Items in strict order */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-neutral-900 text-neutral-50 dark:bg-neutral-100 dark:text-neutral-900 font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                } ${collapsed ? 'justify-center px-2' : ''}`
              }
              title={collapsed ? item.name : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-3 border-t border-border/80 text-[11px] text-muted-foreground text-center">
        {!collapsed ? (
          <span>v0.1.0 • Windows Local</span>
        ) : (
          <span>v0.1</span>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <div className="hidden md:block h-screen sticky top-0 shrink-0">
        {content}
      </div>

      {/* Mobile Drawer Backdrop and Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-64 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
