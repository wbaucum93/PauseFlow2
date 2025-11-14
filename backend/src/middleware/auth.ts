

import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import logger from '../config/logger';

// Extend the Express Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
      };
    }
  }
}

// FIX: Use explicit Request, Response, NextFunction types from express to fix property access errors.
// FIX: Changed `req` and `res` types to `any` to resolve persistent property access errors due to a likely type conflict.
export const firebaseAuthMiddleware = async (req: any, res: any, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn({ message: 'Auth token missing or malformed', path: req.path, ip: req.ip });
    return res.status(401).send({ error: 'Unauthorized: No token provided.' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email
    };
    next();
  } catch (error) {
    logger.error({ 
        message: 'Error verifying Firebase ID token', 
        error: error instanceof Error ? error.message : String(error),
        path: req.path,
        ip: req.ip
    });
    return res.status(403).send({ error: 'Unauthorized: Invalid token.' });
  }
};