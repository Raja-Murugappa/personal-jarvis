import { useState, useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';
import { DeleteTaskDialog } from '@/components/tasks/DeleteTaskDialog';
import { filterTasks } from '@/lib/filter-tasks';
import type { Task, TaskFiltersState } from '@/types/task';
import { Plus, CheckSquare, AlertCircle, RotateCcw } from 'lucide-react';

export function TasksPage() {
  const { data: tasks, isLoading, isError, error, refetch } = useTasks();

  const [filters, setFilters] = useState<TaskFiltersState>({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    dueDate: 'any',
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Extract unique categories for category dropdown
  const categories = useMemo(() => {
    if (!tasks) return [];
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.category && t.category.trim()) {
        set.add(t.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [tasks]);

  // Client-side pure filtering of loaded tasks
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return filterTasks(tasks, filters);
  }, [tasks, filters]);

  const handleOpenAdd = () => {
    setTaskToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteOpen(true);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      priority: 'all',
      category: 'all',
      dueDate: 'any',
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Tasks and Calendar</h1>
            {tasks && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your personal, academic, and career tasks with local SQLite persistence
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="space-y-3">
          <div className="h-10 rounded-xl bg-muted/50 animate-pulse border border-border" />
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-muted/40 animate-pulse border border-border p-4 flex items-center justify-between"
            >
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted/80 rounded w-1/3" />
                <div className="h-3 bg-muted/60 rounded w-1/4" />
              </div>
              <div className="h-8 w-16 bg-muted/80 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error State with Retry Button */}
      {isError && (
        <div className="p-8 border border-destructive/30 rounded-xl bg-destructive/5 text-center flex flex-col items-center justify-center my-6">
          <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-3">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Unable to load tasks</h2>
          <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
            {error instanceof Error ? error.message : 'Could not establish connection to local backend service.'}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Content when loaded successfully */}
      {!isLoading && !isError && tasks && (
        <>
          {tasks.length === 0 ? (
            /* Empty State: No tasks in the database yet */
            <div className="p-12 border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center bg-card/40 my-8">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">No tasks yet</h2>
              <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
                You haven't created any tasks yet. Add your first task to start organizing your daily priorities.
              </p>
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Filter controls */}
              <TaskFilters
                filters={filters}
                onChange={setFilters}
                categories={categories}
              />

              {/* Filtered Results */}
              {filteredTasks.length === 0 ? (
                /* No matching tasks state */
                <div className="p-8 border border-dashed border-border rounded-xl text-center bg-card/30 flex flex-col items-center justify-center my-4">
                  <h3 className="text-xs font-medium text-foreground">No tasks match your filters</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 mb-3">
                    Try adjusting your search criteria or resetting filters to see other tasks.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Filters</span>
                  </button>
                </div>
              ) : (
                <TaskList
                  tasks={filteredTasks}
                  onEdit={handleOpenEdit}
                  onDelete={handleOpenDelete}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* Task Create / Edit Dialog */}
      <TaskFormDialog
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteTaskDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setTaskToDelete(null);
        }}
        task={taskToDelete}
      />
    </div>
  );
}
export default TasksPage;
