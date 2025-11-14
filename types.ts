export enum Plan {
  STARTER = 'starter',
  GROWTH = 'growth',
  PRO = 'pro',
  LIFETIME = 'lifetime',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELED = 'canceled',
  INACTIVE = 'inactive',
}

export enum EventType {
  PAUSE = 'pause',
  RESUME = 'resume',
}

export interface User {
  uid: string;
  email: string;
  isAdmin: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  plan?: Plan;
  planType?: 'monthly' | 'lifetime';
  status: SubscriptionStatus;
  createdAt: Date;
}

export interface PauseEvent {
  id: string;
  subscriptionId: string;
  pausedAt: Date;
  resumedAt?: Date;
  reason: string;
  eventType: EventType;
}

export interface Customer {
    id: string;
    email: string;
    plan: Plan;
    status: SubscriptionStatus;
    pauseCount: number;
    monthlyValue: number;
    churnRisk?: number; // Value between 0 and 1
}

export interface BlogPost {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  author: string;
  category: string;
  tags: string[];
  coverImage: string;
  contentHTML: string;
  excerpt: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
}