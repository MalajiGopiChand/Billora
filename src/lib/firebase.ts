import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCwzSpZS3eTECQ6OvxCLAX8xA77EWIkmBA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "billingsoftware-cdb39.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://billingsoftware-cdb39-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "billingsoftware-cdb39",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "billingsoftware-cdb39.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "961869203935",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:961869203935:web:cd79db8fab61ff20049c6a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-BW7RHEVYXN",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || 'asia-south1');
