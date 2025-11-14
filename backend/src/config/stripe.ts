import Stripe from 'stripe';
import { env } from './env';

export const stripe = new Stripe(env.STRIPE_PLATFORM_SECRET, {
  // FIX: Updated Stripe API version to a recent valid version to match the expected type from the installed Stripe library version.
  apiVersion: '2024-06-20',
});