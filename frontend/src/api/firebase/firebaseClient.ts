import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Firebase project config, sourced entirely from Vite env vars so no
 * secrets live in source. Copy `.env.example` to `.env` and fill these in
 * (see README) to point the app at a real Firebase project.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

/**
 * measurementId is Analytics-only and optional; everything else is
 * required for the Firestore client to be able to connect at all.
 */
const REQUIRED_CONFIG_KEYS = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
] as const;

/**
 * Whether enough Firebase env vars are present to attempt a real
 * connection. The artwork API layer uses this to decide whether to call
 * Firestore or fall back to the mock dataset.
 */
export function isFirebaseConfigured(): boolean {
  return REQUIRED_CONFIG_KEYS.every((key) => Boolean(firebaseConfig[key]));
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

/**
 * Lazily initializes (once) and returns the Firestore instance.
 * Throws if the required env vars aren't set — callers should check
 * `isFirebaseConfigured()` first if they want to avoid the throw.
 */
export function getFirestoreDb(): Firestore {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase is not configured. Set VITE_FIREBASE_* environment variables (see .env.example).',
    );
  }

  if (!app) {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  }
  if (!db) {
    db = getFirestore(app);
  }

  return db;
}
