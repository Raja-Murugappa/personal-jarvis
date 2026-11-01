
export type WidgetId =
  | 'daily-overview'
  | 'academic-overview'
  | 'career-overview'
  | 'jarvis-summary'
  | 'personal-life'
  | 'quick-actions';

export type WidgetStatus = 'loading' | 'error' | 'empty' | 'ready';

export interface WidgetState<T> {
  status: WidgetStatus;
  data?: T;
  error?: string;
}

// Widget Data Models (for upcoming backend slices)
export interface DailyOverviewData {
  todayClasses: Array<{ id: string; name: string; time: string; room?: string }>;
  todayTasks: Array<{ id: string; title: string; priority: string; completed: boolean }>;
  upcomingDeadlines: Array<{ id: string; title: string; dueDate: string }>;
}

export interface AcademicOverviewData {
  currentSemester: string | null;
  upcomingExams: Array<{ id: string; subject: string; date: string }>;
  assignmentDeadlines: Array<{ id: string; title: string; dueDate: string }>;
  attendancePercentage: number | null;
}

export interface CareerOverviewData {
  careerGoal: string | null;
  skillsInProgress: Array<{ id: string; name: string; progress: number }>;
  dsaSolvedCount: number | null;
  activeProjectsCount: number | null;
  identifiedSkillGaps: Array<{ id: string; skill: string }>;
}

export interface JarvisSummaryData {
  summaryText: string;
  generatedAt: string;
}

export interface PersonalLifeData {
  monthlyExpensesTotal: number | null;
  journalLoggedToday: boolean | null;
  workoutStreakDays: number | null;
}

export interface QuickAction {
  id: string;
  label: string;
  iconName: string;
  actionType: 'toast' | 'navigate';
  targetPath?: string;
}

export type WidgetVisibilityMap = Record<WidgetId, boolean>;
