import { Router } from 'express';
import Stripe from 'stripe';
import { stripe } from '../config/stripe';
import { db } from '../config/firebase';
import { firebaseAuthMiddleware } from '../middleware/auth';
import { env } from '../config/env';
import logger from '../config/logger';

export const connectRouter = Router();

// Endpoint to initiate the Stripe Connect OAuth flow
connectRouter.post('/oauth/init', firebaseAuthMiddleware, async (req, res) => {
    if (!req.user) return res.status(401).send({ error: 'Unauthorized' });
    const { uid } = req.user;

    try {
        const state = uid; // Use the Firebase UID as the state to identify the user on callback
        
        const args: Stripe.OAuthAuthorizeUrlParams = {
            response_type: 'code',
            client_id: env.STRIPE_CLIENT_ID,
            scope: 'read_write',
            redirect_uri: `${env.FRONTEND_BASE_URL}/api/connect/oauth/callback`, // Stripe redirects here, which should then redirect to frontend
            state: state
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
    const { code, state: uid } = req.query;

    if (!uid) {
        return res.status(400).send('Error: State (user ID) is missing.');
    }
    
    try {
        const response = await stripe.oauth.token({
            grant_type: 'authorization_code',
            code: code as string,
        });

        const connectedAccountId = response.stripe_user_id;

        // Save the connected account ID to Firestore
        await db.collection('users').doc(uid as string).collection('connected_accounts').doc(connectedAccountId).set({
            stripeAccountId: connectedAccountId,
            scope: response.scope,
            status: 'active',
            createdAt: new Date(),
        });
        
        logger.info({ message: `Stripe account ${connectedAccountId} connected for user ${uid}` });
        // Redirect user back to the frontend application
        res.redirect(`${env.FRONTEND_BASE_URL}/dashboard?stripe_connect=success`);
    } catch (e) {
        logger.error({ 
            message: "Stripe OAuth callback error",
            error: e,
            uid
        });
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        res.redirect(`${env.FRONTEND_BASE_URL}/dashboard?stripe_connect=error&message=${encodeURIComponent(errorMessage)}`);
    }
});
