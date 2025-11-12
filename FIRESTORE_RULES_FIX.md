# 🔒 Fix Firestore Permissions Error

## The Issue
You're seeing: `Missing or insufficient permissions`

This means the Firestore security rules aren't set up yet.

## Quick Fix (2 minutes)

### Step 1: Go to Firestore Rules

1. In your Firebase Console, make sure you're on the **Firestore Database** page
2. Click the **"Rules"** tab at the top
3. You'll see a text editor with the current rules

### Step 2: Copy & Paste These Rules

**Delete everything** in the rules editor and replace with:

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

### Step 3: Publish

1. Click the blue **"Publish"** button
2. Wait for the confirmation message

### Step 4: Refresh Your App

Go back to http://localhost:3000 and refresh the page.

## ✅ Expected Result

After refreshing:
- ❌ No more red error banner
- ❌ No console errors
- ✅ Dashboard loads with 0 transactions
- ✅ You can create new buy-back transactions
- ✅ Data saves to Firebase

## What These Rules Do

- `match /apps/{appId}/{document=**}` - Matches all documents under any app
- `allow read, write: if request.auth != null` - Only authenticated users can access
- Since you enabled Anonymous Auth, the app automatically signs in users

## Still Having Issues?

Make sure you completed all 3 steps:
1. ✅ Anonymous Authentication enabled
2. ✅ Firestore Database created
3. ⚠️ **Security Rules published** ← You're on this step now

---

**Ready?** Go to Firebase Console → Firestore Database → Rules tab → Paste the rules → Publish!

