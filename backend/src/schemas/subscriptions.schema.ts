import { z } from 'zod';

export const pauseSubscriptionSchema = z.object({
  accountId: z.string().startsWith('acct_', { message: 'Invalid Stripe Account ID' }),
  stripeSubId: z.string().startsWith('sub_', { message: 'Invalid Stripe Subscription ID' }),
  reason: z.string().max(200, 'Reason is too long').optional(),
});

export const resumeSubscriptionSchema = z.object({
  accountId: z.string().startsWith('acct_', { message: 'Invalid Stripe Account ID' }),
  stripeSubId: z.string().startsWith('sub_', { message: 'Invalid Stripe Subscription ID' }),
});

export type PauseSubscriptionDto = z.infer<typeof pauseSubscriptionSchema>;
export type ResumeSubscriptionDto = z.infer<typeof resumeSubscriptionSchema>;
