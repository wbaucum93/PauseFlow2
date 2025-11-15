

import request from 'supertest';
import app from '../src/index';
import { firebaseAuthMiddleware } from '../src/middleware/auth';
// FIX: Import Jest globals to resolve "Cannot find name" errors.
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
// FIX: Import Express types for mocking middleware.
import { Request, Response, NextFunction } from 'express';


// Mock the middleware to bypass actual token verification
jest.mock('../src/middleware/auth', () => ({
  // FIX: Added explicit types to mock middleware parameters to fix type inference issues.
  firebaseAuthMiddleware: jest.fn((req: Request, res: Response, next: NextFunction) => {
    // Attach a mock user to the request object
    // FIX: Cast req to `any` to allow setting the custom `user` property in the test environment.
    (req as any).user = { uid: 'test-user-uid' };
    next();
  }),
}));

var setMock: jest.Mock;
var collectionMock: jest.Mock;
var docMock: jest.Mock;

jest.mock('../src/config/firebase', () => {
  collectionMock = jest.fn().mockReturnThis();
  docMock = jest.fn().mockReturnThis();
  setMock = jest.fn(async () => true);

  return {
    db: {
      collection: collectionMock,
      doc: docMock,
      set: (...args: any[]) => setMock(...args),
    },
    auth: jest.fn(),
  };
});

describe('PUT /api/settings', () => {

  beforeEach(() => {
    // Clear mock history before each test
    (firebaseAuthMiddleware as jest.MockedFunction<any>).mockClear();
    setMock.mockClear();
  });

  it('should update settings successfully with a valid body', async () => {
    const validSettings = {
      pauseReasons: ['On vacation', 'Too expensive'],
      whiteLabel: {
        brandColor: '#FFFFFF',
      },
    };

    const response = await request(app)
      .put('/api/settings')
      .send(validSettings);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(firebaseAuthMiddleware).toHaveBeenCalledTimes(1);
    expect(setMock).toHaveBeenCalledWith(validSettings, { merge: true });
  });

  it('should return 400 Bad Request for an invalid body', async () => {
    const invalidSettings = {
      pauseReasons: 'this should be an array', // Invalid type
    };

    const response = await request(app)
      .put('/api/settings')
      .send(invalidSettings);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid input');
    expect(response.body.details).toBeInstanceOf(Array);
    // Ensure database was not called
    expect(setMock).not.toHaveBeenCalled();
  });
  
  it('should return 400 for invalid whiteLabel URL', async () => {
    const invalidSettings = {
      whiteLabel: {
        logoUrl: 'not-a-valid-url',
      },
    };

    const response = await request(app)
      .put('/api/settings')
      .send(invalidSettings);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid input');
    expect(response.body.details[0].message).toBe('Invalid URL format');
  });

});