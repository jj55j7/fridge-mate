# Firebase Setup Guide for Fridge-Mate

## 🔥 Firebase Configuration Steps

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `fridge-mate` (or your preferred name)
4. Enable Google Analytics (optional but recommended)
5. Click "Create project"

### 2. Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get Started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** authentication
5. Click **Save**

### 3. Create Firestore Database

1. Go to **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location (choose closest to your users)
5. Click **Done**

### 4. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click **Add app** and select **Web** (</> icon)
4. Register your app with a nickname like "Fridge-Mate Web"
5. Copy the Firebase configuration object

### 5. Update Your App Configuration

Replace the placeholder values in `lib/firebase.ts` with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id",
};
```

### 6. Set Up Security Rules (Optional but Recommended)

In Firestore Database > Rules, update the rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 7. Test Your Setup

1. Run your app: `npm start`
2. Try creating a new account
3. Check Firebase Console to see if the user appears in Authentication
4. Check Firestore to see if the user profile was created

## 🚀 Additional Firebase Features to Consider

### Cloud Storage (for food photos)

- Enable Cloud Storage for storing user-uploaded food photos
- Set up security rules for image uploads

### Cloud Functions (for AI integration)

- Set up Cloud Functions for AI food recognition
- Integrate with services like Google Vision API or Clarifai

### Push Notifications

- Enable Cloud Messaging for match notifications
- Set up notification triggers for new matches

## 🔧 Environment Variables (Recommended)

For production, consider using environment variables:

1. Install `expo-constants`: `npx expo install expo-constants`
2. Create `.env` file with your Firebase config
3. Update `lib/firebase.ts` to use environment variables

## 📱 Testing Authentication Flow

1. **Sign Up Flow:**

   - Email/Password → Profile Setup → Main App

2. **Sign In Flow:**

   - Email/Password → Main App

3. **Profile Management:**
   - View profile in home screen
   - Update preferences (future feature)

## 🛠️ Troubleshooting

### Common Issues:

1. **"Firebase not initialized"**

   - Check your Firebase config values
   - Ensure all required fields are filled

2. **"Permission denied"**

   - Check Firestore security rules
   - Ensure user is authenticated

3. **"Network request failed"**
   - Check internet connection
   - Verify Firebase project is active

### Debug Mode:

Add this to your Firebase config for debugging:

```typescript
// Add to firebase.ts for debugging
if (__DEV__) {
  console.log("Firebase config:", firebaseConfig);
}
```

## 🎯 Next Steps

1. Set up Firebase Storage for food photos
2. Integrate AI/ML for food recognition
3. Add real-time matching algorithm
4. Implement push notifications
5. Add user location services for local matches

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
