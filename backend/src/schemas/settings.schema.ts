import { z } from 'zod';

export const updateSettingsSchema = z.object({
  pauseReasons: z.array(z.string().min(1, 'Reason cannot be empty').max(100, 'Reason is too long')).optional(),
  whiteLabel: z.object({
      logoUrl: z.string().url('Invalid URL format').optional(),
      brandColor: z.string().regex(/^#([0-9A-F]{3,6})$/i, 'Invalid hex color format').optional(),
      domain: z.string().optional(), // TODO: add more specific domain validation if needed
  }).optional(),
});

export type UpdateSettingsDto = z.infer<typeof updateSettingsSchema>;
