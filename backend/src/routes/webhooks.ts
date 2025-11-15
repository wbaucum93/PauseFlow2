

import { Router, raw, Request, Response } from 'express';
import { stripe } from '../config/stripe';
import { db } from '../config/firebase';
import Stripe from 'stripe';
import { env } from '../config/env';
import logger from '../config/logger';
import { FieldValue } from 'firebase-admin/firestore';

export const webhooksRouter = Router();

// Use express.raw middleware for this route to get the raw body
webhooksRouter.post('/stripe', raw({ type: 'application/json' }), async (req: Request, res: Response) => {
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
    const accountSnapshot = await db
        .collectionGroup('connected_accounts')
        .where('stripeAccountId', '==', connectedAccountId)
        .limit(1)
        .get();

    if (accountSnapshot.empty) {
        logger.warn(`No user found for Stripe account: ${connectedAccountId}`);
        // Return 200 to acknowledge receipt of the event
        return res.status(200).send();
    }
    const accountDoc = accountSnapshot.docs[0];
    const userRef = accountDoc.ref.parent.parent;

    if (!userRef) {
        logger.error({ message: 'Unable to resolve user reference from connected account document', connectedAccountId });
        return res.status(200).send();
    }

    const uid = userRef.id;
    
    logger.info({ message: `Processing webhook event for user ${uid}`, eventType: event.type, accountId: connectedAccountId });

    // Handle the event
    try {
        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const subRef = userRef.collection('subscriptions').doc(subscription.id);
                await subRef.set({
                    stripeSubId: subscription.id,
                    customerId: subscription.customer,
                    status: subscription.status,
                    stripeAccountId: connectedAccountId,
                    currentPeriodEnd: subscription.current_period_end
                        ? new Date(subscription.current_period_end * 1000)
                        : FieldValue.delete(),
                    canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : FieldValue.delete(),
                    updatedAt: FieldValue.serverTimestamp(),
                }, { merge: true });
                break;
            }
            case 'customer.subscription.deleted': {
                const deletedSub = event.data.object as Stripe.Subscription;
                await userRef.collection('subscriptions').doc(deletedSub.id).delete();
                break;
            }
            
            // Handle checkout.session.completed for new PauseFlow signups
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const potentialUids = new Set<string>();
                if (typeof session.metadata?.userId === 'string') {
                    potentialUids.add(session.metadata.userId);
                }
                if (typeof session.client_reference_id === 'string') {
                    potentialUids.add(session.client_reference_id);
                }

                let verifiedUid: string | undefined;

                for (const candidateUid of potentialUids) {
                    const record = await db
                        .collection('users')
                        .doc(candidateUid)
                        .collection('checkout_sessions')
                        .doc(session.id)
                        .get();

                    if (record.exists) {
                        verifiedUid = candidateUid;
                        await record.ref.delete().catch(() => undefined);
                        break;
                    }
                }

                if (!verifiedUid && session.customer) {
                    const customerMatch = await db
                        .collection('users')
                        .where('stripeCustomerId', '==', session.customer)
                        .limit(1)
                        .get();
                    if (!customerMatch.empty) {
                        verifiedUid = customerMatch.docs[0].id;
                    }
                }

                if (!verifiedUid) {
                    logger.warn({
                        message: 'Checkout session completed without matching user context',
                        sessionId: session.id,
                        customer: session.customer,
                    });
                    break;
                }

                const targetUserRef = db.collection('users').doc(verifiedUid);
                await targetUserRef.set({
                    plan: 'lifetime',
                    planType: 'lifetime',
                    status: 'active',
                    updatedAt: FieldValue.serverTimestamp(),
                }, { merge: true });
                break;
            }

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