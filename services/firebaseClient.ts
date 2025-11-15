import { getFirebaseApp } from '../firebaseConfig';
import { getAuth as firebaseGetAuth, Auth } from 'firebase/auth';
import { getFirestore as firebaseGetFirestore, Firestore } from 'firebase/firestore';

let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = firebaseGetAuth(getFirebaseApp());
  }
  return authInstance;
}

export function getFirebaseFirestore(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = firebaseGetFirestore(getFirebaseApp());
  }
  return firestoreInstance;
}
