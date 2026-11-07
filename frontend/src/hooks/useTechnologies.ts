import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { technologiesApi } from '@/lib/api';

export const TECHNOLOGIES_QUERY_KEY = ['technologies'];

export function useTechnologies(search?: string) {
  return useQuery({
    queryKey: [...TECHNOLOGIES_QUERY_KEY, search],
    queryFn: () => technologiesApi.list(search),
    staleTime: 60000,
  });
}

export function useDeleteTechnology() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => technologiesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TECHNOLOGIES_QUERY_KEY });
    },
  });
}

