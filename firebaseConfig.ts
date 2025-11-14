
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

/**
 * Firebase configuration for the PauseFlow app.
 *
 * IMPORTANT: Replace the placeholder values below with your actual
 * Firebase project's configuration. You can find these details in the
 * Firebase Console:
 * 1. Go to your project's settings.
 * 2. In the "General" tab, scroll down to "Your apps".
 * 3. Select your web app.
 * 4. Find the "Firebase SDK snippet" and choose the "Config" option.
 * 5. Copy the configuration object's values here.
 */
export const firebaseConfig = {
  apiKey: "AIzaSy...YOUR_API_KEY", // Replace with your API key
  authDomain: "your-project-id.firebaseapp.com", // Replace with your auth domain
  projectId: "your-project-id", // Replace with your project ID
  storageBucket: "your-project-id.appspot.com", // Replace with your storage bucket
  messagingSenderId: "your-sender-id", // Replace with your messaging sender ID
  appId: "1:your-sender-id:web:your-app-id" // Replace with your app ID
};


let app: FirebaseApp;

/**
 * Initializes and returns the Firebase app instance (singleton).
 * Throws an error if the configuration is incomplete.
 */
export function getFirebaseApp(): FirebaseApp {
  if (firebaseConfig.apiKey.startsWith("AIzaSy...")) {
    throw new Error(
      "Firebase API Key is not valid. Please replace the placeholder in firebaseConfig.ts with your actual Firebase project configuration."
    );
  }

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  return app;
}
