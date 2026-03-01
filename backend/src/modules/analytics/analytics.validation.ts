import { z } from 'zod';

export const createCareerTargetSchema = z.object({
  role_title: z.string().min(2).max(128),
  required_skills: z.array(z.string().max(64)).min(1).max(20),
  preferred_skills: z.array(z.string().max(64)).max(20).optional(),
  min_experience_years: z.number().int().min(0).max(30).optional(),
  target_companies: z.array(z.string().max(128)).max(10).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateCareerTargetSchema = createCareerTargetSchema.partial();
