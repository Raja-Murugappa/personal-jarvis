import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attachmentsApi } from '@/lib/api';
import type { AttachmentUpdate } from '@/types/attachment';
import { PROJECTS_QUERY_KEY } from './useProjects';
import { HACKATHONS_QUERY_KEY } from './useHackathons';

export function useUploadProjectAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      file,
      kind,
      caption,
      altText,
    }: {
      projectId: number;
      file: File;
      kind?: 'image' | 'document' | 'certificate';
      caption?: string;
      altText?: string;
    }) => attachmentsApi.uploadProjectAttachment(projectId, file, kind, caption, altText),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...PROJECTS_QUERY_KEY, 'detail', variables.projectId] });
    },
  });
}

export function useUploadHackathonAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      hackathonId,
      file,
      kind,
      caption,
      altText,
    }: {
      hackathonId: number;
      file: File;
      kind?: 'image' | 'document' | 'certificate';
      caption?: string;
      altText?: string;
    }) => attachmentsApi.uploadHackathonAttachment(hackathonId, file, kind, caption, altText),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: HACKATHONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...HACKATHONS_QUERY_KEY, 'detail', variables.hackathonId] });
    },
  });
}

export function useUpdateAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AttachmentUpdate }) =>
      attachmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HACKATHONS_QUERY_KEY });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => attachmentsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HACKATHONS_QUERY_KEY });
    },
  });
}

