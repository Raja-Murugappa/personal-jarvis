import { describe, it, expect } from 'vitest';
import { journalSchema } from './journal-schema';

describe('journalSchema', () => {
  const today = '2026-11-04';

  it('validates a complete journal entry', () => {
    const data = {
      entry_date: today,
      completed: 'Solved 2 LeetCode problems',
      learned: 'Monotonic stack algorithm',
      went_wrong: 'Spent too much time debugging',
      could_improve: 'Write test cases first',
      important_events: 'Standup call at 2pm',
      reflections: 'Steady progress today',
      tomorrow_priorities: 'Work on dynamic programming',
      mood: 4,
      energy: 5,
      sleep_hours: 8,
    };
    const result = journalSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('accepts an entry with only one filled text field', () => {
    const data = {
      entry_date: today,
      completed: 'Finished homework',
    };
    const result = journalSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('rejects an entry with only tracking fields filled and no text section', () => {
    const data = {
      entry_date: today,
      mood: 3,
      energy: 4,
      sleep_hours: 7.5,
    };
    const result = journalSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Write at least one section');
    }
  });

  it('rejects an empty entry where no fields are filled', () => {
    const data = {
      entry_date: today,
    };
    const result = journalSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Write at least one section');
    }
  });

  it('rejects whitespace-only text fields', () => {
    const data = {
      entry_date: today,
      completed: '    ',
      reflections: '  ',
    };
    const result = journalSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects invalid mood ranges', () => {
    expect(journalSchema.safeParse({ entry_date: today, completed: 'Done', mood: 6 }).success).toBe(false);
    expect(journalSchema.safeParse({ entry_date: today, completed: 'Done', mood: 0 }).success).toBe(false);
  });

  it('rejects invalid energy ranges', () => {
    expect(journalSchema.safeParse({ entry_date: today, completed: 'Done', energy: 6 }).success).toBe(false);
    expect(journalSchema.safeParse({ entry_date: today, completed: 'Done', energy: 0 }).success).toBe(false);
  });

  it('rejects invalid sleep hours', () => {
    expect(journalSchema.safeParse({ entry_date: today, completed: 'Done', sleep_hours: 25 }).success).toBe(false);
    expect(journalSchema.safeParse({ entry_date: today, completed: 'Done', sleep_hours: -1 }).success).toBe(false);
  });

  it('rejects dates more than 1 day in the future', () => {
    const futureDate = '2099-01-01';
    const result = journalSchema.safeParse({ entry_date: futureDate, completed: 'Future entry' });
    expect(result.success).toBe(false);
  });
});
