import type { Task } from '@/types/task';
import { TaskRow } from './TaskRow';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskList({ tasks, onEdit, onDelete }: TaskListProps) {
  return (
    <div className="space-y-2.5">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
