import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from 'firebase/storage';

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
export const storage = getStorage(app);

export default app;

/**
 * Update a user's location and lastActive timestamp in Firestore.
 * Writes to: /users/{uid}  { location: { latitude, longitude }, lastActive }
 */
export async function updateUserLocation(uid: string, latitude: number, longitude: number) {
  if (!uid) return;
  try {
    await setDoc(doc(db, 'users', uid), {
      location: { latitude, longitude },
      lastActive: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Failed to update user location:', error);
    throw error;
  }
}

/**
 * Upload a profile photo file URI to Firebase Storage and return its download URL.
 * Stores at `users/{uid}/profile.jpg` (overwrites if exists).
 */
export async function uploadProfilePhoto(uid: string, fileUri: string): Promise<string> {
  if (!uid) throw new Error('No uid provided');
  try {
    // Fetch the file and convert to blob (works with expo local URIs)
    const response = await fetch(fileUri);
    const blob = await response.blob();

    const ref = storageRef(storage, `users/${uid}/profile.jpg`);
    await uploadBytes(ref, blob);
    const url = await getDownloadURL(ref);
    return url;
  } catch (error) {
    console.error('uploadProfilePhoto error:', error);
    throw error;
  }
}
