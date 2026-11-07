import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api';
import type { ProjectInput } from '@/types/project';
import { TECHNOLOGIES_QUERY_KEY } from './useTechnologies';

export const PROJECTS_QUERY_KEY = ['projects'];

export function useProjects(filters?: {
  status?: string;
  category?: string;
  technology?: string;
  featured?: boolean;
  search?: string;
  include_archived?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, filters],
    queryFn: () => projectsApi.list(filters),
    retry: 2,
  });
}

export function useProject(id: number | null | undefined) {
  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, 'detail', id],
    queryFn: () => (id ? projectsApi.get(id) : Promise.reject('No ID provided')),
    enabled: Boolean(id),
    retry: 2,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectInput) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TECHNOLOGIES_QUERY_KEY });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProjectInput> }) =>
      projectsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...PROJECTS_QUERY_KEY, 'detail', variables.id] });
      queryClient.invalidateQueries({ queryKey: TECHNOLOGIES_QUERY_KEY });
    },
  });
}

export function useArchiveProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectsApi.archive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...PROJECTS_QUERY_KEY, 'detail', id] });
    },
  });
}

export function useRestoreProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectsApi.restore(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...PROJECTS_QUERY_KEY, 'detail', id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

export function useProjectShowcase(id: number | null | undefined) {
  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, 'showcase', id],
    queryFn: () => (id ? projectsApi.getShowcase(id) : Promise.reject('No ID provided')),
    enabled: Boolean(id),
  });
}

