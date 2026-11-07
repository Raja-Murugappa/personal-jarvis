import { describe, it, expect } from 'vitest';
import { hackathonSchema } from './hackathon-schema';

describe('hackathonSchema', () => {
  it('validates a valid hackathon input', () => {
    const valid = {
      name: 'Hackathon 2026',
      mode: 'hybrid',
      result: 'winner',
      start_date: '2026-03-01',
      end_date: '2026-03-03',
      project_id: 1,
      technologies: ['FastAPI', 'React'],
      is_featured: true,
    };
    const res = hackathonSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('rejects empty hackathon name', () => {
    const invalid = {
      name: '',
      mode: 'online',
      result: 'participated',
    };
    const res = hackathonSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('rejects invalid end_date', () => {
    const invalid = {
      name: 'Hackathon Dates Test',
      mode: 'online',
      result: 'participated',
      start_date: '2026-05-10',
      end_date: '2026-05-01',
    };
    const res = hackathonSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});

