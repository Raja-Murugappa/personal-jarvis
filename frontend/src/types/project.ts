import type { Technology } from './technology';
import type { TeamMember, TeamMemberInput } from './team-member';
import type { Link, LinkInput } from './link';
import type { Attachment } from './attachment';

export type ProjectStatus = 'idea' | 'in_progress' | 'completed' | 'paused';

export interface ProjectListItem {
  id: number;
  title: string;
  headline?: string | null;
  category?: string | null;
  status: ProjectStatus;
  start_date?: string | null;
  end_date?: string | null;
  is_featured: boolean;
  archived_at?: string | null;
  cover_thumbnail_url?: string | null;
  technologies: string[];
  link_count: number;
  attachment_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectShort {
  id: number;
  title: string;
  headline?: string | null;
  status: ProjectStatus;
}

export interface HackathonShort {
  id: number;
  name: string;
  organiser?: string | null;
  start_date?: string | null;
  result: string;
  is_featured: boolean;
}

export interface Project {
  id: number;
  title: string;
  headline?: string | null;
  description?: string | null;
  problem_statement?: string | null;
  category?: string | null;
  status: ProjectStatus;
  start_date?: string | null;
  end_date?: string | null;
  my_contribution?: string | null;
  challenges?: string | null;
  lessons_learned?: string | null;
  future_improvements?: string | null;
  notes?: string | null;
  is_featured: boolean;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;

  technologies: Technology[];
  team_members: TeamMember[];
  links: Link[];
  attachments: Attachment[];
  hackathons: HackathonShort[];
}

export interface ProjectInput {
  title: string;
  headline?: string | null;
  description?: string | null;
  problem_statement?: string | null;
  category?: string | null;
  status: ProjectStatus;
  start_date?: string | null;
  end_date?: string | null;
  my_contribution?: string | null;
  challenges?: string | null;
  lessons_learned?: string | null;
  future_improvements?: string | null;
  notes?: string | null;
  is_featured?: boolean;
  technologies?: string[];
  team_members?: TeamMemberInput[];
  links?: LinkInput[];
}

