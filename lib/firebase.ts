import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDhBaleAADOHYtM4NPYKaS5Aq7omO87PmE",
  authDomain: "fridge-mate-63f94.firebaseapp.com",
  projectId: "fridge-mate-63f94",
  storageBucket: "fridge-mate-63f94.firebasestorage.app",
  messagingSenderId: "501447406327",
  appId: "1:501447406327:web:5b6e4cce440ac06833d9f2",
  measurementId: "G-6071018WT8"
};

// Initialize Firebase (only if not already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
