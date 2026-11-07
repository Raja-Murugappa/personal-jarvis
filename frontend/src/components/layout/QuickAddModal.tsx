import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/Toast';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';
import { JournalEntryForm } from '@/components/journal/JournalEntryForm';
import {
  X,
  Plus,
  CheckSquare,
  BookOpen,
  DollarSign,
  Dumbbell,
  GraduationCap,
  Cpu,
  Sparkles,
  FolderGit2,
  Trophy,
} from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_ADD_ACTIONS = [
  { id: 'task', title: 'Add Task', description: 'Create a new personal or academic task', icon: CheckSquare },
  { id: 'project', title: 'Add Project', description: 'Create a new portfolio project or showcase', icon: FolderGit2 },
  { id: 'hackathon', title: 'Log Hackathon', description: 'Record a hackathon or competition', icon: Trophy },
  { id: 'journal', title: 'New Journal Entry', description: 'Reflect on today’s events and thoughts', icon: BookOpen },
  { id: 'expense', title: 'Log Expense', description: 'Record an expense or income entry', icon: DollarSign },
  { id: 'workout', title: 'Track Workout', description: 'Log a fitness or exercise session', icon: Dumbbell },
  { id: 'academics', title: 'Log Academic Note', description: 'Save a course syllabus or exam milestone', icon: GraduationCap },
  { id: 'skill', title: 'Add Skill Item', description: 'Track a learning goal or roadmap item', icon: Cpu },
  { id: 'prompt', title: 'Quick Prompt', description: 'Send an instruction or note to JARVIS', icon: Sparkles },
];

export function QuickAddModal({ isOpen, onClose }: QuickAddModalProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddJournalOpen, setIsAddJournalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleActionClick = (actionId: string) => {
    if (actionId === 'task') {
      onClose();
      setIsAddTaskOpen(true);
      return;
    }
    if (actionId === 'project') {
      onClose();
      navigate('/projects/new');
      return;
    }
    if (actionId === 'hackathon') {
      onClose();
      navigate('/hackathons/new');
      return;
    }
    if (actionId === 'journal') {
      onClose();
      setIsAddJournalOpen(true);
      return;
    }
    toast('Not connected yet');
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-add-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="bg-card text-card-foreground border border-border w-full max-w-lg rounded-xl shadow-lg p-6 relative">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h2 id="quick-add-title" className="text-base font-semibold">
                    Quick Add
                  </h2>
                  <p className="text-xs text-muted-foreground">Select an item to quickly create or record</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 7 Actions */}
            <div className="py-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {QUICK_ADD_ACTIONS.map((action) => {
                const Icon = action.icon;
                const isTaskAction = action.id === 'task';

                return (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(action.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-border/70 hover:bg-muted/50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-muted text-muted-foreground group-hover:text-foreground transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{action.title}</div>
                        <div className="text-xs text-muted-foreground">{action.description}</div>
                      </div>
                    </div>
                    {isTaskAction ? (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded border border-primary/20 bg-primary/10 text-primary shrink-0">
                        Ready
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded border border-border bg-muted/60 text-muted-foreground shrink-0">
                        Not connected yet
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-border/80 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task form modal opened from Quick Add */}
      <TaskFormDialog
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
      />

      {/* Journal entry modal opened from Quick Add */}
      <JournalEntryForm
        isOpen={isAddJournalOpen}
        onClose={() => setIsAddJournalOpen(false)}
      />
    </>
  );
}
