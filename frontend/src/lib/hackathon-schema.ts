import { z } from 'zod';
import { linkSchema, teamMemberSchema } from './project-schema';

export const hackathonSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(150, 'Name too long'),
    organiser: z.string().max(150).optional().nullable(),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
    mode: z.enum(['online', 'offline', 'hybrid']),
    location: z.string().max(150).optional().nullable(),
    problem_statement_id: z.string().max(100).optional().nullable(),
    problem_statement: z.string().optional().nullable(),
    team_name: z.string().max(150).optional().nullable(),
    my_role: z.string().max(150).optional().nullable(),
    submission_summary: z.string().optional().nullable(),
    result: z.enum([
      'participated',
      'shortlisted',
      'finalist',
      'runner_up',
      'winner',
      'other',
    ]),
    result_detail: z.string().optional().nullable(),
    feedback: z.string().optional().nullable(),
    lessons_learned: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    is_featured: z.boolean().default(false),
    project_id: z.number().int().optional().nullable(),
    technologies: z.array(z.string()).default([]),
    team_members: z.array(teamMemberSchema).default([]),
    links: z.array(linkSchema).default([]),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date && data.start_date.trim() && data.end_date.trim()) {
        return data.end_date >= data.start_date;
      }
      return true;
    },
    {
      message: 'End date cannot be earlier than start date',
      path: ['end_date'],
    }
  );

export type HackathonFormData = z.infer<typeof hackathonSchema>;

