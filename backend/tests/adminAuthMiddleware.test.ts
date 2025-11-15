import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const getMock = jest.fn();
const docMock = jest.fn(() => ({ get: getMock }));
const collectionMock = jest.fn(() => ({ doc: docMock }));

jest.mock('../src/config/firebase', () => ({
  db: {
    collection: collectionMock,
  },
}));

const warnMock = jest.fn();
const errorMock = jest.fn();

jest.mock('../src/config/logger', () => ({
  warn: warnMock,
  error: errorMock,
  info: jest.fn(),
}));

const { adminAuthMiddleware }: {
  adminAuthMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void> | void;
} = require('../src/middleware/adminAuthMiddleware');

const createApp = (
  setup?: (req: Request, res: Response, next: NextFunction) => void,
) => {
  const app = express();
  if (setup) {
    app.use(setup);
  }
  app.get('/admin', adminAuthMiddleware, (req, res) => {
    res.status(200).json({ ok: true, isAdmin: req.user?.isAdmin ?? false });
  });
  return app;
};

beforeEach(() => {
  getMock.mockReset();
  docMock.mockClear();
  collectionMock.mockClear();
  warnMock.mockClear();
  errorMock.mockClear();
});

describe('adminAuthMiddleware', () => {
  it('returns 401 when req.user is missing', async () => {
    const app = createApp();

    const response = await request(app).get('/admin');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized', code: 'auth/missing-user' });
    expect(getMock).not.toHaveBeenCalled();
    expect(warnMock).toHaveBeenCalled();
  });

  it('returns 403 when user is not an admin', async () => {
    getMock.mockResolvedValue({ exists: true, data: () => ({ isAdmin: false }) });

    const app = createApp((req, _res, next) => {
      (req as any).user = { uid: 'user-123', email: 'user@example.com' };
      next();
    });

    const response = await request(app).get('/admin');

    expect(collectionMock).toHaveBeenCalledWith('users');
    expect(docMock).toHaveBeenCalledWith('user-123');
    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: 'Forbidden', code: 'auth/not-admin' });
    expect(warnMock).toHaveBeenCalled();
  });

  it('returns 500 when Firestore lookup fails', async () => {
    getMock.mockRejectedValue(new Error('firestore unavailable'));

    const app = createApp((req, _res, next) => {
      (req as any).user = { uid: 'user-123', email: 'user@example.com' };
      next();
    });

    const response = await request(app).get('/admin');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal Server Error', code: 'auth/admin-check-failed' });
    expect(errorMock).toHaveBeenCalled();
  });

  it('calls next when user is an admin', async () => {
    getMock.mockResolvedValue({ exists: true, data: () => ({ isAdmin: true }) });

    const app = createApp((req, _res, next) => {
      (req as any).user = { uid: 'admin-uid', email: 'admin@example.com' };
      next();
    });

    const response = await request(app).get('/admin');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true, isAdmin: true });
    expect(warnMock).not.toHaveBeenCalled();
    expect(errorMock).not.toHaveBeenCalled();
  });
});
