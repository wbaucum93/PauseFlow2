

import { Router, raw, Request, Response } from 'express';
import { stripe } from '../config/stripe';
import { db } from '../config/firebase';
import Stripe from 'stripe';
import { env } from '../config/env';
import logger from '../config/logger';

export const webhooksRouter = Router();

// Use express.raw middleware for this route to get the raw body
// FIX: Correctly type the request and response objects to resolve property access errors.
// FIX: Changed `req` and `res` types to `any` to resolve persistent property access errors due to a likely type conflict.
webhooksRouter.post('/stripe', raw({ type: 'application/json' }), async (req: any, res: any) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
        if (!sig) {
            logger.error("Webhook signature missing.");
            return res.status(400).send('Webhook Error: Missing signature.');
        }
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        logger.error(`Webhook signature verification failed: ${errorMessage}`);
        return res.status(400).send(`Webhook Error: ${errorMessage}`);
    }

    const connectedAccountId = event.account;
    if (!connectedAccountId) {
        logger.warn({ message: 'Received a platform event on the connect webhook handler', eventType: event.type });
        // Still acknowledge it to prevent retries for events we don't handle here
        return res.status(200).send();
    }
    
    // Find the PauseFlow user associated with this Stripe account
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('stripeAccountId', '==', connectedAccountId).limit(1).get();
    
    if (querySnapshot.empty) {
        logger.warn(`No user found for Stripe account: ${connectedAccountId}`);
        // Return 200 to acknowledge receipt of the event
        return res.status(200).send();
    }
    const userDoc = querySnapshot.docs[0];
    const uid = userDoc.id;
    
    logger.info({ message: `Processing webhook event for user ${uid}`, eventType: event.type, accountId: connectedAccountId });

    // Handle the event
    try {
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                const subscription = event.data.object as Stripe.Subscription;
                const subRef = db.collection('users').doc(uid).collection('subscriptions').doc(subscription.id);
                await subRef.set({
                    stripeSubId: subscription.id,
                    customerId: subscription.customer,
                    status: subscription.status,
                    // other fields...
                }, { merge: true });
                break;
            case 'customer.subscription.deleted':
                const deletedSub = event.data.object as Stripe.Subscription;
                await db.collection('users').doc(uid).collection('subscriptions').doc(deletedSub.id).delete();
                break;
            
            // Handle checkout.session.completed for new PauseFlow signups
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;
                if (session.metadata?.userId) {
                     const userRef = db.collection('users').doc(session.metadata.userId);
                     await userRef.update({
                         plan: 'lifetime', // or based on line items
                         planType: 'lifetime',
                         status: 'active'
                     });
                }
                break;

            default:
                logger.info(`Unhandled event type ${event.type} for account ${connectedAccountId}`);
        }
    } catch (dbError) {
        logger.error({ message: 'Error processing webhook and updating database', eventType: event.type, uid, error: dbError });
        return res.status(500).send({ error: 'Internal server error while processing webhook.' });
    }


    // Return a 200 response to acknowledge receipt of the event
    res.status(200).send();
});