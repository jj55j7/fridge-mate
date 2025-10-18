import * as FileSystem from 'expo-file-system';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from 'firebase/storage';

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
  // Debug: log the incoming URI
  console.debug('uploadProfilePhoto called with uid:', uid, 'fileUri:', fileUri);

  // Helper to convert a file URI to a Blob via XMLHttpRequest (works for RN file:// URIs)
  const uriToBlob = (uri: string) =>
    new Promise<Blob>((resolve, reject) => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response as Blob);
        };
        xhr.onerror = function () {
          reject(new Error('uriToBlob XHR error'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      } catch (e) {
        reject(e);
      }
    });

  try {
    const ref = storageRef(storage, `users/${uid}/profile.jpg`);

    // If the URI is an Android content URI, use FileSystem to read base64 and convert to blob
    if (fileUri.startsWith('content://')) {
      try {
        console.debug('uploadProfilePhoto: detected content:// URI, using FileSystem fallback');
  const b64 = await FileSystem.readAsStringAsync(fileUri, { encoding: 'base64' as any });
        const dataUri = `data:application/octet-stream;base64,${b64}`;
        const response = await fetch(dataUri);
        const blob = await response.blob();
        console.debug('uploadProfilePhoto: fileSystem blob size', (blob as any)?.size);
        await uploadBytes(ref, blob as any);
      } catch (fsErr) {
        console.warn('uploadProfilePhoto: FileSystem fallback failed, trying fetch/XHR fallback', fsErr);
        // fall through to other fallbacks
        try {
          const response = await fetch(fileUri);
          if (!response.ok) {
            throw new Error(`Failed to fetch file at ${fileUri} - status ${response.status}`);
          }
          const blob = await response.blob();
          console.debug('uploadProfilePhoto: fetched blob size', (blob as any)?.size);
          await uploadBytes(ref, blob as any);
        } catch (firstErr) {
          console.warn('uploadProfilePhoto: fetch->blob failed after FileSystem, trying uriToBlob XHR fallback', firstErr);
          const blob = await uriToBlob(fileUri);
          console.debug('uploadProfilePhoto: xhr blob size', (blob as any)?.size);
          await uploadBytes(ref, blob as any);
        }
      }
    } else {
      // First try fetch + blob (works in many environments)
      try {
        const response = await fetch(fileUri);
        if (!response.ok) {
          throw new Error(`Failed to fetch file at ${fileUri} - status ${response.status}`);
        }
        const blob = await response.blob();
        console.debug('uploadProfilePhoto: fetched blob size', (blob as any)?.size);
        await uploadBytes(ref, blob as any);
      } catch (firstErr) {
        console.warn('uploadProfilePhoto: fetch->blob failed, trying uriToBlob XHR fallback', firstErr);
        // Try XHR uri->blob
        const blob = await uriToBlob(fileUri);
        console.debug('uploadProfilePhoto: xhr blob size', (blob as any)?.size);
        await uploadBytes(ref, blob as any);
      }
    }

    const url = await getDownloadURL(ref);
    return url;
  } catch (error: any) {
    const e: any = error;
    console.error('uploadProfilePhoto error:', e?.code || '', e?.message || e);
    throw new Error(`Firebase Storage upload failed: ${e?.code || 'unknown'} - ${e?.message || String(e)}`);
  }
}
