import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey) {
  document.body.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; min-height:100vh; background:#0f172a; color:#fff; font-family:sans-serif; text-align:center; padding:20px;">
      <div style="background:#1e293b; padding:40px; border-radius:12px; max-width:500px;">
        <h2 style="color:#ef4444; margin-top:0;">Firebase Configuration Missing</h2>
        <p style="color:#94a3b8; line-height:1.6;">The Vercel environment variables have not been applied correctly. Please ensure you have added <strong>VITE_FIREBASE_API_KEY</strong> to your Vercel project settings under Production, Preview, and Development environments.</p>
        <p style="color:#94a3b8; margin-bottom:0;">After adding them, you must hit <strong>Redeploy</strong> in Vercel.</p>
      </div>
    </div>
  `;
  throw new Error("Missing Firebase API Key");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'asia-south1');
