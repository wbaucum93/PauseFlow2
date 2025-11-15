import request from 'supertest';
import app from '../src/index';
import { firebaseAuthMiddleware } from '../src/middleware/auth';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import {
  ensureUserOwnsAccount,
  countSubscriptionsByStatus,
  sumPausedSubscriptionsMonthlyValue,
  countPauseEvents,
  OwnershipError,
} from '../src/services/accountAccess';
import type { AccountOwnership } from '../src/services/accountAccess';

const mockEnsureUserOwnsAccount = ensureUserOwnsAccount as jest.MockedFunction<typeof ensureUserOwnsAccount>;
const mockCountSubscriptionsByStatus = countSubscriptionsByStatus as jest.MockedFunction<typeof countSubscriptionsByStatus>;
const mockSumPausedSubscriptionsMonthlyValue = sumPausedSubscriptionsMonthlyValue as jest.MockedFunction<
  typeof sumPausedSubscriptionsMonthlyValue
>;
const mockCountPauseEvents = countPauseEvents as jest.MockedFunction<typeof countPauseEvents>;

jest.mock('../src/middleware/auth', () => ({
  firebaseAuthMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
    (req as any).user = { uid: 'test-user-uid' };
    next();
  }),
}));

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

describe('/api/metrics/summary', () => {
  beforeEach(() => {
    (firebaseAuthMiddleware as jest.MockedFunction<any>).mockClear();

    mockEnsureUserOwnsAccount.mockReset();
    mockCountSubscriptionsByStatus.mockReset();
    mockSumPausedSubscriptionsMonthlyValue.mockReset();
    mockCountPauseEvents.mockReset();

    mockEnsureUserOwnsAccount.mockResolvedValue({
      ref: { id: 'acct_test123' } as AccountOwnership['ref'],
      data: { stripeAccountId: 'acct_test123' },
    });
    mockCountSubscriptionsByStatus.mockImplementation(async (_uid: string, _accountId: string, status: string) => {
      if (status === 'active') return 5;
      if (status === 'paused') return 2;
      return 0;
    });
    mockSumPausedSubscriptionsMonthlyValue.mockResolvedValue(125);
    mockCountPauseEvents.mockResolvedValue(3);
  });

  it('returns metrics for an owned account', async () => {
    const response = await request(app)
      .get('/api/metrics/summary')
      .query({ accountId: 'acct_test123' });

    expect(mockEnsureUserOwnsAccount).toHaveBeenCalledWith('test-user-uid', 'acct_test123');
    expect(mockCountSubscriptionsByStatus).toHaveBeenCalledTimes(2);
    expect(mockSumPausedSubscriptionsMonthlyValue).toHaveBeenCalledWith('test-user-uid', 'acct_test123');
    expect(mockCountPauseEvents).toHaveBeenCalledWith('test-user-uid', 'acct_test123');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      revenueSaved: 125,
      activeCustomers: 5,
      pausedCustomers: 2,
      totalPauseEvents: 3,
    });
  });

  it('blocks access when the account is not owned by the user', async () => {
    mockEnsureUserOwnsAccount.mockRejectedValue(new OwnershipError('ACCOUNT_NOT_OWNED', 'Account does not belong to the authenticated user.'));

    const response = await request(app)
      .get('/api/metrics/summary')
      .query({ accountId: 'acct_other' });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('forbidden');
    expect(response.body.reason).toBe('account_not_owned');
  });
});
