

import { Router } from 'express';
import type { Response } from 'express';
import { db } from '../config/firebase';
import { firebaseAuthMiddleware } from '../middleware/auth';
import { stripe } from '../config/stripe';
import { ZodError } from 'zod';
import { pauseSubscriptionSchema, resumeSubscriptionSchema } from '../schemas/subscriptions.schema';
import logger from '../config/logger';
import {
    ensureUserOwnsAccount,
    getLatestPauseDocument,
    getOwnedSubscription,
    listSubscriptionsForAccount,
    OwnershipError,
    type OwnershipErrorCode,
} from '../services/accountAccess';

function respondWithOwnershipError(res: Response, error: OwnershipError) {
    const reasonMap: Record<OwnershipErrorCode, string> = {
        ACCOUNT_NOT_OWNED: 'account_not_owned',
        SUBSCRIPTION_NOT_FOUND: 'subscription_not_found',
        SUBSCRIPTION_NOT_OWNED: 'subscription_not_owned',
    };

    const reason = reasonMap[error.code] ?? 'forbidden';
    return res.status(403).send({ error: 'forbidden', reason, message: error.message });
}

export const subscriptionsRouter = Router();

// Get a list of subscriptions from Firestore
subscriptionsRouter.get('/', firebaseAuthMiddleware, async (req, res) => {
    if (!req.user) return res.status(401).send({ error: 'Unauthorized' });
    const { uid } = req.user;
    const accountId = typeof req.query.accountId === 'string' ? req.query.accountId : undefined;

    if (!accountId) {
        return res.status(400).send({ error: 'accountId is required' });
    }

    try {
        await ensureUserOwnsAccount(uid, accountId);

        const subscriptions = await listSubscriptionsForAccount(uid, accountId);
        res.status(200).send(subscriptions);
    } catch (error) {
        if (error instanceof OwnershipError) {
            return respondWithOwnershipError(res, error);
        }
        logger.error({ message: `Error fetching subscriptions for user ${uid}`, accountId, error });
        res.status(500).send({ error: 'Failed to fetch subscriptions' });
    }
});


// Pause a subscription
subscriptionsRouter.post('/pause', firebaseAuthMiddleware, async (req, res) => {
    if (!req.user) return res.status(401).send({ error: 'Unauthorized' });
    const { uid } = req.user;

    try {
        const { accountId, stripeSubId, reason } = pauseSubscriptionSchema.parse(req.body);

        await ensureUserOwnsAccount(uid, accountId);

        const ownedSubscription = await getOwnedSubscription(uid, accountId, stripeSubId);

        // 1. Update the subscription in Stripe
        await stripe.subscriptions.update(stripeSubId,
            { pause_collection: { behavior: 'mark_uncollectible' } },
            { stripeAccount: accountId }
        );

        // 2. Update the subscription status in Firestore
        await ownedSubscription.ref.update({ status: 'paused' });

        // 3. Log the pause event
        const pauseRef = db.collection('users').doc(uid).collection('pauses').doc();
        await pauseRef.set({
            subscriptionId: stripeSubId,
            pausedAt: new Date(),
            reason: reason || 'No reason provided',
            actor: 'admin', // or 'customer' if from portal
            accountId,
        });

        logger.info({ message: `Subscription ${stripeSubId} paused for user ${uid}`, accountId, reason });
        res.status(200).send({ success: true, message: `Subscription ${stripeSubId} paused.` });
    } catch (error) {
        if (error instanceof OwnershipError) {
            return respondWithOwnershipError(res, error);
        }
        if (error instanceof ZodError) {
            logger.warn({ message: 'Invalid pause subscription request', uid, details: error.issues });
            return res.status(400).send({ error: 'Invalid input', details: error.issues });
        }
        logger.error({ message: 'Error pausing subscription', uid, body: req.body, error });
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).send({ error: `Failed to pause subscription: ${errorMessage}` });
    }
});

// Resume a subscription
subscriptionsRouter.post('/resume', firebaseAuthMiddleware, async (req, res) => {
    if (!req.user) return res.status(401).send({ error: 'Unauthorized' });
    const { uid } = req.user;
    
    try {
        const { accountId, stripeSubId } = resumeSubscriptionSchema.parse(req.body);

        await ensureUserOwnsAccount(uid, accountId);

        const ownedSubscription = await getOwnedSubscription(uid, accountId, stripeSubId);

        // 1. Update subscription in Stripe
        await stripe.subscriptions.update(stripeSubId,
            { pause_collection: null },
            { stripeAccount: accountId }
        );

        // 2. Update subscription status in Firestore
        await ownedSubscription.ref.update({ status: 'active' });

        // 3. Log the resume event (optional: can also be handled by webhook)
        const latestPause = await getLatestPauseDocument(uid, accountId, stripeSubId);

        if (latestPause) {
            await latestPause.ref.update({ resumedAt: new Date() });
        }

        logger.info({ message: `Subscription ${stripeSubId} resumed for user ${uid}`, accountId });
        res.status(200).send({ success: true, message: `Subscription ${stripeSubId} resumed.` });
    } catch (error) {
        if (error instanceof OwnershipError) {
            return respondWithOwnershipError(res, error);
        }
        if (error instanceof ZodError) {
            logger.warn({ message: 'Invalid resume subscription request', uid, details: error.issues });
            return res.status(400).send({ error: 'Invalid input', details: error.issues });
        }
        logger.error({ message: 'Error resuming subscription', uid, body: req.body, error });
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).send({ error: `Failed to resuming subscription: ${errorMessage}` });
    }
});