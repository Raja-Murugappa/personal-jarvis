import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hackathonsApi } from '@/lib/api';
import type { HackathonInput } from '@/types/hackathon';
import { TECHNOLOGIES_QUERY_KEY } from './useTechnologies';
import { PROJECTS_QUERY_KEY } from './useProjects';

export const HACKATHONS_QUERY_KEY = ['hackathons'];

export function useHackathons(filters?: {
  result?: string;
  year?: number;
  technology?: string;
  featured?: boolean;
  search?: string;
  include_archived?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: [...HACKATHONS_QUERY_KEY, filters],
    queryFn: () => hackathonsApi.list(filters),
    retry: 2,
  });
}

export function useHackathon(id: number | null | undefined) {
  return useQuery({
    queryKey: [...HACKATHONS_QUERY_KEY, 'detail', id],
    queryFn: () => (id ? hackathonsApi.get(id) : Promise.reject('No ID provided')),
    enabled: Boolean(id),
    retry: 2,
  });
}

export function useCreateHackathon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: HackathonInput) => hackathonsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HACKATHONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TECHNOLOGIES_QUERY_KEY });
    },
  });
}

export function useUpdateHackathon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<HackathonInput> }) =>
      hackathonsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: HACKATHONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...HACKATHONS_QUERY_KEY, 'detail', variables.id] });
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TECHNOLOGIES_QUERY_KEY });
    },
  });
}

export function useArchiveHackathon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hackathonsApi.archive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: HACKATHONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...HACKATHONS_QUERY_KEY, 'detail', id] });
    },
  });
}

export function useRestoreHackathon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hackathonsApi.restore(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: HACKATHONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...HACKATHONS_QUERY_KEY, 'detail', id] });
    },
  });
}

export function useDeleteHackathon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hackathonsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HACKATHONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

export function useHackathonShowcase(id: number | null | undefined) {
  return useQuery({
    queryKey: [...HACKATHONS_QUERY_KEY, 'showcase', id],
    queryFn: () => (id ? hackathonsApi.getShowcase(id) : Promise.reject('No ID provided')),
    enabled: Boolean(id),
  });
}

