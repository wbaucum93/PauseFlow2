import { Router } from 'express';

export const adminRouter = Router();

adminRouter.get('/status', (_req, res) => {
  res.json({ ok: true, admin: true });
});

export default adminRouter;
