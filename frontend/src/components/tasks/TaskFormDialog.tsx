import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, type TaskFormData } from '@/lib/task-schema';
import type { Task, TaskInput } from '@/types/task';
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { useToast } from '@/components/ui/Toast';
import { X, Loader2 } from 'lucide-react';

interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

export function TaskFormDialog({ isOpen, onClose, taskToEdit }: TaskFormDialogProps) {
  const { toast } = useToast();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();

  const isEditing = Boolean(taskToEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      category: '',
      due_date: '',
      status: 'todo',
    },
  });

  // Populate form if editing or reset if creating
  useEffect(() => {
    if (taskToEdit) {
      reset({
        title: taskToEdit.title,
        description: taskToEdit.description || '',
        priority: taskToEdit.priority,
        category: taskToEdit.category || '',
        due_date: taskToEdit.due_date || '',
        status: taskToEdit.status,
      });
    } else {
      reset({
        title: '',
        description: '',
        priority: 'medium',
        category: '',
        due_date: '',
        status: 'todo',
      });
    }
  }, [taskToEdit, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: TaskFormData) => {
    const payload: TaskInput = {
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      priority: data.priority,
      category: data.category?.trim() || undefined,
      due_date: data.due_date || undefined,
      status: data.status,
    };

    try {
      if (isEditing && taskToEdit) {
        await updateTaskMutation.mutateAsync({
          id: taskToEdit.id,
          data: payload,
        });
        toast('Task updated successfully');
      } else {
        await createTaskMutation.mutateAsync(payload);
        toast('Task created successfully');
      }
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save task';
      // Error toast shown, dialog stays open so typed text is preserved
      toast(errorMessage);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="bg-card text-card-foreground border border-border w-full max-w-lg rounded-xl shadow-lg p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/80">
          <div>
            <h2 id="task-dialog-title" className="text-base font-semibold">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEditing ? 'Modify task details below' : 'Add a task to your local Personal JARVIS database'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Complete math problem set"
              {...register('title')}
              className={`w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring ${
                errors.title ? 'border-destructive' : 'border-border'
              }`}
            />
            {errors.title && (
              <p className="text-[11px] text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add extra context, steps, or resources..."
              {...register('description')}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          {/* Row: Priority & Status (if editing) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Priority</label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {isEditing ? (
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Status</label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Category (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Academics, Project"
                  {...register('category')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            )}
          </div>

          {/* Row: Category (if editing) & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {isEditing && (
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Category (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Academics, Project"
                  {...register('category')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Due Date (Optional)
              </label>
              <input
                type="date"
                {...register('due_date')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-border/80 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isEditing ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
