import { useState, useCallback, useMemo, useEffect } from 'react';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { User, SubscriptionStatus, Plan } from '../types';
import { getFirebaseAuth, getFirebaseFirestore } from '../services/firebaseClient';

const parseDate = (value: unknown, fallback: Date): Date => {
  if (value instanceof Date) {
    return value;
  }

  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed);
    }
  }

  if (typeof value === 'number') {
    return new Date(value);
  }

  return fallback;
};

const extractSubscriptionStatus = (value: unknown): SubscriptionStatus => {
  if (typeof value !== 'string') {
    return SubscriptionStatus.INACTIVE;
  }

  const allStatuses = Object.values(SubscriptionStatus);
  if (allStatuses.includes(value as SubscriptionStatus)) {
    return value as SubscriptionStatus;
  }

  const normalized = value.toLowerCase();
  const matched = allStatuses.find((status) => status.toLowerCase() === normalized);
  return matched ?? SubscriptionStatus.INACTIVE;
};

const extractPlan = (value: unknown): Plan | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const allPlans = Object.values(Plan);
  if (allPlans.includes(value as Plan)) {
    return value as Plan;
  }

  const normalized = value.toLowerCase();
  return allPlans.find((plan) => plan.toLowerCase() === normalized);
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const db = getFirebaseFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const data = userDoc.exists() ? (userDoc.data() as Record<string, unknown>) : {};

        const createdAtSource = data?.createdAt ?? firebaseUser.metadata.creationTime ?? Date.now();

        const mappedUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          isAdmin: Boolean(data?.isAdmin),
          stripeCustomerId: typeof data?.stripeCustomerId === 'string' ? (data.stripeCustomerId as string) : undefined,
          stripeSubscriptionId: typeof data?.stripeSubscriptionId === 'string' ? (data.stripeSubscriptionId as string) : undefined,
          plan: extractPlan(data?.plan),
          planType: typeof data?.planType === 'string' ? (data.planType as 'monthly' | 'lifetime') : undefined,
          status: extractSubscriptionStatus(data?.status),
          createdAt: parseDate(createdAtSource, new Date()),
        };

        setUser(mappedUser);
        setError(null);
      } catch (err) {
        console.error('Failed to load user profile', err);
        setUser(null);
        setError('Unable to load user profile');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    } catch (err) {
      console.error('Sign-in failed', err);
      setError('Invalid email or password');
      setLoading(false);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(getFirebaseAuth());
      setUser(null);
    } catch (err) {
      console.error('Sign-out failed', err);
      setError('Failed to sign out');
    } finally {
      setLoading(false);
    }
  }, []);

  const purchasePlan = useCallback(async (_plan: Plan) => {
    console.warn('purchasePlan is not implemented yet. Integrate with billing backend.');
  }, []);

  return useMemo(() => ({
    user,
    loading,
    error,
    isLoggedIn: !!user,
    login,
    logout,
    purchasePlan,
  }), [user, loading, error, login, logout, purchasePlan]);
};
