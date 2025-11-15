
import { Router } from 'express';
import { db } from '../config/firebase';
import { firebaseAuthMiddleware } from '../middleware/auth';
import { stripe } from '../config/stripe';
import { ZodError } from 'zod';
import { pauseSubscriptionSchema, resumeSubscriptionSchema } from '../schemas/subscriptions.schema';
import { getStripeAccountId } from '../utils/stripe';
import logger from '../config/logger';

export const subscriptionsRouter = Router();

// Get a list of subscriptions from Firestore
subscriptionsRouter.get('/', firebaseAuthMiddleware, async (req, res) => {
    if (!req.user) return res.status(401).send({ error: 'Unauthorized' });
    const { uid } = req.user;

    try {
        // SECURITY FIX: Ensure the user has a connected account before proceeding.
        const stripeAccountId = await getStripeAccountId(uid);
        if (!stripeAccountId) {
            return res.status(400).send({ error: 'User has no connected Stripe account.' });
        }

        const snapshot = await db.collection('users').doc(uid).collection('subscriptions').get();
        const subscriptions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).send(subscriptions);
    } catch (error) {
        logger.error({ message: `Error fetching subscriptions for user ${uid}`, error });
        res.status(500).send({ error: 'Failed to fetch subscriptions' });
    }
});


// Pause a subscription
subscriptionsRouter.post('/pause', firebaseAuthMiddleware, async (req, res) => {
    if (!req.user) return res.status(401).send({ error: 'Unauthorized' });
    const { uid } = req.user;

    try {
        // SECURITY FIX: Fetch the user's Stripe Account ID from the database, not the request body.
        const stripeAccountId = await getStripeAccountId(uid);
        if (!stripeAccountId) {
            return res.status(400).send({ error: 'User has no connected Stripe account.' });
        }

        const { stripeSubId, reason } = pauseSubscriptionSchema.parse(req.body);

        // 1. Update the subscription in Stripe
        await stripe.subscriptions.update(stripeSubId, 
            { pause_collection: { behavior: 'mark_uncollectible' } },
            { stripeAccount: stripeAccountId }
        );

        // 2. Update the subscription status in Firestore
        const subRef = db.collection('users').doc(uid).collection('subscriptions').doc(stripeSubId);
        await subRef.update({ status: 'paused' });

        // 3. Log the pause event
        const pauseRef = db.collection('users').doc(uid).collection('pauses').doc();
        await pauseRef.set({
            subscriptionId: stripeSubId,
            pausedAt: new Date(),
            reason: reason || 'No reason provided',
            actor: 'admin', // or 'customer' if from portal
        });

        logger.info({ message: `Subscription ${stripeSubId} paused for user ${uid}`, accountId: stripeAccountId, reason });
        res.status(200).send({ success: true, message: `Subscription ${stripeSubId} paused.` });
    } catch (error) {
        if (error instanceof ZodError) {
            // FIX: The property on a ZodError is 'issues', not 'errors'.
            logger.warn({ message: 'Invalid pause subscription request', uid, details: error.issues });
            // FIX: The property on a ZodError is 'issues', not 'errors'.
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
        // SECURITY FIX: Fetch the user's Stripe Account ID from the database, not the request body.
        const stripeAccountId = await getStripeAccountId(uid);
        if (!stripeAccountId) {
            return res.status(400).send({ error: 'User has no connected Stripe account.' });
        }

        const { stripeSubId } = resumeSubscriptionSchema.parse(req.body);
        
        // 1. Update subscription in Stripe
        await stripe.subscriptions.update(stripeSubId, 
            { pause_collection: null },
            { stripeAccount: stripeAccountId }
        );
        
        // 2. Update subscription status in Firestore
        const subRef = db.collection('users').doc(uid).collection('subscriptions').doc(stripeSubId);
        await subRef.update({ status: 'active' });

        // 3. Log the resume event (optional: can also be handled by webhook)
        // Find the latest pause event for this subscription and update `resumedAt`
        const pauseQuery = await db.collection('users').doc(uid).collection('pauses')
            .where('subscriptionId', '==', stripeSubId)
            .orderBy('pausedAt', 'desc')
            .limit(1)
            .get();
            
        if (!pauseQuery.empty) {
            const pauseDoc = pauseQuery.docs[0];
            await pauseDoc.ref.update({ resumedAt: new Date() });
        }
        
        logger.info({ message: `Subscription ${stripeSubId} resumed for user ${uid}`, accountId: stripeAccountId });
        res.status(200).send({ success: true, message: `Subscription ${stripeSubId} resumed.` });
    } catch (error) {
        if (error instanceof ZodError) {
            // FIX: The property on a ZodError is 'issues', not 'errors'.
            logger.warn({ message: 'Invalid resume subscription request', uid, details: error.issues });
            // FIX: The property on a ZodError is 'issues', not 'errors'.
            return res.status(400).send({ error: 'Invalid input', details: error.issues });
        }
        logger.error({ message: 'Error resuming subscription', uid, body: req.body, error });
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).send({ error: `Failed to resuming subscription: ${errorMessage}` });
    }
});
