import { z } from 'zod';

export const TEXT_SECTIONS = [
  'completed',
  'learned',
  'went_wrong',
  'could_improve',
  'important_events',
  'reflections',
  'tomorrow_priorities',
] as const;

export const journalSchema = z
  .object({
    entry_date: z
      .string()
      .min(1, 'Entry date is required')
      .refine(
        (val) => {
          if (!val) return false;
          const [year, month, day] = val.split('-').map(Number);
          if (!year || !month || !day) return false;
          const entryDate = new Date(year, month - 1, day);
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(23, 59, 59, 999);
          return entryDate <= tomorrow;
        },
        { message: 'Entry date cannot be more than 1 day in the future' }
      ),
    completed: z.string().optional(),
    learned: z.string().optional(),
    went_wrong: z.string().optional(),
    could_improve: z.string().optional(),
    important_events: z.string().optional(),
    reflections: z.string().optional(),
    tomorrow_priorities: z.string().optional(),
    mood: z.number().int().min(1, 'Mood must be at least 1').max(5, 'Mood cannot exceed 5').nullable().optional(),
    energy: z.number().int().min(1, 'Energy must be at least 1').max(5, 'Energy cannot exceed 5').nullable().optional(),
    sleep_hours: z.number().min(0, 'Sleep hours cannot be negative').max(24, 'Sleep hours cannot exceed 24').nullable().optional(),
  })
  .refine(
    (data) => {
      return TEXT_SECTIONS.some((field) => {
        const val = data[field];
        return typeof val === 'string' && val.trim().length > 0;
      });
    },
    {
      message: 'Write at least one section',
      path: ['completed'],
    }
  );

export type JournalFormData = z.infer<typeof journalSchema>;
