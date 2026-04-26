# 🎠 PlaySphere Nexus
### Smart Indoor Playground Management System
**CSC490 – Software Engineering | Phase IV**

---

## 📋 Project Overview

PlaySphere Nexus is a full-stack web application for managing indoor playground operations. It includes a real Firebase backend (authentication, real-time database) and a React frontend with 4 user roles.

**Tech Stack:**
- **Frontend:** React.js (with React Router)
- **Backend:** Firebase (Firestore, Authentication, Cloud Functions)
- **QR Codes:** qrcode.react
- **Deployment:** Firebase Hosting

---

## 👥 Team Members

| Name | Role | Modules |
|------|------|---------|
| Hamza Dayekh | Developer | Authentication, Bookings, Testing |
| Chawki Ghandour | Developer | QR Check-in, AI Recommendations, Lost & Found |
| Mohamad Hazimeh | Developer | Vendor System, Food Orders, Job Listings |
| Amira Hallal | Developer | Admin Dashboard, Events, VIP System, Park Map |
| Hanadi Ghzayel | QA & Docs | Non-Functional Testing, Documentation |

---

## 🚀 Setup Instructions

### Step 1 – Clone the Repository
```bash
git clone https://github.com/YOUR-USERNAME/playsphere-nexus.git
cd playsphere-nexus
```

### Step 2 – Install Dependencies
```bash
npm install
```

### Step 3 – Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add Project"** → Name it `playsphere-nexus`
3. Disable Google Analytics (optional) → **Create Project**

### Step 4 – Enable Firebase Services

In your Firebase Console:

**Authentication:**
- Go to **Build → Authentication → Get Started**
- Enable **Email/Password** provider
- Enable **Google** provider

**Firestore Database:**
- Go to **Build → Firestore Database → Create Database**
- Choose **Production Mode** (we have our own rules)
- Select a region (e.g., `us-central`)

### Step 5 – Get Your Firebase Config

1. In Firebase Console → **Project Settings** (gear icon)
2. Scroll to **"Your apps"** → Click **"Add app"** → Choose **Web (</>)**
3. Register app name: `playsphere-nexus-web`
4. Copy the `firebaseConfig` object

### Step 6 – Add Config to the Project

Open `src/services/firebase.js` and replace the placeholder config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 7 – Deploy Firestore Security Rules

Install Firebase CLI if not installed:
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
```

Then deploy rules:
```bash
firebase deploy --only firestore:rules
```

### Step 8 – Create Demo Users in Firebase

In Firebase Console → **Authentication → Users → Add User:**

| Email | Password | Then in Firestore manually set role |
|-------|----------|--------------------------------------|
| visitor@playsphere.com | demo123456 | role: "visitor" |
| admin@playsphere.com | demo123456 | role: "admin" |
| staff@playsphere.com | demo123456 | role: "staff" |
| vendor@playsphere.com | demo123456 | role: "vendor" |

**OR** use the app's Register page and set roles in Firestore.

### Step 9 – Seed the Database (Demo Data)

After logging in as admin, open browser console and run:
```javascript
import { seedDatabase } from './src/services/firebase';
seedDatabase();
```

Or uncomment the seed button in `src/pages/admin/AdminDashboard.jsx`.

### Step 10 – Run the App
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy to Firebase Hosting

```bash
npm run build
firebase init hosting
# Public directory: build
# Single-page app: Yes
firebase deploy
```

Your app will be live at: `https://YOUR_PROJECT_ID.web.app`

---

## 📱 Features by Role

### 👤 Visitor
- Register / Login (Email or Google)
- Book playground sessions with time slots
- QR code ticket generation
- Child profile management
- Real-time zone occupancy
- AI activity recommendations
- Park map navigation
- Event reservations (Public + VIP)
- Loyalty points & rewards
- Food ordering
- IT support & Lost item reporting
- Job listings

### ⚙️ Admin
- Full analytics dashboard
- Booking management
- Zone status control
- Event creation & management
- User management
- Vendor management
- Lost & Found management
- Report export

### 🎯 Staff
- Real-time check-in dashboard
- QR code scanning & validation
- Zone occupancy monitoring
- Incident reporting

### 🏪 Vendor
- Menu item management
- Order management
- Sales dashboard
- Job listing posting

---

## 📁 Project Structure

```
playsphere-nexus/
├── public/
│   └── index.html
├── src/
│   ├── services/
│   │   └── firebase.js          ← ALL backend logic
│   ├── contexts/
│   │   └── AuthContext.jsx      ← Auth state management
│   ├── components/
│   │   ├── Layout.jsx           ← Sidebar + header shell
│   │   ├── ProtectedRoute.jsx   ← Role-based route guard
│   │   └── Toast.jsx            ← Notifications
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── visitor/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── Tickets.jsx
│   │   │   ├── Children.jsx
│   │   │   ├── Zones.jsx
│   │   │   ├── AIRecommendations.jsx
│   │   │   ├── ParkMap.jsx
│   │   │   ├── Events.jsx
│   │   │   ├── Rewards.jsx
│   │   │   ├── Food.jsx
│   │   │   ├── Support.jsx
│   │   │   └── Jobs.jsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminBookings.jsx
│   │   │   ├── AdminZones.jsx
│   │   │   ├── AdminEvents.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   ├── AdminAnalytics.jsx
│   │   │   ├── AdminVendors.jsx
│   │   │   └── AdminLostFound.jsx
│   │   ├── staff/
│   │   │   ├── StaffDashboard.jsx
│   │   │   └── CheckIn.jsx
│   │   └── vendor/
│   │       ├── VendorDashboard.jsx
│   │       ├── MenuManager.jsx
│   │       └── Orders.jsx
│   ├── App.jsx                  ← Routes
│   ├── index.js
│   └── index.css
├── firestore.rules              ← Database security rules
├── .env.example                 ← Environment variable template
├── package.json
└── README.md
```

---

## 🔐 Environment Variables (Optional)

Create a `.env` file (do NOT commit this):
```
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender
REACT_APP_FIREBASE_APP_ID=your_app_id
```

---

## 📊 GitHub & OpenProject

- **GitHub Repo:** https://github.com/YOUR-USERNAME/playsphere-nexus
- **OpenProject:** [Your OpenProject URL]

---

## 📄 License

Submitted as academic work for CSC490 – Software Engineering, Phase IV.
