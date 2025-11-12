# 🚀 Deploy Now - Step by Step

Your app is built and ready! Follow these exact steps:

## Step 1: Login to Firebase

Run this in your terminal:

```bash
cd /Users/faizanabbasi/goldbuyback
firebase login
```

**This will:**
- Open a browser window
- Ask you to sign in with your Google account
- Grant Firebase CLI access

**If already logged in**, you'll see: `Already logged in as [your-email]`

---

## Step 2: Initialize Firebase Hosting

Run:

```bash
firebase init hosting
```

**IMPORTANT: Answer the prompts exactly like this:**

```
? Please select an option: Use an existing project
? Select a default Firebase project: kb-gold-jewelry
? What do you want to use as your public directory? build
? Configure as a single-page app (rewrite all urls to /index.html)? Yes
? Set up automatic builds and deploys with GitHub? No
? File build/index.html already exists. Overwrite? No
```

---

## Step 3: Deploy to Firebase

Run:

```bash
firebase deploy --only hosting
```

Wait 1-2 minutes for deployment to complete.

---

## Step 4: Get Your URL

After deployment, you'll see something like:

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/kb-gold-jewelry/overview
Hosting URL: https://kb-gold-jewelry.web.app
```

**Copy that Hosting URL** - that's your live app! 🎉

---

## Step 5: Test It

1. Open the URL in your browser
2. Open it on your Android phone
3. Enter PIN: `9812`
4. Test creating transactions

---

## Quick Commands Reference

```bash
# Login (one time)
firebase login

# Initialize (one time)
firebase init hosting

# Deploy (every time you update)
npm run build
firebase deploy --only hosting

# Check deployment status
firebase hosting:sites:list
```

---

## Troubleshooting

### "Command not found: firebase"
```bash
npm install -g firebase-tools
```

### "User must be authenticated"
```bash
firebase login --reauth
```

### Need to change Firebase project?
```bash
firebase use kb-gold-jewelry
```

---

**Ready?** Open your terminal and start with Step 1! 🚀

