

import request from 'supertest';
import app from '../src/index';
import { firebaseAuthMiddleware } from '../src/middleware/auth';
import { db } from '../src/config/firebase';
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

// Mock Firestore
// FIX: Cast jest.fn() to jest.Mock to resolve type inference issues with mockResolvedValue.
const setMock = (jest.fn() as jest.Mock).mockResolvedValue(true);
jest.mock('../src/config/firebase', () => ({
    db: {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      set: setMock,
      // Add get() mock if you were testing the GET route
    },
    auth: jest.fn(), // Mock auth as well if needed
}));

describe('PUT /api/settings', () => {

  beforeEach(() => {
    // Clear mock history before each test
    (firebaseAuthMiddleware as jest.Mock).mockClear();
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