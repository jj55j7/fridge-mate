# 🔧 Firebase Storage Upload Error Fix

## Problem: `storage/unknown` Error

If you're seeing this error when uploading profile photos:

```
Firebase Storage: An unknown error occurred, please check the error payload for server response. (storage/unknown)
```

## Root Cause

This error occurs because **Firebase Storage is not enabled** or **Storage Security Rules are missing**.

## ✅ Solution Steps

### Step 1: Enable Firebase Storage

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **fridge-mate-63f94**
3. Click **Storage** in the left sidebar (under "Build")
4. If you see "Get Started", click it:
   - Choose **Start in production mode** or **test mode** (we'll add proper rules next)
   - Select a location (same region as your Firestore)
   - Click **Done**

### Step 2: Add Storage Security Rules

1. In Storage, go to the **Rules** tab at the top
2. You should see something like:

   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if false;
       }
     }
   }
   ```

3. **Replace** the entire content with these rules:

   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       // Allow users to upload and read their own profile photos
       match /users/{userId}/profile.jpg {
         // Any authenticated user can read profile photos
         allow read: if request.auth != null;

         // Users can only write their own profile photo
         allow write: if request.auth != null && request.auth.uid == userId;
       }

       // Allow users to upload and read their own food photos
       match /users/{userId}/food/{fileName} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

4. Click **Publish** to save

### Step 3: Verify Storage Bucket Name

Make sure your `lib/firebase.ts` has the correct storage bucket:

```typescript
const firebaseConfig = {
  // ... other config
  storageBucket: "fridge-mate-63f94.appspot.com", // ✅ Should match your project
};
```

### Step 4: Test the Upload

1. Restart your Expo app:

   ```bash
   # Stop the current server (Ctrl+C)
   npx expo start --clear
   ```

2. Try uploading a profile photo again
3. Check Metro console for debug logs:
   - `uploadProfilePhoto called with uid:...`
   - `uploadProfilePhoto: fetched blob size:...`
   - `uploadProfilePhoto: upload completed`

## 🎯 Expected Result

After applying these rules, profile photo uploads should work! You should see:

- ✅ Upload completes successfully
- ✅ Photo appears in Firebase Storage Console under `users/{uid}/profile.jpg`
- ✅ Photo URL is stored in Firestore and displays in the app

## 🔍 Additional Debugging

If it still doesn't work:

1. **Check Firebase Console → Storage**:

   - Is Storage enabled?
   - Can you see the "Files" tab?

2. **Check your Firebase project**:

   - Is your project on the Spark (free) plan? Storage is included.
   - Is your project active (not deleted)?

3. **Check the Metro console** for these debug logs:

   ```
   uploadProfilePhoto called with uid: abc123 fileUri: file:///...
   uploadProfilePhoto: fetched blob size 123456 type image/jpeg
   uploadProfilePhoto: storage bucket fridge-mate-63f94.appspot.com
   uploadProfilePhoto: ref path users/abc123/profile.jpg
   ```

4. **Try test mode temporarily** (for debugging only):
   ```javascript
   // TEMPORARY - for testing only!
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
   If this works, the issue is with the rule paths. Make sure to switch back to the secure rules after testing!

## 📞 Still Having Issues?

Share these details:

1. Firebase Console screenshot showing Storage is enabled
2. Current Storage Rules from the Rules tab
3. Complete Metro console output when attempting upload
4. Firebase project ID and storageBucket value from your code
