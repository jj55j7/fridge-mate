import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
// Note: Firebase Storage not needed - we use base64 in Firestore instead (FREE!)

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDhBaleAADOHYtM4NPYKaS5Aq7omO87PmE",
  authDomain: "fridge-mate-63f94.firebaseapp.com",
  projectId: "fridge-mate-63f94",
  // Correct storage bucket hostname for Firebase Storage
  storageBucket: "fridge-mate-63f94.appspot.com",
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
 * Upload a profile photo by converting to base64 and storing in Firestore.
 * This is FREE - no Firebase Storage billing required!
 * Returns the base64 data URI that can be used directly in Image components.
 */
export async function uploadProfilePhoto(uid: string, fileUri: string): Promise<string> {
  if (!uid) throw new Error('No uid provided');
  console.debug('uploadProfilePhoto called with uid:', uid, 'fileUri:', fileUri);

  try {
    // If already a data URI, return as-is
    if (fileUri.startsWith('data:')) {
      console.debug('uploadProfilePhoto: already a data URI');
      return fileUri;
    }

    // Convert file URI to base64 using fetch + FileReader
    console.debug('uploadProfilePhoto: converting to base64');
    const response = await fetch(fileUri);
    const blob = await response.blob();
    
    // Convert blob to base64 data URI
    const base64DataUri = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    console.debug('uploadProfilePhoto: conversion complete, size:', base64DataUri.length);
    
    return base64DataUri;
  } catch (error: any) {
    console.error('uploadProfilePhoto error:', error?.message || error);
    throw new Error(`Profile photo upload failed: ${error?.message || String(error)}`);
  }
}
