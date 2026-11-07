import { z } from 'zod';

export const linkSchema = z
  .object({
    label: z.string().max(150).optional().nullable(),
    url: z
      .string()
      .min(1, 'URL is required')
      .max(2000, 'URL too long')
      .refine(
        (val) => {
          try {
            const parsed = new URL(val);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
          } catch {
            return false;
          }
        },
        { message: 'URL must start with http:// or https://' }
      ),
    kind: z.enum([
      'github',
      'demo',
      'linkedin',
      'video',
      'documentation',
      'certificate',
      'dataset',
      'other',
    ]),
    sort_order: z.number().int().default(0),
  })
  .refine(
    (data) => {
      if (data.kind === 'github') {
        try {
          const parsed = new URL(data.url);
          const host = parsed.hostname.toLowerCase();
          return host === 'github.com' || host.endsWith('.github.com');
        } catch {
          return false;
        }
      }
      return true;
    },
    {
      message: 'GitHub links must have host github.com',
      path: ['url'],
    }
  );

export const teamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150, 'Name too long'),
  role: z.string().max(150).optional().nullable(),
  linkedin_url: z.string().max(500).optional().nullable(),
});

export const projectSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(150, 'Title too long'),
    headline: z.string().max(200, 'Headline too long').optional().nullable(),
    description: z.string().optional().nullable(),
    problem_statement: z.string().optional().nullable(),
    category: z.string().max(100).optional().nullable(),
    status: z.enum(['idea', 'in_progress', 'completed', 'paused']),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
    my_contribution: z.string().optional().nullable(),
    challenges: z.string().optional().nullable(),
    lessons_learned: z.string().optional().nullable(),
    future_improvements: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    is_featured: z.boolean().default(false),
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

export type ProjectFormData = z.infer<typeof projectSchema>;

