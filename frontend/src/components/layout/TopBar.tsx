import { useState } from 'react';
import { Search, Plus, Menu } from 'lucide-react';
import { HealthIndicator } from './HealthIndicator';
import { ThemeToggle } from './ThemeToggle';
import { QuickAddModal } from './QuickAddModal';

interface TopBarProps {
  onOpenMobileSidebar: () => void;
}

export function TopBar({ onOpenMobileSidebar }: TopBarProps) {
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm px-4 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left: Mobile hamburger & visual search box */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Visual search box only */}
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search commands, notes, tasks... (Ctrl + K)"
            readOnly
            className="w-full pl-8 pr-12 py-1.5 text-xs rounded-lg border border-border bg-muted/40 text-foreground placeholder:text-muted-foreground/70 focus:outline-none cursor-default"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-card text-muted-foreground pointer-events-none">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Backend Status Indicator */}
        <HealthIndicator />

        {/* Quick Add Button */}
        <button
          onClick={() => setQuickAddOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Quick Add</span>
        </button>

        {/* Dark/Light mode toggle */}
        <ThemeToggle />
      </div>

      {/* Quick Add Dialog */}
      <QuickAddModal isOpen={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </header>
  );
}
