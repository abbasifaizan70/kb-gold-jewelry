# 🔥 Firebase Setup - Step by Step

Your Firebase credentials are already configured! You just need to enable the required services.

## Step 1: Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **kb-gold-jewelry**
3. In the left sidebar, click **"Firestore Database"**
4. Click **"Create database"**
5. Choose **"Start in test mode"** (for development)
6. Select your preferred location (e.g., us-central)
7. Click **"Enable"**

## Step 2: Enable Anonymous Authentication

1. In the Firebase Console, go to **"Authentication"**
2. Click **"Get started"** (if first time)
3. Go to the **"Sign-in method"** tab
4. Find **"Anonymous"** in the list
5. Click on it and toggle **"Enable"**
6. Click **"Save"**

## Step 3: Set Up Firestore Security Rules

1. Go to **"Firestore Database"** in Firebase Console
2. Click on the **"Rules"** tab
3. Replace the existing rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /apps/{appId}/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Click **"Publish"**

## That's it! 🎉

After completing these 3 steps:
1. Refresh your browser at http://localhost:3000
2. The errors should be gone
3. You can start using the app!

## Verification

Once done, you should be able to:
- ✅ Unlock the app with PIN: **9812**
- ✅ See the dashboard load without errors
- ✅ Create new buy-back transactions
- ✅ Save data to Firebase

---

**Need help?** The authentication error `auth/configuration-not-found` means Anonymous Auth isn't enabled yet. Just follow Step 2 above!

