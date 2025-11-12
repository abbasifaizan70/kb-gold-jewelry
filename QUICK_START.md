# 🚀 Quick Start Guide

## Current Status

✅ App is running at **http://localhost:3000**  
✅ Firebase credentials are configured  
⚠️ **Firebase services need to be enabled**

---

## 3-Minute Setup

### Step 1: Enable Anonymous Authentication (1 min)

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select **"kb-gold-jewelry"** project
3. Click **"Authentication"** in left sidebar
4. Click **"Get started"** button
5. Go to **"Sign-in method"** tab
6. Find **"Anonymous"** and click on it
7. Toggle **Enable** switch
8. Click **Save**

### Step 2: Enable Firestore Database (1 min)

1. In Firebase Console, click **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"**
4. Choose location (e.g., **us-central**)
5. Click **Enable**

### Step 3: Set Security Rules (1 min)

1. In Firestore, go to **"Rules"** tab
2. Replace with this:

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

3. Click **Publish**

---

## Done! 🎉

Refresh your browser at http://localhost:3000

The red warning banner will disappear and you can:

- Enter PIN: **9812**
- Create buy-back transactions
- Print receipts
- Generate reports

---

## Need More Help?

See `FIREBASE_SETUP_STEPS.md` for detailed instructions with screenshots.

