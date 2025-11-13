# KB Gold Jewelry - Buy-Back Management System

A modern, secure web application for managing gold, diamond, and watch buy-back transactions. Built with React and Firebase, featuring real-time data sync, digital signatures, receipt printing, and comprehensive reporting.

🌐 **Live App:** https://kb-gold-jewelry-f05f0.web.app

📊 **Project Console:** https://console.firebase.google.com/project/kb-gold-jewelry-f05f0/overview

---

## ⚡ Quick Start (TL;DR)

```bash
# 1. Clone and install
git clone <repository-url>
cd goldbuyback
npm install

# 2. Configure Firebase (edit src/firebaseConfig.js with your credentials)

# 3. Run locally
npm start

# 4. Deploy to Firebase
npm run build
firebase deploy
```

**Default Login:** PIN: `9812` | Master Code: `159753`

[Full setup instructions below ⬇️](#firebase-setup)

---

## 📋 Table of Contents

- [Quick Start](#quick-start-tldr)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Firebase Setup](#firebase-setup)
- [Deployment](#deployment)
- [Security](#security)
- [Usage Guide](#usage-guide)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Recent Updates](#recent-updates-november-13-2025)
- [License](#license)

---

## ✨ Features

### Core Features
- 📊 **Real-time Dashboard** - Monthly analytics with spending, weight, and transaction counts
- 💰 **Transaction Management** - Record gold, diamond, and watch buy-backs
- 🖊️ **Digital Signatures** - Canvas-based signature capture for legal documentation
- 📸 **ID Photo Capture** - Mobile camera integration for customer ID verification
- 🖨️ **Receipt Printing** - Professional receipts with business branding
- 📈 **Monthly Reports** - Filterable reports with export to PDF capability
- 🔍 **Smart Search** - Full-text search across customer names, items, brands, and models
- 📱 **Mobile Responsive** - Optimized for tablets and smartphones

### Security Features
- 🔒 **PIN Lock System** - 4-digit PIN protection with lockout after failed attempts
- 🔐 **Master Reset Code** - Emergency access recovery system
- 👤 **Anonymous Authentication** - Secure Firebase authentication without user accounts
- 🛡️ **Firestore Security Rules** - Server-side data access control

### Additional Features
- 🏪 **Multi-Store Support** - Manage multiple store locations with addresses
- ⚙️ **Configurable Settings** - Store information and legal terms customization
- 🔑 **Security Settings** - Change PIN and Master Code from Settings panel
- 💾 **Cloud Sync** - Automatic data backup to Firebase Firestore
- 🌙 **Dark Mode UI** - Modern slate/amber color scheme
- ⚡ **PWA Ready** - Installable as a native app on Android/iOS

---

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI library with hooks
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Create React App** - Zero-config build setup

### Backend & Services
- **Firebase Authentication** - Anonymous user sign-in
- **Cloud Firestore** - NoSQL real-time database
- **Firebase Hosting** - Global CDN with HTTPS

### Development Tools
- **Firebase CLI** - Deployment and management
- **PostCSS** - CSS processing
- **ESLint** - Code quality checking

---

## 🚀 Installation

### Prerequisites
- Node.js 14+ and npm
- Firebase account (free tier)
- Modern web browser

### Step-by-Step Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd goldbuyback
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase**
   - See [Firebase Setup](#firebase-setup) section below

4. **Start development server**
```bash
npm start
```

The app will open at http://localhost:3000

**Default Credentials:**
- PIN: `9812`
- Master Reset Code: `159753`

---

## 🔥 Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it (e.g., "KB Gold Jewelry")
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Get Firebase Configuration

1. In Firebase Console, click ⚙️ → **Project settings**
2. Scroll to "Your apps" → Click `</>` (Web)
3. Register app with a nickname
4. Copy the `firebaseConfig` object

### Step 3: Update Local Configuration

Edit `src/firebaseConfig.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 4: Enable Firebase Services

#### 4.1 Enable Anonymous Authentication
1. Go to **Authentication** → **Sign-in method**
2. Enable **Anonymous**
3. Click Save

#### 4.2 Create Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode**
4. Select your location
5. Click Enable

#### 4.3 Publish Security Rules
1. In Firestore → **Rules** tab
2. Replace with:

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

✅ **Setup complete!** Your app is now fully functional.

For detailed instructions, see: `FIREBASE_SETUP_STEPS.md`

---

## 🌐 Deployment

### Deploy to Firebase Hosting

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**
```bash
firebase login
```

3. **Build production version**
```bash
npm run build
```

4. **Deploy to hosting**
```bash
firebase deploy --only hosting
```

5. **Get your live URL**
```
✔  Deploy complete!
Hosting URL: https://your-project.web.app
```

### Update Deployment

When you make changes:
```bash
npm run build
firebase deploy --only hosting
```

For complete deployment guide, see: `DEPLOYMENT_GUIDE.md`

---

## 🔐 Security

### PIN Protection
- Default PIN: `9812` (changeable in Settings → Security)
- 5 failed attempts trigger system lockout
- Master reset code: `159753` (changeable in Settings → Security)
- PIN must be 4+ digits, Master Code must be 6+ digits

### Changing Security PINs
1. Go to **Settings** → **Security PINs** tab
2. Enter Master Code to unlock security settings
3. Update PIN and/or Master Code
4. Click **"UPDATE SECURITY PINs"**
5. New codes take effect immediately

### Data Security
- All data encrypted in transit (HTTPS)
- Firestore security rules prevent unauthorized access
- Anonymous authentication ensures user privacy
- No personal user data collected
- Cloud Firestore database with real-time sync

### Best Practices
- **Change default PINs immediately** using Security Settings
- Review Firestore security rules regularly
- Keep Master Code secure and separate from PIN
- Enable App Check for production (optional)
- Monitor Firebase usage in console
- Backup important data regularly

---

## 📖 Usage Guide

### Unlocking the System
1. Open the app
2. Enter PIN: `9812`
3. Click "UNLOCK SYSTEM"

### Creating a Transaction

1. Click **"REGISTER NEW BUY-BACK"**
2. Select item type: Gold / Diamond / Watch
3. Tap camera icon to capture customer ID
4. Fill in customer information:
   - Full Name
   - ID/License Number
   - Phone Number
5. Enter item details (varies by type):
   - **Gold:** Description, Weight (g), Karat
   - **Diamond:** Description, Carat, Clarity/Color/Cut
   - **Watch:** Description, Brand, Model, Serial Number
6. Enter price and payment method
7. Customer signs on canvas
8. Click **"SAVE & PRINT"**

### Viewing History
- Click **"History"** to see all transactions
- Use search bar to find specific transactions
- Click **"Reprint"** to print receipts again

### Generating Reports
1. Click **"Reports"**
2. Select date range or use presets (Monthly/Yearly/All Time)
3. Click **"PRINT / SAVE PDF"**
4. Use browser's print dialog to save as PDF

### Managing Store Locations
1. Go to **Settings** → **General Info** tab
2. View existing store locations
3. Edit store names and addresses
4. Click **"Add New Store"** to add more locations
5. Remove stores using trash icon
6. Click **"SAVE CHANGES"**

### Changing Security Settings
1. Go to **Settings** → **Security PINs** tab
2. Enter current Master Code (`159753` by default)
3. Click **"UNLOCK SECURITY SETTINGS"**
4. Update PIN (4+ digits) and/or Master Code (6+ digits)
5. Click **"UPDATE SECURITY PINs"**

### Locking the System
- Click the lock icon in header
- System returns to PIN entry screen
- All data is automatically saved to cloud

---

## 📁 Project Structure

```
goldbuyback/
├── public/                  # Static files
├── src/
│   ├── components/
│   │   └── ui/
│   │       └── card.jsx    # UI Card components
│   ├── App.js              # Main application component
│   ├── firebaseConfig.js   # Firebase credentials
│   ├── index.js            # React entry point
│   └── index.css           # Global styles (Tailwind)
├── build/                   # Production build (generated)
├── firebase.json            # Firebase Hosting config
├── .firebaserc             # Firebase project mapping
├── firestore.rules         # Firestore security rules
├── tailwind.config.js      # Tailwind CSS configuration
├── package.json            # Dependencies
└── README.md               # This file
```

---

## 🐛 Troubleshooting

### Common Issues

#### "Invalid document reference" Error
**Cause:** Firestore paths must have even/odd segment counts correctly
**Solution:** App now uses correct path structure: `apps/{appId}/...`
- Settings: `apps/default-app-id/data/settings` (4 segments - document)
- Purchases: `apps/default-app-id/purchases` (3 segments - collection)

#### "Permission Denied" Error
**Solution:** Deploy Firestore security rules
```bash
firebase deploy --only firestore:rules
```
- Ensure Anonymous Authentication is enabled in Firebase Console
- Check that Firestore database is created
- See: `FIRESTORE_RULES_FIX.md`

#### "toFixed is not a function" Error
**Cause:** Numeric values stored as strings
**Solution:** Fixed - app now uses `parseFloat()` for all calculations

#### Firebase Not Connected
**Solution:** 
- Check `src/firebaseConfig.js` has correct credentials
- Verify Firebase project is active
- Enable Anonymous Authentication
- Create Firestore database
- Deploy security rules

#### Search Not Working
**Solution:** Ensure data is loaded and Firebase is connected
- Check browser console for errors
- Verify internet connection

#### App Not Loading on Phone
**Solution:** 
- Clear browser cache
- Hard refresh (pull down on mobile Chrome)
- Check internet connection
- Verify Firebase services are enabled
- Try incognito/private mode

#### Can't Login After Deployment
**Solution:** 
- Check that Anonymous Authentication is enabled in Firebase Console
- Verify Firestore security rules are deployed
- Clear browser cache and retry

### Debug Tools

**Browser Console Logs:**
```
✅ Loaded X transactions from Firestore - Data loading successfully
❌ Firestore data error: permission-denied - Security rules need setup
❌ Auth error: configuration-not-found - Anonymous auth not enabled
```

**System Status Dashboard:**
- Go to Settings → See connection status for all Firebase services

For more help, see: `TROUBLESHOOTING.md`

---

## 📚 Additional Documentation

- **`FIREBASE_SETUP_STEPS.md`** - Detailed Firebase configuration guide
- **`DEPLOYMENT_GUIDE.md`** - Complete deployment instructions
- **`DEPLOY_NOW.md`** - Quick deployment commands
- **`PHONE_ERROR_FIX.md`** - Mobile error solutions
- **`QUICK_START.md`** - 3-minute setup guide
- **`SETUP.md`** - Original setup documentation

---

## 💰 Cost & Limitations

### Firebase Free Tier (Spark Plan)
- ✅ **Firestore:** 50K reads, 20K writes per day
- ✅ **Hosting:** 10 GB storage, 360 MB/day transfer
- ✅ **Authentication:** Unlimited anonymous users
- ✅ **No credit card required**

**Perfect for small to medium businesses!**

---

## 🤝 Support

### Need Help?

1. Check the documentation files listed above
2. Review Firebase Console for service status
3. Check browser console for error messages
4. Verify System Status in Settings page


---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🎯 Roadmap

### ✅ Completed Features
- [x] Multi-store support with location selection
- [x] Security PIN management in Settings
- [x] Date range reports with presets
- [x] Real-time analytics dashboard
- [x] Digital signature capture
- [x] Mobile-responsive design

### 🔮 Potential Future Features
- [ ] Multi-language support (Spanish/English toggle)
- [ ] Email receipt delivery
- [ ] Barcode/QR code scanning
- [ ] Advanced analytics with charts
- [ ] Export to Excel/CSV
- [ ] SMS notifications
- [ ] Role-based access control (multi-user)
- [ ] Customer database with history
- [ ] Automated backup scheduling
- [ ] Dark/Light theme toggle

---

## 🙏 Acknowledgments

- Built with [Create React App](https://create-react-app.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
- Hosted on [Firebase](https://firebase.google.com/)

---

## 📝 Recent Updates (November 13, 2025)

### Latest Changes
- ✅ Fixed Firebase configuration imports
- ✅ Corrected Firestore path structure (apps/{appId}/...)
- ✅ Fixed analytics calculations with parseFloat()
- ✅ Deployed security rules to Firebase
- ✅ Updated all database references
- ✅ Improved error handling and validation
- ✅ Enhanced multi-store location support

### Database Structure
```
Firestore Database:
  └── apps/
      └── default-app-id/
          ├── data/
          │   └── settings (document)
          │       ├── storeName
          │       ├── phone
          │       ├── terms
          │       ├── stores[]
          │       ├── pin
          │       └── masterCode
          └── purchases/ (collection)
              └── [transaction-id] (documents)
                  ├── customerName
                  ├── itemType
                  ├── price
                  ├── date
                  └── ...
```

---

**Made with ❤️ for KB Gold Jewelry**

Version: 1.0.0 | Last Updated: November 13, 2025
