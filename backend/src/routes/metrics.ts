import { Router } from 'express';
import { db } from '../config/firebase';
import { firebaseAuthMiddleware } from '../middleware/auth';
import logger from '../config/logger';

export const metricsRouter = Router();

metricsRouter.get('/summary', firebaseAuthMiddleware, async (req, res) => {
    if (!req.user) return res.status(401).send({ error: 'Unauthorized' });
    const { uid } = req.user;
    const { accountId, range } = req.query; // range can be '30d', etc.

    if (!accountId) {
        return res.status(400).send({ error: 'accountId is required' });
    }

    try {
        // TODO: In a real app, these queries would be more complex and might involve
        // a dedicated analytics collection or service. This is a simplified version.
        
        const subscriptionsRef = db.collection('users').doc(uid).collection('subscriptions');

        const activeSubs = await subscriptionsRef.where('status', '==', 'active').count().get();
        const pausedSubs = await subscriptionsRef.where('status', '==', 'paused').count().get();
        
        const pausesRef = db.collection('users').doc(uid).collection('pauses');
        const totalPauses = await pausesRef.count().get();
        
        // Simplified revenue saved: sum of monthlyValue for all paused subscriptions
        const pausedSubsSnapshot = await subscriptionsRef.where('status', '==', 'paused').get();
        let revenueSaved = 0;
        pausedSubsSnapshot.forEach(doc => {
            revenueSaved += doc.data().monthlyValue || 0;
        });
        
        // TODO: Implement chart data generation based on the 'range' query param
        // by querying the 'events' collection.

        res.status(200).send({
            revenueSaved,
            activeCustomers: activeSubs.data().count,
            pausedCustomers: pausedSubs.data().count,
            totalPauseEvents: totalPauses.data().count,
        });
    } catch (error) {
        logger.error({ message: `Error fetching metrics summary for user ${uid}`, accountId, error });
        res.status(500).send({ error: 'Failed to fetch metrics summary' });
    }
});
