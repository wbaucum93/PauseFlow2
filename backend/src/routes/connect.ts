import { Router } from 'express';
import Stripe from 'stripe';
import crypto from 'crypto';
import { stripe } from '../config/stripe';
import { db } from '../config/firebase';
import { firebaseAuthMiddleware } from '../middleware/auth';
import { env } from '../config/env';
import logger from '../config/logger';
import { FieldValue } from 'firebase-admin/firestore';

const CONNECT_STATE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export const connectRouter = Router();

// Endpoint to initiate the Stripe Connect OAuth flow
connectRouter.post('/oauth/init', firebaseAuthMiddleware, async (req, res) => {
    if (!req.user) return res.status(401).send({ error: 'Unauthorized' });
    const { uid } = req.user;

    try {
        const state = crypto.randomBytes(32).toString('hex');
        const expiresAt = Date.now() + CONNECT_STATE_TTL_MS;

        await db.collection('connect_states').doc(state).set({
            uid,
            createdAt: FieldValue.serverTimestamp(),
            expiresAt,
        });

        const args: Stripe.OAuthAuthorizeUrlParams = {
            response_type: 'code',
            client_id: env.STRIPE_CLIENT_ID,
            scope: 'read_write',
            redirect_uri: `${env.BACKEND_BASE_URL}/api/connect/oauth/callback`,
            state,
        };
        const url = stripe.oauth.authorizeUrl(args);
        res.send({ url });
    } catch (e) {
        logger.error({
            message: "Error creating Stripe Connect OAuth URL",
            error: e,
            uid
        });
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        res.status(500).send({ error: `Could not create Stripe Connect URL: ${errorMessage}` });
    }
});

// Endpoint to handle the OAuth callback from Stripe
connectRouter.get('/oauth/callback', async (req, res) => {
    const { code, state } = req.query;

    if (typeof state !== 'string') {
        return res.status(400).send('Error: Missing or invalid state parameter.');
    }

    const stateDoc = await db.collection('connect_states').doc(state).get();

    if (!stateDoc.exists) {
        logger.warn({ message: 'Received OAuth callback with unknown state', state });
        return res.status(400).send('Error: Invalid OAuth state.');
    }

    const stateData = stateDoc.data() as { uid?: string; expiresAt?: number } | undefined;
    const uid = stateData?.uid;
    const expiresAt = stateData?.expiresAt ?? 0;

    if (!uid) {
        logger.warn({ message: 'OAuth state document missing uid', state });
        await stateDoc.ref.delete().catch(() => undefined);
        return res.status(400).send('Error: Invalid OAuth state.');
    }

    if (Date.now() > expiresAt) {
        logger.warn({ message: 'OAuth state expired before callback', state, uid });
        await stateDoc.ref.delete().catch(() => undefined);
        return res.status(400).send('Error: OAuth state has expired.');
    }

    await stateDoc.ref.delete().catch(() => undefined);

    if (typeof code !== 'string') {
        return res.status(400).send('Error: Missing authorization code.');
    }

    try {
        const response = await stripe.oauth.token({
            grant_type: 'authorization_code',
            code,
        });

        const connectedAccountId = response.stripe_user_id;

        await db.runTransaction(async (tx) => {
            const userRef = db.collection('users').doc(uid);
            const accountRef = userRef.collection('connected_accounts').doc(connectedAccountId);
            tx.set(accountRef, {
                stripeAccountId: connectedAccountId,
                scope: response.scope,
                status: 'active',
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            }, { merge: true });
            tx.set(userRef, {
                connectedAccountIds: FieldValue.arrayUnion(connectedAccountId),
                lastConnectedAccountAt: FieldValue.serverTimestamp(),
            }, { merge: true });
        });

        logger.info({ message: `Stripe account ${connectedAccountId} connected for user ${uid}` });
        res.redirect(`${env.FRONTEND_BASE_URL}/dashboard?stripe_connect=success`);
    } catch (e) {
        logger.error({
            message: 'Stripe OAuth callback error',
            error: e,
            uid,
            state,
        });
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        res.redirect(`${env.FRONTEND_BASE_URL}/dashboard?stripe_connect=error&message=${encodeURIComponent(errorMessage)}`);
    }
});
