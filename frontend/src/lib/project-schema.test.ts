import { describe, it, expect } from 'vitest';
import { projectSchema, linkSchema } from './project-schema';

describe('projectSchema', () => {
  it('validates a valid project input', () => {
    const valid = {
      title: 'JARVIS Voice System',
      headline: 'Offline speech synthesis',
      status: 'in_progress',
      start_date: '2026-01-01',
      end_date: '2026-06-01',
      technologies: ['Python', 'FastAPI'],
      team_members: [{ name: 'Bob' }],
      links: [
        { label: 'GitHub', url: 'https://github.com/user/jarvis', kind: 'github' },
      ],
      is_featured: true,
    };
    const res = projectSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('rejects end_date earlier than start_date', () => {
    const invalid = {
      title: 'Invalid Dates',
      status: 'idea',
      start_date: '2026-10-01',
      end_date: '2026-05-01',
    };
    const res = projectSchema.safeParse(invalid);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toContain('End date cannot be earlier');
    }
  });

  it('rejects unsafe link URLs', () => {
    const invalid = {
      url: 'javascript:alert(1)',
      kind: 'other',
    };
    const res = linkSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('rejects github kind when url host is not github.com', () => {
    const invalid = {
      url: 'https://notgithub.com/repo',
      kind: 'github',
    };
    const res = linkSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});

