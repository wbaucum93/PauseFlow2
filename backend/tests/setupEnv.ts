import { jest } from '@jest/globals';

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.PORT = process.env.PORT || '8080';
process.env.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'test-project';
process.env.FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL || 'test@example.com';
process.env.FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\\nTEST\\n-----END PRIVATE KEY-----';
process.env.STRIPE_PLATFORM_SECRET = process.env.STRIPE_PLATFORM_SECRET || 'sk_test';
process.env.STRIPE_CLIENT_ID = process.env.STRIPE_CLIENT_ID || 'ca_test';
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test';
process.env.ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || 'http://localhost:3000';
process.env.FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
process.env.BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'http://localhost:8080';
process.env.SENTRY_DSN = process.env.SENTRY_DSN || '';

jest.mock('firebase-admin', () => {
  const credential = { cert: jest.fn(() => ({})) };
  const initializeApp = jest.fn();
  const verifyIdToken = jest.fn();
  const authInstance = { verifyIdToken };
  const auth = jest.fn(() => authInstance);
  const collection = jest.fn().mockReturnThis();
  const doc = jest.fn().mockReturnThis();
  const set = jest.fn();
  const update = jest.fn();
  const where = jest.fn().mockReturnThis();
  const orderBy = jest.fn().mockReturnThis();
  const limit = jest.fn().mockReturnThis();
  const get = jest.fn().mockResolvedValue({ empty: true, docs: [] });
  const count = jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue({ data: () => ({ count: 0 }) }) });
  const collectionGroup = jest.fn().mockReturnThis();
  const runTransaction = jest.fn(async (updateFunction: (tx: any) => any) => {
    const tx = {
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      get: jest.fn(),
    };
    return updateFunction(tx);
  });

  const firestoreInstance = {
    collection,
    doc,
    set,
    update,
    where,
    orderBy,
    limit,
    get,
    count,
    collectionGroup,
    runTransaction,
  };
  const firestore = jest.fn(() => firestoreInstance);

  return {
    credential,
    initializeApp,
    auth,
    firestore,
    __mock: {
      verifyIdToken,
      collection,
      doc,
      set,
      update,
      where,
      orderBy,
      limit,
      get,
      count,
      collectionGroup,
      runTransaction,
    },
  };
});
