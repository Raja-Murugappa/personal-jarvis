import type { Task, TaskStatus } from '@/types/task';
import { useUpdateTask } from '@/hooks/useTasks';
import { useToast } from '@/components/ui/Toast';
import {
  Calendar,
  Tag,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react';

interface TaskRowProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskRow({ task, onEdit, onDelete }: TaskRowProps) {
  const updateTaskMutation = useUpdateTask();
  const { toast } = useToast();

  const handleToggleStatus = async () => {
    const nextStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        data: { status: nextStatus },
      });
      toast(`Task marked as ${nextStatus === 'done' ? 'completed' : 'todo'}`);
    } catch {
      toast('Failed to update task status');
    }
  };

  // Check if overdue
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = task.due_date && task.due_date < todayStr && task.status !== 'done';
  const isToday = task.due_date && task.due_date === todayStr;

  const priorityStyles: Record<string, string> = {
    high: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900',
    medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
    low: 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700',
  };

  return (
    <div className="bg-card text-card-foreground border border-border/80 rounded-xl p-3.5 flex items-start justify-between gap-3 hover:border-border transition-colors group">
      {/* Left: Checkbox & Details */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <button
          onClick={handleToggleStatus}
          className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
          title={`Mark as ${task.status === 'done' ? 'incomplete' : 'complete'}`}
          aria-label="Toggle task completion"
        >
          {task.status === 'done' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : task.status === 'in_progress' ? (
            <Clock className="w-4 h-4 text-amber-500" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-semibold ${
                task.status === 'done'
                  ? 'line-through text-muted-foreground'
                  : 'text-foreground'
              }`}
            >
              {task.title}
            </span>

            {/* Priority Badge */}
            <span
              className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded border ${
                priorityStyles[task.priority] || priorityStyles.medium
              }`}
            >
              {task.priority}
            </span>

            {/* Category */}
            {task.category && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/60 border border-border px-1.5 py-0.5 rounded">
                <Tag className="w-3 h-3" />
                <span>{task.category}</span>
              </span>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta footer: Due date and status */}
          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
            {task.due_date ? (
              <span
                className={`inline-flex items-center gap-1 font-medium ${
                  isOverdue
                    ? 'text-rose-600 dark:text-rose-400 font-semibold'
                    : isToday
                    ? 'text-amber-600 dark:text-amber-400 font-semibold'
                    : ''
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>
                  {task.due_date} {isOverdue && '(Overdue)'} {isToday && '(Today)'}
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground/60">No due date</span>
            )}

            <span className="capitalize text-muted-foreground/80">• Status: {task.status.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Right Action buttons */}
      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Edit task"
          aria-label="Edit task"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(task)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
          title="Delete task"
          aria-label="Delete task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
