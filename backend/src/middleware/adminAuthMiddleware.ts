import { Request, Response, NextFunction } from 'express';
import { db } from '../config/firebase';
import logger from '../config/logger';

const ADMIN_COLLECTION = 'users';

const respond = (res: Response, status: number, body: Record<string, unknown>) => {
  return res.status(status).json(body);
};

export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authUser = req.user;

  if (!authUser) {
    logger.warn({
      message: 'Admin route accessed without authenticated user context',
      path: req.path,
      ip: req.ip,
    });
    return respond(res, 401, { error: 'Unauthorized', code: 'auth/missing-user' });
  }

  try {
    const userDoc = await db.collection(ADMIN_COLLECTION).doc(authUser.uid).get();

    if (!userDoc.exists) {
      logger.warn({
        message: 'Admin check failed: user document not found',
        path: req.path,
        uid: authUser.uid,
      });
      return respond(res, 403, { error: 'Forbidden', code: 'auth/admin-not-found' });
    }

    const userData = userDoc.data() ?? {};

    if (userData.isAdmin !== true) {
      logger.warn({
        message: 'Admin check failed: user lacks admin privileges',
        path: req.path,
        uid: authUser.uid,
      });
      return respond(res, 403, { error: 'Forbidden', code: 'auth/not-admin' });
    }

    req.user = { ...authUser, isAdmin: true };
    return next();
  } catch (error) {
    logger.error({
      message: 'Admin check encountered an unexpected error',
      error: error instanceof Error ? error.message : String(error),
      path: req.path,
      uid: authUser.uid,
    });
    return respond(res, 500, { error: 'Internal Server Error', code: 'auth/admin-check-failed' });
  }
};

export default adminAuthMiddleware;
