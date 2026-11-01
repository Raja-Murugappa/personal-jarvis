import type { QuickAction } from '@/types/dashboard';

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'add-task',
    label: 'Add task',
    iconName: 'CheckSquare',
    actionType: 'toast',
  },
  {
    id: 'record-study',
    label: 'Record study session',
    iconName: 'BookOpen',
    actionType: 'toast',
  },
  {
    id: 'add-dsa',
    label: 'Add DSA problem',
    iconName: 'Code',
    actionType: 'toast',
  },
  {
    id: 'add-project',
    label: 'Add project',
    iconName: 'FolderPlus',
    actionType: 'toast',
  },
  {
    id: 'record-expense',
    label: 'Record expense',
    iconName: 'DollarSign',
    actionType: 'toast',
  },
  {
    id: 'add-journal',
    label: 'Add journal',
    iconName: 'FileText',
    actionType: 'toast',
  },
  {
    id: 'log-workout',
    label: 'Log workout',
    iconName: 'Dumbbell',
    actionType: 'toast',
  },
  {
    id: 'ask-jarvis',
    label: 'Ask JARVIS',
    iconName: 'Sparkles',
    actionType: 'navigate',
    targetPath: '/assistant',
  },
];
