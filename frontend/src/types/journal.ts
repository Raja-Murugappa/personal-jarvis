export interface JournalEntry {
  id: number;
  entry_date: string;
  completed?: string | null;
  learned?: string | null;
  went_wrong?: string | null;
  could_improve?: string | null;
  important_events?: string | null;
  reflections?: string | null;
  tomorrow_priorities?: string | null;
  mood?: number | null;
  energy?: number | null;
  sleep_hours?: number | null;
  created_at: string;
  updated_at: string;
}

export interface JournalInput {
  entry_date: string;
  completed?: string;
  learned?: string;
  went_wrong?: string;
  could_improve?: string;
  important_events?: string;
  reflections?: string;
  tomorrow_priorities?: string;
  mood?: number | null;
  energy?: number | null;
  sleep_hours?: number | null;
}

