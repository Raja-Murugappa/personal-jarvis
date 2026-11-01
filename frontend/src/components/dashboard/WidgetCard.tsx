import React from 'react';
import type { WidgetStatus } from '@/types/dashboard';
import { AlertCircle, Inbox, Loader2 } from 'lucide-react';

interface WidgetCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  status?: WidgetStatus;
  error?: string;
  emptyMessage?: string;
  children?: React.ReactNode;
  className?: string;
}

export function WidgetCard({
  title,
  subtitle,
  icon,
  headerAction,
  status = 'ready',
  error,
  emptyMessage = 'No data available yet.',
  children,
  className = '',
}: WidgetCardProps) {
  return (
    <section
      aria-label={title}
      className={`bg-card text-card-foreground border border-border rounded-xl p-5 shadow-sm transition-shadow duration-150 flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            {icon && <div className="text-muted-foreground shrink-0">{icon}</div>}
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
              {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>

        {/* Content based on status */}
        <div className="pt-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs">Loading data...</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/10 text-destructive text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Failed to load widget</p>
                <p className="opacity-90 mt-0.5">{error || 'An unexpected error occurred.'}</p>
              </div>
            </div>
          )}

          {status === 'empty' && (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2.5 text-muted-foreground">
                <Inbox className="w-5 h-5" />
              </div>
              <p className="text-xs max-w-xs">{emptyMessage}</p>
            </div>
          )}

          {status === 'ready' && children}
        </div>
      </div>
    </section>
  );
}
