import { WidgetCard } from './WidgetCard';
import { QUICK_ACTIONS } from '@/lib/quick-actions';
import { useToast } from '@/components/ui/Toast';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  CheckSquare,
  BookOpen,
  Code,
  FolderPlus,
  DollarSign,
  FileText,
  Dumbbell,
  Sparkles,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  CheckSquare,
  BookOpen,
  Code,
  FolderPlus,
  DollarSign,
  FileText,
  Dumbbell,
  Sparkles,
};

export function QuickActionsWidget() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAction = (_id: string, actionType: 'toast' | 'navigate', targetPath?: string) => {
    if (actionType === 'navigate' && targetPath) {
      navigate(targetPath);
      return;
    }
    toast('Not connected yet');
  };

  return (
    <WidgetCard
      title="Quick Actions"
      subtitle="Frequently used shortcuts"
      icon={<Zap className="w-4 h-4 text-neutral-500" />}
      status="ready"
    >
      <div className="grid grid-cols-2 gap-2">
        {QUICK_ACTIONS.map((action) => {
          const IconComponent = ICON_MAP[action.iconName] || Zap;
          const isAssistant = action.id === 'ask-jarvis';

          return (
            <button
              key={action.id}
              onClick={() => handleAction(action.id, action.actionType, action.targetPath)}
              className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs text-left transition-colors duration-150 ${
                isAssistant
                  ? 'border-neutral-400/50 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 dark:hover:bg-neutral-700 font-medium'
                  : 'border-border/70 bg-card hover:bg-muted text-card-foreground'
              }`}
            >
              <IconComponent className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{action.label}</span>
            </button>
          );
        })}
      </div>
    </WidgetCard>
  );
}
