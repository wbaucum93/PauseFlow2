
import { db } from '../config/firebase';
import logger from '../config/logger';

/**
 * Fetches the primary Stripe Connect Account ID for a given PauseFlow user.
 * This is a critical security function to ensure users can only access their own data.
 * @param uid The Firebase UID of the user.
 * @returns The Stripe Account ID (e.g., 'acct_...') or null if not found/no accounts connected.
 * @throws An error if the database query fails.
 */
export const getStripeAccountId = async (uid: string): Promise<string | null> => {
    try {
        const accountsRef = db.collection('users').doc(uid).collection('connected_accounts');
        // In a multi-account scenario, you might have more complex logic to select the "primary" account.
        // For now, we assume one active account per user.
        const snapshot = await accountsRef.where('status', '==', 'active').limit(1).get();

        if (snapshot.empty) {
            logger.warn({ message: `No active Stripe account found for user ${uid}` });
            return null;
        }
        
        // The document ID is the Stripe Account ID.
        return snapshot.docs[0].id;
    } catch (error) {
        logger.error({ message: `Error fetching Stripe Account ID for user ${uid}`, error });
        // Re-throw to be caught by the route handler's try-catch block
        throw new Error('Could not retrieve Stripe account information from the database.');
    }
};
