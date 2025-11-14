import { db } from '../config/firebase';
import { stripe } from '../config/stripe';

// This function would be triggered by a Cloud Scheduler job (e.g., every hour).
export async function syncStripeData() {
    console.log("Starting Stripe data sync job...");
    
    const accountsSnapshot = await db.collectionGroup('connected_accounts').get();

    for (const doc of accountsSnapshot.docs) {
        const account = doc.data();
        const { stripeAccountId } = account;
        const uid = doc.ref.parent.parent?.id;

        if (!uid) continue;

        console.log(`Syncing subscriptions for user ${uid} and account ${stripeAccountId}`);

        try {
            for await (const subscription of stripe.subscriptions.list({ limit: 100 }, { stripeAccount: stripeAccountId })) {
                const subRef = db.collection('users').doc(uid).collection('subscriptions').doc(subscription.id);
                
                // TODO: Map all relevant fields from the Stripe subscription object
                // to your Firestore document structure.
                const subData = {
                    stripeSubId: subscription.id,
                    status: subscription.status,
                    // FIX: Cast subscription to 'any' to bypass incorrect type definition that lacks current_period_end.
                    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                    // ... and so on
                    lastSyncAt: new Date(),
                };

                await subRef.set(subData, { merge: true });
            }
            console.log(`Successfully synced subscriptions for account ${stripeAccountId}`);
        } catch (error) {
            console.error(`Failed to sync subscriptions for account ${stripeAccountId}:`, error);
        }
    }
    console.log("Stripe data sync job finished.");
}

// TODO: Set up a Google Cloud Scheduler job to trigger this function.
// This can be done via an HTTP endpoint or a Pub/Sub topic that Cloud Run listens to.