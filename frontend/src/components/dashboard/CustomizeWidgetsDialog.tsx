import { useEffect } from 'react';
import type { WidgetId, WidgetVisibilityMap } from '@/types/dashboard';
import { WIDGET_METADATA } from './useWidgetVisibility';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface CustomizeWidgetsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  visibility: WidgetVisibilityMap;
  onToggle: (id: WidgetId) => void;
  onRestoreAll: () => void;
}

export function CustomizeWidgetsDialog({
  isOpen,
  onClose,
  visibility,
  onToggle,
  onRestoreAll,
}: CustomizeWidgetsDialogProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widgetIds = Object.keys(WIDGET_METADATA) as WidgetId[];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="customize-widgets-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="bg-card text-card-foreground border border-border w-full max-w-md rounded-xl shadow-lg p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/80">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <h2 id="customize-widgets-title" className="text-base font-semibold">
              Customize Dashboard Widgets
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {widgetIds.map((id) => {
            const meta = WIDGET_METADATA[id];
            const isVisible = visibility[id];

            return (
              <div
                key={id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/70 hover:bg-muted/40 transition-colors"
              >
                <div className="pr-4">
                  <div className="text-sm font-medium text-foreground">{meta.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{meta.description}</div>
                </div>

                {/* Accessible switch toggle */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isVisible}
                  onClick={() => onToggle(id)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                    isVisible ? 'bg-neutral-900 dark:bg-neutral-100' : 'bg-neutral-300 dark:bg-neutral-700'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-neutral-900 shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isVisible ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onRestoreAll}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore all widgets
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
