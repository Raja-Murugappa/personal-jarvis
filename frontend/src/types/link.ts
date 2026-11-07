export type LinkKind =
  | 'github'
  | 'demo'
  | 'linkedin'
  | 'video'
  | 'documentation'
  | 'certificate'
  | 'dataset'
  | 'other';

export interface LinkInput {
  label?: string | null;
  url: string;
  kind: LinkKind;
  sort_order?: number;
}

export interface Link extends LinkInput {
  id: number;
  project_id?: number | null;
  hackathon_id?: number | null;
}

