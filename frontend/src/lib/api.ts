/**
 * Central API Client for Personal JARVIS.
 * ALL backend requests MUST go through this file.
 */

import type { Task, TaskInput } from '@/types/task';
import type { JournalEntry, JournalInput } from '@/types/journal';
import type { Technology } from '@/types/technology';
import type { Attachment, AttachmentUpdate } from '@/types/attachment';
import type { Project, ProjectInput, ProjectListItem } from '@/types/project';
import type { Hackathon, HackathonInput, HackathonListItem } from '@/types/hackathon';
import type { Showcase } from '@/types/showcase';

const defaultApiUrl = 'http://127.0.0.1:8000';

const API_BASE_URL = import.meta.env.VITE_API_URL || defaultApiUrl;

export interface HealthResponse {
  status: string;
}

export async function checkHealth(): Promise<HealthResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export const tasksApi = {
  async list(filters?: { status?: string; priority?: string; category?: string }): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters?.priority && filters.priority !== 'all') {
      params.append('priority', filters.priority);
    }
    if (filters?.category && filters.category !== 'all') {
      params.append('category', filters.category);
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/tasks${query}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to fetch tasks (HTTP ${res.status})`);
    }

    return res.json();
  },

  async create(data: TaskInput): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to create task (HTTP ${res.status})`);
    }

    return res.json();
  },

  async update(id: number, data: Partial<TaskInput>): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to update task (HTTP ${res.status})`);
    }

    return res.json();
  },

  async remove(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to delete task (HTTP ${res.status})`);
    }
  },
};

export const journalApi = {
  async list(filters?: { from?: string; to?: string }): Promise<JournalEntry[]> {
    const params = new URLSearchParams();
    if (filters?.from) {
      params.append('from', filters.from);
    }
    if (filters?.to) {
      params.append('to', filters.to);
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/journal${query}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to fetch journal entries (HTTP ${res.status})`);
    }

    return res.json();
  },

  async get(id: number): Promise<JournalEntry> {
    const res = await fetch(`${API_BASE_URL}/journal/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to fetch journal entry (HTTP ${res.status})`);
    }

    return res.json();
  },

  async create(data: JournalInput): Promise<JournalEntry> {
    const res = await fetch(`${API_BASE_URL}/journal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to create journal entry (HTTP ${res.status})`);
    }

    return res.json();
  },

  async update(id: number, data: Partial<JournalInput>): Promise<JournalEntry> {
    const res = await fetch(`${API_BASE_URL}/journal/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to update journal entry (HTTP ${res.status})`);
    }

    return res.json();
  },

  async remove(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/journal/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to delete journal entry (HTTP ${res.status})`);
    }
  },
};

export const technologiesApi = {
  async list(search?: string): Promise<Technology[]> {
    const params = new URLSearchParams();
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/technologies${query}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to fetch technologies (HTTP ${res.status})`);
    }
    return res.json();
  },

  async remove(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/technologies/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to delete technology (HTTP ${res.status})`);
    }
  },
};

export const attachmentsApi = {
  getFileUrl(id: number): string {
    return `${API_BASE_URL}/attachments/${id}/file`;
  },

  getThumbnailUrl(id: number): string {
    return `${API_BASE_URL}/attachments/${id}/thumbnail`;
  },

  async uploadProjectAttachment(
    projectId: number,
    file: File,
    kind: 'image' | 'document' | 'certificate' = 'image',
    caption?: string,
    altText?: string,
  ): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kind', kind);
    if (caption) formData.append('caption', caption);
    if (altText) formData.append('alt_text', altText);

    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/attachments`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to upload project attachment (HTTP ${res.status})`);
    }
    return res.json();
  },

  async uploadHackathonAttachment(
    hackathonId: number,
    file: File,
    kind: 'image' | 'document' | 'certificate' = 'image',
    caption?: string,
    altText?: string,
  ): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kind', kind);
    if (caption) formData.append('caption', caption);
    if (altText) formData.append('alt_text', altText);

    const res = await fetch(`${API_BASE_URL}/hackathons/${hackathonId}/attachments`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to upload hackathon attachment (HTTP ${res.status})`);
    }
    return res.json();
  },

  async update(id: number, data: AttachmentUpdate): Promise<Attachment> {
    const res = await fetch(`${API_BASE_URL}/attachments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to update attachment (HTTP ${res.status})`);
    }
    return res.json();
  },

  async remove(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/attachments/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to delete attachment (HTTP ${res.status})`);
    }
  },
};

export const projectsApi = {
  async list(filters?: {
    status?: string;
    category?: string;
    technology?: string;
    featured?: boolean;
    search?: string;
    include_archived?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ProjectListItem[]> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters?.technology) params.append('technology', filters.technology);
    if (filters?.featured !== undefined) params.append('featured', String(filters.featured));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.include_archived) params.append('include_archived', 'true');
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/projects${query}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to fetch projects (HTTP ${res.status})`);
    }
    return res.json();
  },

  async get(id: number): Promise<Project> {
    const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to fetch project (HTTP ${res.status})`);
    }
    return res.json();
  },

  async create(data: ProjectInput): Promise<Project> {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to create project (HTTP ${res.status})`);
    }
    return res.json();
  },

  async update(id: number, data: Partial<ProjectInput>): Promise<Project> {
    const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to update project (HTTP ${res.status})`);
    }
    return res.json();
  },

  async archive(id: number): Promise<Project> {
    const res = await fetch(`${API_BASE_URL}/projects/${id}/archive`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to archive project (HTTP ${res.status})`);
    }
    return res.json();
  },

  async restore(id: number): Promise<Project> {
    const res = await fetch(`${API_BASE_URL}/projects/${id}/restore`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to restore project (HTTP ${res.status})`);
    }
    return res.json();
  },

  async remove(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to delete project (HTTP ${res.status})`);
    }
  },

  async getShowcase(id: number): Promise<Showcase> {
    const res = await fetch(`${API_BASE_URL}/projects/${id}/showcase`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to fetch project showcase (HTTP ${res.status})`);
    }
    return res.json();
  },
};

export const hackathonsApi = {
  async list(filters?: {
    result?: string;
    year?: number;
    technology?: string;
    featured?: boolean;
    search?: string;
    include_archived?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<HackathonListItem[]> {
    const params = new URLSearchParams();
    if (filters?.result && filters.result !== 'all') params.append('result', filters.result);
    if (filters?.year) params.append('year', String(filters.year));
    if (filters?.technology) params.append('technology', filters.technology);
    if (filters?.featured !== undefined) params.append('featured', String(filters.featured));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.include_archived) params.append('include_archived', 'true');
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/hackathons${query}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to fetch hackathons (HTTP ${res.status})`);
    }
    return res.json();
  },

  async get(id: number): Promise<Hackathon> {
    const res = await fetch(`${API_BASE_URL}/hackathons/${id}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to fetch hackathon (HTTP ${res.status})`);
    }
    return res.json();
  },

  async create(data: HackathonInput): Promise<Hackathon> {
    const res = await fetch(`${API_BASE_URL}/hackathons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to create hackathon (HTTP ${res.status})`);
    }
    return res.json();
  },

  async update(id: number, data: Partial<HackathonInput>): Promise<Hackathon> {
    const res = await fetch(`${API_BASE_URL}/hackathons/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to update hackathon (HTTP ${res.status})`);
    }
    return res.json();
  },

  async archive(id: number): Promise<Hackathon> {
    const res = await fetch(`${API_BASE_URL}/hackathons/${id}/archive`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to archive hackathon (HTTP ${res.status})`);
    }
    return res.json();
  },

  async restore(id: number): Promise<Hackathon> {
    const res = await fetch(`${API_BASE_URL}/hackathons/${id}/restore`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to restore hackathon (HTTP ${res.status})`);
    }
    return res.json();
  },

  async remove(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/hackathons/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to delete hackathon (HTTP ${res.status})`);
    }
  },

  async getShowcase(id: number): Promise<Showcase> {
    const res = await fetch(`${API_BASE_URL}/hackathons/${id}/showcase`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || `Failed to fetch hackathon showcase (HTTP ${res.status})`);
    }
    return res.json();
  },
};
