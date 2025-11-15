import * as admin from 'firebase-admin';
import { env } from './env';
import logger from './logger';

const serviceAccount = {
  projectId: env.FIREBASE_PROJECT_ID,
  clientEmail: env.FIREBASE_CLIENT_EMAIL,
  // Replace escaped newlines with actual newlines
  privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    logger.info('Firebase Admin SDK initialized successfully.');
} catch (error) {
    logger.error({ 
        message: 'Firebase Admin SDK initialization failed', 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
    });
    // FIX: Cast `process` to `any` to resolve a type error where `exit` is not found.
    (process as any).exit(1);
}

export const auth = admin.auth();
export const db = admin.firestore();