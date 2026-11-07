import { useState } from 'react';
import type { JournalEntry } from '@/types/journal';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Smile,
  Zap,
  Moon,
  CheckCircle2,
  BookOpen,
  AlertCircle,
  TrendingUp,
  Flag,
  Sparkles,
  ArrowRightCircle,
} from 'lucide-react';

interface JournalEntryCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (entry: JournalEntry) => void;
  isToday?: boolean;
}

function formatDateString(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function JournalEntryCard({
  entry,
  onEdit,
  onDelete,
  isToday = false,
}: JournalEntryCardProps) {
  const [isExpanded, setIsExpanded] = useState(isToday);

  const sections = [
    { label: 'Completed', value: entry.completed, icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Learned', value: entry.learned, icon: BookOpen, color: 'text-blue-500' },
    { label: 'Went Wrong', value: entry.went_wrong, icon: AlertCircle, color: 'text-amber-500' },
    { label: 'Could Improve', value: entry.could_improve, icon: TrendingUp, color: 'text-purple-500' },
    { label: 'Important Events', value: entry.important_events, icon: Flag, color: 'text-rose-500' },
    { label: 'Reflections', value: entry.reflections, icon: Sparkles, color: 'text-indigo-500' },
    { label: "Tomorrow's Priorities", value: entry.tomorrow_priorities, icon: ArrowRightCircle, color: 'text-teal-500' },
  ].filter((s) => Boolean(s.value && s.value.trim()));

  return (
    <div
      className={`rounded-xl border transition-all ${
        isToday
          ? 'border-primary/40 bg-card shadow-sm'
          : 'border-border/80 bg-card hover:border-border'
      }`}
    >
      {/* Header bar */}
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{formatDateString(entry.entry_date)}</span>
          </div>

          {isToday && (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
              Today
            </span>
          )}

          {/* Quick Metrics */}
          {entry.mood != null && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Smile className="w-3 h-3" />
              Mood {entry.mood}/5
            </span>
          )}

          {entry.energy != null && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Zap className="w-3 h-3" />
              Energy {entry.energy}/5
            </span>
          )}

          {entry.sleep_hours != null && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Moon className="w-3 h-3" />
              {entry.sleep_hours}h sleep
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(entry)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Edit entry"
            aria-label="Edit entry"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(entry)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
            title="Delete entry"
            aria-label="Delete entry"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Summary preview if collapsed and sections exist */}
      {!isExpanded && sections.length > 0 && (
        <div className="px-4 pb-3 pt-0">
          <p className="text-xs text-muted-foreground line-clamp-2">
            <span className="font-medium text-foreground">{sections[0].label}:</span>{' '}
            {sections[0].value}
          </p>
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-border/60 space-y-3">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <div key={sec.label} className="space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground/90">
                  <Icon className={`w-3 h-3 ${sec.color}`} />
                  <span>{sec.label}</span>
                </div>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap pl-4 leading-relaxed">
                  {sec.value}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

