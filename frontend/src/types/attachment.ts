export type AttachmentKind = 'image' | 'document' | 'certificate';

export interface Attachment {
  id: number;
  kind: AttachmentKind;
  original_name: string;
  stored_name: string;
  mime_type: string;
  size_bytes: number;
  width?: number | null;
  height?: number | null;
  caption?: string | null;
  alt_text?: string | null;
  sort_order: number;
  is_cover: boolean;
  project_id?: number | null;
  hackathon_id?: number | null;
  created_at: string;
  file_url: string;
  thumbnail_url?: string | null;
}

export interface AttachmentUpdate {
  caption?: string | null;
  alt_text?: string | null;
  sort_order?: number;
  is_cover?: boolean;
}

