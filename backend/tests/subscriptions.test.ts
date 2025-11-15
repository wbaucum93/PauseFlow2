import request from 'supertest';
import app from '../src/index';
import { stripe } from '../src/config/stripe';
import { firebaseAuthMiddleware } from '../src/middleware/auth';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import {
  ensureUserOwnsAccount,
  getLatestPauseDocument,
  getOwnedSubscription,
  listSubscriptionsForAccount,
  OwnershipError,
} from '../src/services/accountAccess';
import type { SubscriptionOwnership, AccountOwnership } from '../src/services/accountAccess';

// Mock the auth middleware
jest.mock('../src/middleware/auth', () => ({
  firebaseAuthMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
    (req as any).user = { uid: 'test-user-uid' };
    next();
  }),
}));

var stripeUpdateMock: jest.Mock;
var firestoreCollectionMock: jest.Mock;
var firestoreDocMock: jest.Mock;
var firestoreUpdateMock: jest.Mock;
var firestoreSetMock: jest.Mock;
var firestoreWhereMock: jest.Mock;
var firestoreOrderByMock: jest.Mock;
var firestoreLimitMock: jest.Mock;
var firestoreGetMock: jest.Mock;
var firestoreCountMock: jest.Mock;

jest.mock('../src/config/stripe', () => {
  stripeUpdateMock = jest.fn(async () => ({ id: 'sub_test', status: 'active' }));
  return {
    stripe: {
      subscriptions: {
        update: stripeUpdateMock,
      },
    },
  };
});

jest.mock('../src/config/firebase', () => {
  firestoreCollectionMock = jest.fn().mockReturnThis();
  firestoreDocMock = jest.fn().mockReturnThis();
  firestoreUpdateMock = jest.fn(async () => true);
  firestoreSetMock = jest.fn(async () => true);
  firestoreWhereMock = jest.fn().mockReturnThis();
  firestoreOrderByMock = jest.fn().mockReturnThis();
  firestoreLimitMock = jest.fn().mockReturnThis();
  firestoreGetMock = jest.fn().mockResolvedValue({ empty: true, docs: [] });
  firestoreCountMock = jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue({ data: () => ({ count: 0 }) }) });

  return {
    db: {
      collection: firestoreCollectionMock,
      doc: firestoreDocMock,
      update: firestoreUpdateMock,
      set: firestoreSetMock,
      where: firestoreWhereMock,
      orderBy: firestoreOrderByMock,
      limit: firestoreLimitMock,
      get: firestoreGetMock,
      count: firestoreCountMock,
    },
    auth: jest.fn(),
  };
});

jest.mock('../src/services/accountAccess', () => {
  const actual = jest.requireActual('../src/services/accountAccess');
  return {
    ...actual,
    ensureUserOwnsAccount: jest.fn(),
    getOwnedSubscription: jest.fn(),
    listSubscriptionsForAccount: jest.fn(),
    getLatestPauseDocument: jest.fn(),
    countSubscriptionsByStatus: jest.fn(),
    sumPausedSubscriptionsMonthlyValue: jest.fn(),
    countPauseEvents: jest.fn(),
  };
});

describe('/api/subscriptions', () => {
  beforeEach(() => {
    (firebaseAuthMiddleware as jest.MockedFunction<any>).mockClear();
    stripeUpdateMock.mockClear();
    firestoreUpdateMock.mockClear();
    firestoreSetMock.mockClear();
    firestoreDocMock.mockClear();
    firestoreCollectionMock.mockClear();
    const mockEnsureUserOwnsAccount = ensureUserOwnsAccount as jest.MockedFunction<typeof ensureUserOwnsAccount>;
    const mockGetOwnedSubscription = getOwnedSubscription as jest.MockedFunction<typeof getOwnedSubscription>;
    const mockListSubscriptionsForAccount = listSubscriptionsForAccount as jest.MockedFunction<typeof listSubscriptionsForAccount>;
    const mockGetLatestPauseDocument = getLatestPauseDocument as jest.MockedFunction<typeof getLatestPauseDocument>;

    mockEnsureUserOwnsAccount.mockReset();
    mockGetOwnedSubscription.mockReset();
    mockListSubscriptionsForAccount.mockReset();
    mockGetLatestPauseDocument.mockReset();

    mockEnsureUserOwnsAccount.mockResolvedValue({
      ref: { id: 'acct_test123' } as AccountOwnership['ref'],
      data: { stripeAccountId: 'acct_test123' },
    });
    mockGetOwnedSubscription.mockResolvedValue({
      ref: { update: firestoreUpdateMock } as unknown as SubscriptionOwnership['ref'],
      data: { stripeAccountId: 'acct_test123' },
    });
    mockListSubscriptionsForAccount.mockResolvedValue([]);
    mockGetLatestPauseDocument.mockResolvedValue(null);
  });

  describe('GET /api/subscriptions', () => {
    it('returns subscriptions for an owned account', async () => {
      const mockListSubscriptionsForAccount = listSubscriptionsForAccount as jest.MockedFunction<typeof listSubscriptionsForAccount>;
      mockListSubscriptionsForAccount.mockResolvedValue([
        { id: 'sub_test123', status: 'active', stripeAccountId: 'acct_test123' },
      ]);

      const response = await request(app).get('/api/subscriptions').query({ accountId: 'acct_test123' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { id: 'sub_test123', status: 'active', stripeAccountId: 'acct_test123' },
      ]);
      expect(mockListSubscriptionsForAccount).toHaveBeenCalledWith('test-user-uid', 'acct_test123');
    });

    it('rejects access when the account is not owned by the user', async () => {
      const mockEnsureUserOwnsAccount = ensureUserOwnsAccount as jest.MockedFunction<typeof ensureUserOwnsAccount>;
      mockEnsureUserOwnsAccount.mockRejectedValue(new OwnershipError('ACCOUNT_NOT_OWNED', 'Account does not belong to the authenticated user.'));

      const response = await request(app).get('/api/subscriptions').query({ accountId: 'acct_other' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('forbidden');
      expect(response.body.reason).toBe('account_not_owned');
    });
  });

  describe('POST /api/subscriptions/pause', () => {
    it('should pause a subscription with a valid request', async () => {
      const payload = {
        accountId: 'acct_test123',
        stripeSubId: 'sub_test123',
        reason: 'Vacation',
      };
      const response = await request(app)
        .post('/api/subscriptions/pause')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(stripe.subscriptions.update).toHaveBeenCalledWith(
        payload.stripeSubId,
        { pause_collection: { behavior: 'mark_uncollectible' } },
        { stripeAccount: payload.accountId }
      );

      expect(firestoreUpdateMock).toHaveBeenCalledWith({ status: 'paused' });
      expect(firestoreSetMock).toHaveBeenCalledWith(
        expect.objectContaining({ accountId: payload.accountId, subscriptionId: payload.stripeSubId })
      );
    });

    it('rejects requests for an account the user does not own', async () => {
      const mockEnsureUserOwnsAccount = ensureUserOwnsAccount as jest.MockedFunction<typeof ensureUserOwnsAccount>;
      mockEnsureUserOwnsAccount.mockRejectedValue(new OwnershipError('ACCOUNT_NOT_OWNED', 'Account does not belong to the authenticated user.'));

      const payload = {
        accountId: 'acct_other',
        stripeSubId: 'sub_test123',
        reason: 'Vacation',
      };

      const response = await request(app).post('/api/subscriptions/pause').send(payload);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('forbidden');
      expect(response.body.reason).toBe('account_not_owned');
      expect(stripe.subscriptions.update).not.toHaveBeenCalled();
    });

    it('rejects requests for subscriptions not tied to the account', async () => {
      const mockGetOwnedSubscription = getOwnedSubscription as jest.MockedFunction<typeof getOwnedSubscription>;
      mockGetOwnedSubscription.mockRejectedValue(new OwnershipError('SUBSCRIPTION_NOT_OWNED', 'Subscription does not belong to the provided Stripe account.'));

      const payload = {
        accountId: 'acct_test123',
        stripeSubId: 'sub_not_owned',
        reason: 'Vacation',
      };

      const response = await request(app).post('/api/subscriptions/pause').send(payload);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('forbidden');
      expect(response.body.reason).toBe('subscription_not_owned');
      expect(stripe.subscriptions.update).not.toHaveBeenCalled();
    });

    it('rejects requests when the subscription does not exist', async () => {
      const mockGetOwnedSubscription = getOwnedSubscription as jest.MockedFunction<typeof getOwnedSubscription>;
      mockGetOwnedSubscription.mockRejectedValue(new OwnershipError('SUBSCRIPTION_NOT_FOUND', 'Subscription was not found for the authenticated user.'));

      const payload = {
        accountId: 'acct_test123',
        stripeSubId: 'sub_missing',
        reason: 'Vacation',
      };

      const response = await request(app).post('/api/subscriptions/pause').send(payload);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('forbidden');
      expect(response.body.reason).toBe('subscription_not_found');
      expect(stripe.subscriptions.update).not.toHaveBeenCalled();
    });

    it('should return 400 for an invalid request body', async () => {
      const payload = { accountId: 'acct_test123' };
      const response = await request(app)
        .post('/api/subscriptions/pause')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid input');
      expect(stripe.subscriptions.update).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/subscriptions/resume', () => {
    it('should resume a subscription with a valid request', async () => {
      const payload = {
        accountId: 'acct_test456',
        stripeSubId: 'sub_test456',
      };
      const mockGetOwnedSubscription = getOwnedSubscription as jest.MockedFunction<typeof getOwnedSubscription>;
      mockGetOwnedSubscription.mockResolvedValue({
        ref: { update: firestoreUpdateMock } as unknown as SubscriptionOwnership['ref'],
        data: { stripeAccountId: payload.accountId },
      });
      const response = await request(app)
        .post('/api/subscriptions/resume')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      expect(stripe.subscriptions.update).toHaveBeenCalledWith(
        payload.stripeSubId,
        { pause_collection: null },
        { stripeAccount: payload.accountId }
      );

      expect(firestoreUpdateMock).toHaveBeenCalledWith({ status: 'active' });
    });

    it('should reject resume when account ownership fails', async () => {
      const mockEnsureUserOwnsAccount = ensureUserOwnsAccount as jest.MockedFunction<typeof ensureUserOwnsAccount>;
      mockEnsureUserOwnsAccount.mockRejectedValue(new OwnershipError('ACCOUNT_NOT_OWNED', 'Account does not belong to the authenticated user.'));

      const payload = {
        accountId: 'acct_other',
        stripeSubId: 'sub_test456',
      };

      const response = await request(app)
        .post('/api/subscriptions/resume')
        .send(payload);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('forbidden');
      expect(response.body.reason).toBe('account_not_owned');
      expect(stripe.subscriptions.update).not.toHaveBeenCalled();
    });

    it('should reject resume when subscription does not belong to account', async () => {
      const mockGetOwnedSubscription = getOwnedSubscription as jest.MockedFunction<typeof getOwnedSubscription>;
      mockGetOwnedSubscription.mockRejectedValue(new OwnershipError('SUBSCRIPTION_NOT_OWNED', 'Subscription does not belong to the provided Stripe account.'));

      const payload = {
        accountId: 'acct_test456',
        stripeSubId: 'sub_not_owned',
      };

      const response = await request(app)
        .post('/api/subscriptions/resume')
        .send(payload);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('forbidden');
      expect(response.body.reason).toBe('subscription_not_owned');
      expect(stripe.subscriptions.update).not.toHaveBeenCalled();
    });

    it('should return 400 for a request with an invalid Stripe Account ID', async () => {
      const payload = {
        accountId: 'invalid_id',
        stripeSubId: 'sub_test456',
      };
      const response = await request(app)
        .post('/api/subscriptions/resume')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid input');
      expect(stripe.subscriptions.update).not.toHaveBeenCalled();
    });
  });
});
