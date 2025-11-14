

import request from 'supertest';
import app from '../src/index';
import { stripe } from '../src/config/stripe';
import { firebaseAuthMiddleware } from '../src/middleware/auth';
import { db } from '../src/config/firebase';
// FIX: Import Jest globals to resolve "Cannot find name" errors.
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
// FIX: Import Express types for mocking middleware.
import { Request, Response, NextFunction } from 'express';

// Mock the auth middleware
jest.mock('../src/middleware/auth', () => ({
  // FIX: Added explicit types to mock middleware parameters to fix type inference issues.
  firebaseAuthMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
    // FIX: Cast req to `any` to allow setting the custom `user` property in the test environment.
    (req as any).user = { uid: 'test-user-uid' };
    next();
  }),
}));

// Mock the Stripe SDK
const stripeUpdateMock = (jest.fn() as jest.Mock).mockResolvedValue({ id: 'sub_test', status: 'active' });
jest.mock('../src/config/stripe', () => ({
  stripe: {
    subscriptions: {
      update: stripeUpdateMock,
    },
  },
}));

// Mock Firestore
const firestoreUpdateMock = (jest.fn() as jest.Mock).mockResolvedValue(true);
const firestoreSetMock = (jest.fn() as jest.Mock).mockResolvedValue(true);
jest.mock('../src/config/firebase', () => ({
    db: {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      update: firestoreUpdateMock,
      set: firestoreSetMock,
      // Mock for the resume logic that finds the last pause event
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: (jest.fn() as jest.Mock).mockResolvedValue({ empty: true }),
    },
    auth: jest.fn(),
}));


describe('/api/subscriptions', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    (firebaseAuthMiddleware as jest.Mock).mockClear();
    stripeUpdateMock.mockClear();
    firestoreUpdateMock.mockClear();
    firestoreSetMock.mockClear();
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
      
      // Check if Stripe was called correctly
      expect(stripe.subscriptions.update).toHaveBeenCalledWith(
        payload.stripeSubId,
        { pause_collection: { behavior: 'mark_uncollectible' } },
        { stripeAccount: payload.accountId }
      );
      
      // Check if Firestore was updated
      expect(firestoreUpdateMock).toHaveBeenCalledWith({ status: 'paused' });
      expect(firestoreSetMock).toHaveBeenCalled(); // For logging the pause event
    });

    it('should return 400 for an invalid request body', async () => {
      const payload = { accountId: 'acct_test123' }; // Missing stripeSubId
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
        const response = await request(app)
            .post('/api/subscriptions/resume')
            .send(payload);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        
        // Check if Stripe was called correctly
        expect(stripe.subscriptions.update).toHaveBeenCalledWith(
            payload.stripeSubId,
            { pause_collection: null },
            { stripeAccount: payload.accountId }
        );
        
        // Check if Firestore was updated
        expect(firestoreUpdateMock).toHaveBeenCalledWith({ status: 'active' });
    });

    it('should return 400 for a request with an invalid Stripe Account ID', async () => {
        const payload = {
            accountId: 'invalid_id', // Does not start with 'acct_'
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