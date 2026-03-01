import { z } from 'zod';

export const updateProfileSchema = z.object({
  display_name: z.string().max(128).optional(),
  bio: z.string().max(1000).optional(),
  location: z.string().max(128).optional(),
  avatar_url: z.string().url().optional(),
});
