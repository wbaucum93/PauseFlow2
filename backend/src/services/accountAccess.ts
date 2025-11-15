import type { DocumentReference, DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { db } from '../config/firebase';

export type SubscriptionOwnership = {
    ref: DocumentReference<DocumentData>;
    data: DocumentData;
};

export type AccountOwnership = {
    ref: DocumentReference<DocumentData>;
    data: DocumentData;
};

export type OwnershipErrorCode =
    | 'ACCOUNT_NOT_OWNED'
    | 'SUBSCRIPTION_NOT_FOUND'
    | 'SUBSCRIPTION_NOT_OWNED';

export class OwnershipError extends Error {
    constructor(public readonly code: OwnershipErrorCode, message: string) {
        super(message);
        this.name = 'OwnershipError';
    }
}

function userAccountRef(uid: string, accountId: string) {
    return db.collection('users').doc(uid).collection('connected_accounts').doc(accountId);
}

function userSubscriptionRef(uid: string, subscriptionId: string) {
    return db.collection('users').doc(uid).collection('subscriptions').doc(subscriptionId);
}

export async function ensureUserOwnsAccount(uid: string, accountId: string): Promise<AccountOwnership> {
    const accountDoc = await userAccountRef(uid, accountId).get();

    if (!accountDoc.exists) {
        throw new OwnershipError('ACCOUNT_NOT_OWNED', 'Account does not belong to the authenticated user.');
    }

    return { ref: accountDoc.ref, data: accountDoc.data() ?? {} };
}

export async function getOwnedSubscription(
    uid: string,
    accountId: string,
    subscriptionId: string
): Promise<SubscriptionOwnership> {
    const subscriptionDoc = await userSubscriptionRef(uid, subscriptionId).get();

    if (!subscriptionDoc.exists) {
        throw new OwnershipError('SUBSCRIPTION_NOT_FOUND', 'Subscription was not found for the authenticated user.');
    }

    const data = subscriptionDoc.data();

    if (!data || data.stripeAccountId !== accountId) {
        throw new OwnershipError(
            'SUBSCRIPTION_NOT_OWNED',
            'Subscription does not belong to the provided Stripe account.'
        );
    }

    return { ref: subscriptionDoc.ref, data };
}

export async function listSubscriptionsForAccount(uid: string, accountId: string) {
    const snapshot = await db
        .collection('users')
        .doc(uid)
        .collection('subscriptions')
        .where('stripeAccountId', '==', accountId)
        .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function countSubscriptionsByStatus(uid: string, accountId: string, status: string): Promise<number> {
    const aggregate = await db
        .collection('users')
        .doc(uid)
        .collection('subscriptions')
        .where('stripeAccountId', '==', accountId)
        .where('status', '==', status)
        .count()
        .get();

    return aggregate.data().count;
}

export async function sumPausedSubscriptionsMonthlyValue(uid: string, accountId: string): Promise<number> {
    const snapshot = await db
        .collection('users')
        .doc(uid)
        .collection('subscriptions')
        .where('stripeAccountId', '==', accountId)
        .where('status', '==', 'paused')
        .get();

    return snapshot.docs.reduce((total, doc) => {
        const data = doc.data();
        const monthlyValue = typeof data.monthlyValue === 'number' ? data.monthlyValue : 0;
        return total + monthlyValue;
    }, 0);
}

export async function countPauseEvents(uid: string, accountId: string): Promise<number> {
    const aggregate = await db
        .collection('users')
        .doc(uid)
        .collection('pauses')
        .where('accountId', '==', accountId)
        .count()
        .get();

    return aggregate.data().count;
}

export async function getLatestPauseDocument(
    uid: string,
    accountId: string,
    subscriptionId: string
): Promise<QueryDocumentSnapshot<DocumentData> | null> {
    const pauseQuery = await db
        .collection('users')
        .doc(uid)
        .collection('pauses')
        .where('accountId', '==', accountId)
        .where('subscriptionId', '==', subscriptionId)
        .orderBy('pausedAt', 'desc')
        .limit(1)
        .get();

    if (pauseQuery.empty) {
        return null;
    }

    return pauseQuery.docs[0];
}
