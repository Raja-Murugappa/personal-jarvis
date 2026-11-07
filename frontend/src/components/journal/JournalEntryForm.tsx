import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { journalSchema, type JournalFormData } from '@/lib/journal-schema';
import type { JournalEntry, JournalInput } from '@/types/journal';
import { useCreateJournalEntry, useUpdateJournalEntry } from '@/hooks/useJournal';
import { useToast } from '@/components/ui/Toast';
import { X, Loader2, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

interface JournalEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit?: JournalEntry | null;
  defaultDate?: string;
}

function getTodayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function JournalEntryForm({
  isOpen,
  onClose,
  entryToEdit,
  defaultDate,
}: JournalEntryFormProps) {
  const { toast } = useToast();
  const createMutation = useCreateJournalEntry();
  const updateMutation = useUpdateJournalEntry();

  const isEditing = Boolean(entryToEdit);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<JournalFormData>({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      entry_date: defaultDate || getTodayLocalDate(),
      completed: '',
      learned: '',
      went_wrong: '',
      could_improve: '',
      important_events: '',
      reflections: '',
      tomorrow_priorities: '',
      mood: null,
      energy: null,
      sleep_hours: null,
    },
  });

  useEffect(() => {
    if (entryToEdit) {
      reset({
        entry_date: entryToEdit.entry_date,
        completed: entryToEdit.completed || '',
        learned: entryToEdit.learned || '',
        went_wrong: entryToEdit.went_wrong || '',
        could_improve: entryToEdit.could_improve || '',
        important_events: entryToEdit.important_events || '',
        reflections: entryToEdit.reflections || '',
        tomorrow_priorities: entryToEdit.tomorrow_priorities || '',
        mood: entryToEdit.mood ?? null,
        energy: entryToEdit.energy ?? null,
        sleep_hours: entryToEdit.sleep_hours ?? null,
      });
      // Expand tracking if any tracking values exist
      if (
        entryToEdit.mood != null ||
        entryToEdit.energy != null ||
        entryToEdit.sleep_hours != null
      ) {
        setIsTrackingOpen(true);
      }
    } else {
      reset({
        entry_date: defaultDate || getTodayLocalDate(),
        completed: '',
        learned: '',
        went_wrong: '',
        could_improve: '',
        important_events: '',
        reflections: '',
        tomorrow_priorities: '',
        mood: null,
        energy: null,
        sleep_hours: null,
      });
      setIsTrackingOpen(false);
    }
  }, [entryToEdit, defaultDate, reset, isOpen]);

  const handleRequestClose = () => {
    if (isDirty) {
      const confirmDiscard = window.confirm(
        'You have unsaved changes in your journal entry. Are you sure you want to discard them?'
      );
      if (!confirmDiscard) return;
    }
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleRequestClose();
      }
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDirty]);

  if (!isOpen) return null;

  const onSubmit = async (data: JournalFormData) => {
    const payload: JournalInput = {
      entry_date: data.entry_date,
      completed: data.completed?.trim() || undefined,
      learned: data.learned?.trim() || undefined,
      went_wrong: data.went_wrong?.trim() || undefined,
      could_improve: data.could_improve?.trim() || undefined,
      important_events: data.important_events?.trim() || undefined,
      reflections: data.reflections?.trim() || undefined,
      tomorrow_priorities: data.tomorrow_priorities?.trim() || undefined,
      mood: data.mood != null ? Number(data.mood) : null,
      energy: data.energy != null ? Number(data.energy) : null,
      sleep_hours: data.sleep_hours != null ? Number(data.sleep_hours) : null,
    };

    try {
      if (isEditing && entryToEdit) {
        await updateMutation.mutateAsync({
          id: entryToEdit.id,
          data: payload,
        });
        toast('Journal entry updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast('Journal entry created successfully');
      }
      onClose();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save journal entry';
      toast(errorMessage);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="journal-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="bg-card text-card-foreground border border-border w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl shadow-xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 shrink-0">
          <div>
            <h2 id="journal-dialog-title" className="text-base font-semibold">
              {isEditing ? 'Edit Daily Journal' : 'Write Daily Journal'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Reflect on your day. Stored strictly in your local database.
            </p>
          </div>
          <button
            onClick={handleRequestClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="journal-entry-form"
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 space-y-5 overflow-y-auto flex-1"
        >
          {/* Entry Date */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                {...register('entry_date')}
                className={`w-full px-3 py-2 text-xs rounded-lg border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${
                  errors.entry_date ? 'border-destructive' : 'border-border'
                }`}
              />
              <Calendar className="w-4 h-4 text-muted-foreground absolute right-3 top-2.5 pointer-events-none" />
            </div>
            {errors.entry_date && (
              <p className="text-[11px] text-destructive mt-1">
                {errors.entry_date.message}
              </p>
            )}
          </div>

          {/* Form Sections in required exact order:
              1. What I completed today
              2. What I learned
              3. What went wrong
              4. What I could improve
              5. Important events
              6. Personal reflections
              7. Tomorrow's priorities
          */}

          {/* 1. What I completed today */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              1. What I completed today
            </label>
            <textarea
              rows={3}
              placeholder="Key tasks, deliverables, projects, or workouts finished..."
              {...register('completed')}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {errors.completed && (
              <p className="text-[11px] text-destructive mt-1">
                {errors.completed.message}
              </p>
            )}
          </div>

          {/* 2. What I learned */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              2. What I learned
            </label>
            <textarea
              rows={3}
              placeholder="Insights, code patterns, study notes, or concepts mastered..."
              {...register('learned')}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* 3. What went wrong */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              3. What went wrong
            </label>
            <textarea
              rows={2}
              placeholder="Blockers, distractions, mistakes, or unexpected delays..."
              {...register('went_wrong')}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* 4. What I could improve */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              4. What I could improve
            </label>
            <textarea
              rows={2}
              placeholder="Actionable steps or adjustments for future consistency..."
              {...register('could_improve')}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* 5. Important events */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              5. Important events
            </label>
            <textarea
              rows={2}
              placeholder="Meetings, milestones, calls, or life highlights..."
              {...register('important_events')}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* 6. Personal reflections */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              6. Personal reflections
            </label>
            <textarea
              rows={3}
              placeholder="Thoughts, mindset, gratitude, mental clarity..."
              {...register('reflections')}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* 7. Tomorrow's priorities */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              7. Tomorrow's priorities
            </label>
            <textarea
              rows={2}
              placeholder="Top 1–3 focus goals for tomorrow..."
              {...register('tomorrow_priorities')}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Optional Tracking Section (Collapsed) */}
          <div className="pt-2 border-t border-border/70">
            <button
              type="button"
              onClick={() => setIsTrackingOpen(!isTrackingOpen)}
              className="w-full flex items-center justify-between py-2 text-xs font-semibold text-foreground hover:text-foreground/80 transition-colors"
            >
              <span>Optional tracking (Mood, Energy, Sleep)</span>
              {isTrackingOpen ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {isTrackingOpen && (
              <div className="mt-3 p-3.5 rounded-lg border border-border/80 bg-muted/20 space-y-3.5">
                <p className="text-[11px] text-muted-foreground italic">
                  Casual tracking only. This is not a medical or mental-health assessment.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Mood */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Mood (1–5)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      step={1}
                      placeholder="1-5"
                      {...register('mood', {
                        setValueAs: (v) => (v === '' || isNaN(Number(v)) ? null : Number(v)),
                      })}
                      className={`w-full px-3 py-1.5 text-xs rounded-lg border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${
                        errors.mood ? 'border-destructive' : 'border-border'
                      }`}
                    />
                    {errors.mood && (
                      <p className="text-[11px] text-destructive mt-1">
                        {errors.mood.message}
                      </p>
                    )}
                  </div>

                  {/* Energy */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Energy (1–5)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      step={1}
                      placeholder="1-5"
                      {...register('energy', {
                        setValueAs: (v) => (v === '' || isNaN(Number(v)) ? null : Number(v)),
                      })}
                      className={`w-full px-3 py-1.5 text-xs rounded-lg border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${
                        errors.energy ? 'border-destructive' : 'border-border'
                      }`}
                    />
                    {errors.energy && (
                      <p className="text-[11px] text-destructive mt-1">
                        {errors.energy.message}
                      </p>
                    )}
                  </div>

                  {/* Sleep Hours */}
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Sleep Hours (0–24)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={24}
                      step={0.5}
                      placeholder="e.g. 7.5"
                      {...register('sleep_hours', {
                        setValueAs: (v) => (v === '' || isNaN(Number(v)) ? null : Number(v)),
                      })}
                      className={`w-full px-3 py-1.5 text-xs rounded-lg border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${
                        errors.sleep_hours ? 'border-destructive' : 'border-border'
                      }`}
                    />
                    {errors.sleep_hours && (
                      <p className="text-[11px] text-destructive mt-1">
                        {errors.sleep_hours.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-border/80 bg-muted/10 shrink-0">
          <button
            type="button"
            onClick={handleRequestClose}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="journal-entry-form"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isEditing ? 'Update Entry' : 'Save Entry'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
