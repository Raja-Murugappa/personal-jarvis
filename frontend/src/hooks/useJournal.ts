import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { journalApi } from '@/lib/api';
import type { JournalInput } from '@/types/journal';

export const JOURNAL_QUERY_KEY = ['journal'];

export function useJournalEntries(filters?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: [...JOURNAL_QUERY_KEY, filters],
    queryFn: () => journalApi.list(filters),
    retry: 2,
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JournalInput) => journalApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_QUERY_KEY });
    },
  });
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<JournalInput> }) =>
      journalApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_QUERY_KEY });
    },
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => journalApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_QUERY_KEY });
    },
  });
}

