import { useState, useEffect, useCallback } from 'react';
import type { WidgetId, WidgetVisibilityMap } from '@/types/dashboard';

const STORAGE_KEY = 'jarvis_dashboard_widgets_v1';

export const DEFAULT_VISIBILITY: WidgetVisibilityMap = {
  'daily-overview': true,
  'academic-overview': true,
  'career-overview': true,
  'jarvis-summary': true,
  'personal-life': true,
  'quick-actions': true,
};

export const WIDGET_METADATA: Record<WidgetId, { title: string; description: string }> = {
  'daily-overview': {
    title: 'Daily Overview',
    description: 'Today’s date, classes, tasks, and upcoming deadlines.',
  },
  'academic-overview': {
    title: 'Academic Overview',
    description: 'Current semester, exams, assignments, and attendance.',
  },
  'career-overview': {
    title: 'Career Overview',
    description: 'Career goals, skills in progress, DSA, and project tracking.',
  },
  'jarvis-summary': {
    title: 'JARVIS Summary',
    description: 'Personalized AI assistant executive briefing.',
  },
  'personal-life': {
    title: 'Personal Life',
    description: 'Monthly expenses, journal status, and workout streaks.',
  },
  'quick-actions': {
    title: 'Quick Actions',
    description: 'Instant shortcuts for creating tasks, notes, logs, and asking JARVIS.',
  },
};

export function useWidgetVisibility() {
  const [visibility, setVisibility] = useState<WidgetVisibilityMap>(DEFAULT_VISIBILITY);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Read safely from localStorage only after component mounts to avoid hydration / render mismatches
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === 'object' && parsed !== null) {
          setVisibility((prev) => ({
            ...prev,
            ...parsed,
          }));
        }
      }
    } catch (err) {
      console.warn('Failed to read widget visibility from localStorage:', err);
    } finally {
      setIsMounted(true);
    }
  }, []);

  const toggleWidget = useCallback((id: WidgetId) => {
    setVisibility((prev) => {
      const updated = {
        ...prev,
        [id]: !prev[id],
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save widget visibility to localStorage:', err);
      }
      return updated;
    });
  }, []);

  const restoreAll = useCallback(() => {
    setVisibility(DEFAULT_VISIBILITY);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_VISIBILITY));
    } catch (err) {
      console.warn('Failed to restore widget visibility:', err);
    }
  }, []);

  const allHidden = Object.values(visibility).every((v) => !v);

  return {
    visibility,
    toggleWidget,
    restoreAll,
    allHidden,
    isMounted,
  };
}
