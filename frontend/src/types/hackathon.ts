import type { Technology } from './technology';
import type { TeamMember, TeamMemberInput } from './team-member';
import type { Link, LinkInput } from './link';
import type { Attachment } from './attachment';
import type { ProjectShort } from './project';

export type HackathonMode = 'online' | 'offline' | 'hybrid';
export type HackathonResult =
  | 'participated'
  | 'shortlisted'
  | 'finalist'
  | 'runner_up'
  | 'winner'
  | 'other';

export interface HackathonListItem {
  id: number;
  name: string;
  organiser?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  mode: HackathonMode;
  location?: string | null;
  my_role?: string | null;
  result: HackathonResult;
  is_featured: boolean;
  archived_at?: string | null;
  project_id?: number | null;
  project_title?: string | null;
  cover_thumbnail_url?: string | null;
  technologies: string[];
  link_count: number;
  attachment_count: number;
  created_at: string;
  updated_at: string;
}

export interface Hackathon {
  id: number;
  name: string;
  organiser?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  mode: HackathonMode;
  location?: string | null;
  problem_statement_id?: string | null;
  problem_statement?: string | null;
  team_name?: string | null;
  my_role?: string | null;
  submission_summary?: string | null;
  result: HackathonResult;
  result_detail?: string | null;
  feedback?: string | null;
  lessons_learned?: string | null;
  notes?: string | null;
  is_featured: boolean;
  project_id?: number | null;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;

  project?: ProjectShort | null;
  technologies: Technology[];
  team_members: TeamMember[];
  links: Link[];
  attachments: Attachment[];
}

export interface HackathonInput {
  name: string;
  organiser?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  mode: HackathonMode;
  location?: string | null;
  problem_statement_id?: string | null;
  problem_statement?: string | null;
  team_name?: string | null;
  my_role?: string | null;
  submission_summary?: string | null;
  result: HackathonResult;
  result_detail?: string | null;
  feedback?: string | null;
  lessons_learned?: string | null;
  notes?: string | null;
  is_featured?: boolean;
  project_id?: number | null;
  technologies?: string[];
  team_members?: TeamMemberInput[];
  links?: LinkInput[];
}

