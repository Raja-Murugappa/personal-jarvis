export interface TeamMemberInput {
  name: string;
  role?: string | null;
  linkedin_url?: string | null;
}

export interface TeamMember extends TeamMemberInput {
  id: number;
  project_id?: number | null;
  hackathon_id?: number | null;
}

