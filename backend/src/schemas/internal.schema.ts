import { z } from 'zod';

export const churnPredictionSchema = z.object({
    reason: z.string().min(1, 'Reason cannot be empty'),
    pauseLengthDays: z.number().int().positive().optional(),
    planPrice: z.number().positive('Plan price must be positive'),
    tenureDays: z.number().int().min(0, 'Tenure cannot be negative'),
    failedPaymentsLast90d: z.number().int().min(0, 'Failed payments cannot be negative'),
});

export type ChurnPredictionRequest = z.infer<typeof churnPredictionSchema>;