import { z } from 'zod';

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string().max(100, 'Category cannot exceed 100 characters').optional(),
  due_date: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;
