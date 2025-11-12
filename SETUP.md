# KB Gold Jewelry - Buy-Back Management System

## Setup Instructions

### 1. Firebase Configuration

Before running the app, you need to set up your Firebase project:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Enable **Firestore Database** in your project
4. Enable **Authentication** and turn on **Anonymous** sign-in
5. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click on the web icon `</>` to create a web app
   - Copy the `firebaseConfig` object

### 2. Update Firebase Config

Open `src/firebaseConfig.js` and replace the placeholder values with your actual Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Firestore Security Rules

Set up these security rules in Firebase Console > Firestore Database > Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/public/data/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Install Dependencies and Run

```bash
npm install
npm start
```

The app will open at `http://localhost:3000`

## Default Credentials

- **PIN**: `9812`
- **Master Reset Code**: `159753` (use if locked out after 5 failed attempts)

## Features

- 📊 Dashboard with monthly analytics
- 💰 Register gold, diamond, and watch buy-backs
- 📝 Digital signature capture
- 📸 ID photo capture
- 🖨️ Print receipts
- 📈 Monthly reports
- 🔒 PIN-based security system
- 📱 Fully responsive (mobile-friendly)

## Tech Stack

- React 19
- Firebase (Firestore + Auth)
- Tailwind CSS
- Lucide React Icons

## Support

For issues or questions, contact: karelfonseca1@gmail.com

