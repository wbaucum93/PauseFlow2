import { Router } from 'express';
import { firebaseAuthMiddleware } from '../middleware/auth';
import logger from '../config/logger';
import {
    ensureUserOwnsAccount,
    countPauseEvents,
    countSubscriptionsByStatus,
    sumPausedSubscriptionsMonthlyValue,
    OwnershipError,
    type OwnershipErrorCode,
} from '../services/accountAccess';

export const metricsRouter = Router();

const ownershipReasonMap: Record<OwnershipErrorCode, string> = {
    ACCOUNT_NOT_OWNED: 'account_not_owned',
    SUBSCRIPTION_NOT_FOUND: 'subscription_not_found',
    SUBSCRIPTION_NOT_OWNED: 'subscription_not_owned',
};

metricsRouter.get('/summary', firebaseAuthMiddleware, async (req, res) => {
    if (!req.user) return res.status(401).send({ error: 'Unauthorized' });
    const { uid } = req.user;
    const accountId = typeof req.query.accountId === 'string' ? req.query.accountId : undefined;
    const { range } = req.query; // range can be '30d', etc.

    if (!accountId) {
        return res.status(400).send({ error: 'accountId is required' });
    }

    try {
        await ensureUserOwnsAccount(uid, accountId);

        const [activeCount, pausedCount, revenueSaved, pauseEventsCount] = await Promise.all([
            countSubscriptionsByStatus(uid, accountId, 'active'),
            countSubscriptionsByStatus(uid, accountId, 'paused'),
            sumPausedSubscriptionsMonthlyValue(uid, accountId),
            countPauseEvents(uid, accountId),
        ]);

        // TODO: Implement chart data generation based on the 'range' query param
        // by querying the 'events' collection.

        res.status(200).send({
            revenueSaved,
            activeCustomers: activeCount,
            pausedCustomers: pausedCount,
            totalPauseEvents: pauseEventsCount,
        });
    } catch (error) {
        if (error instanceof OwnershipError) {
            const reason = ownershipReasonMap[error.code] ?? 'account_not_owned';
            return res.status(403).send({ error: 'forbidden', reason, message: error.message });
        }
        logger.error({ message: `Error fetching metrics summary for user ${uid}`, accountId, error });
        res.status(500).send({ error: 'Failed to fetch metrics summary' });
    }
});
