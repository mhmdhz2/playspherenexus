// src/services/firebase.js — PlaySphere Nexus (Fixed — no composite index queries)

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBkcSvFXh2WavxohM0UQdYXnFG6wTbPKmU",
  authDomain: "playsphere-nexus.firebaseapp.com",
  projectId: "playsphere-nexus",
  storageBucket: "playsphere-nexus.firebasestorage.app",
  messagingSenderId: "95520310332",
  appId: "1:95520310332:web:8e1475d23bd968a8f9af39",
  measurementId: "G-WG071GR347"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// ─── AUTH ─────────────────────────────────────────────────

export const registerUser = async (email, password, name, role = "visitor", accountType = "personal") => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid, name, email, role, accountType,
    loyaltyPoints: 0, achievements: [], membershipPlan: "basic",
    createdAt: serverTimestamp(), isActive: true
  });
  return user;
};

export const loginUser = (email, password) => signInWithEmailAndPassword(auth, email, password);

export const loginWithGoogle = async (role = "visitor") => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid, name: user.displayName, email: user.email, role,
      accountType: "personal", loyaltyPoints: 0, achievements: [],
      membershipPlan: "basic", createdAt: serverTimestamp(), isActive: true
    });
  }
  return user;
};

export const logoutUser = () => signOut(auth);
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

export const getUserProfile = async (uid) => {
  const docSnap = await getDoc(doc(db, "users", uid));
  return docSnap.exists() ? docSnap.data() : null;
};

export const getAllUsers = async () => {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateUserRole = async (userId, role) => {
  await updateDoc(doc(db, "users", userId), { role });
};

// ─── BOOKINGS ─────────────────────────────────────────────

export const createBooking = async (bookingData) => {
  const docRef = await addDoc(collection(db, "bookings"), {
    ...bookingData,
    status: "confirmed",
    qrCode: `PSN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    createdAt: serverTimestamp()
  });
  await awardPoints(bookingData.userId, 10, "Session booking");
  return docRef.id;
};

// NO orderBy + where — sort client-side to avoid composite index errors
export const getUserBookings = async (userId) => {
  const q = query(collection(db, "bookings"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  return docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const getAllBookings = async () => {
  const snapshot = await getDocs(collection(db, "bookings"));
  const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  return docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const validateQR = async (qrCode) => {
  const q = query(collection(db, "bookings"), where("qrCode", "==", qrCode));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return { valid: false };
  const booking = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  if (booking.checkedIn) return { valid: false, reason: "Already used" };
  await updateDoc(doc(db, "bookings", booking.id), { checkedIn: true, checkInTime: serverTimestamp() });
  return { valid: true, booking };
};

// ─── PLAY ZONES ───────────────────────────────────────────

export const subscribeToZones = (callback) => {
  return onSnapshot(collection(db, "zones"), (snapshot) => {
    const zones = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(zones);
  });
};

export const getZones = async () => {
  const snapshot = await getDocs(collection(db, "zones"));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateZoneStatus = async (zoneId, status) => {
  await updateDoc(doc(db, "zones", zoneId), { status, updatedAt: serverTimestamp() });
};

export const updateZoneOccupancy = async (zoneId, currentOccupancy) => {
  await updateDoc(doc(db, "zones", zoneId), { currentOccupancy, updatedAt: serverTimestamp() });
};

// ─── CHILD PROFILES ───────────────────────────────────────

export const addChildProfile = async (userId, childData) => {
  return await addDoc(collection(db, `users/${userId}/children`), {
    ...childData, rfidActive: false, createdAt: serverTimestamp()
  });
};

export const getChildProfiles = async (userId) => {
  const snapshot = await getDocs(collection(db, `users/${userId}/children`));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const deleteChildProfile = async (userId, childId) => {
  await deleteDoc(doc(db, `users/${userId}/children`, childId));
};

// ─── LOYALTY & REWARDS ────────────────────────────────────

export const awardPoints = async (userId, points, reason) => {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) return;
  const current = userDoc.data().loyaltyPoints || 0;
  await updateDoc(userRef, { loyaltyPoints: current + points });
  await addDoc(collection(db, `users/${userId}/pointsHistory`), {
    points, reason, type: "earned", createdAt: serverTimestamp()
  });
};

export const redeemPoints = async (userId, points, reward) => {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);
  const current = userDoc.data().loyaltyPoints || 0;
  if (current < points) throw new Error("Insufficient points");
  await updateDoc(userRef, { loyaltyPoints: current - points });
  await addDoc(collection(db, `users/${userId}/pointsHistory`), {
    points: -points, reason: `Redeemed: ${reward}`, type: "redeemed", createdAt: serverTimestamp()
  });
};

export const getPointsHistory = async (userId) => {
  const snapshot = await getDocs(collection(db, `users/${userId}/pointsHistory`));
  const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  return docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

// ─── EVENTS ───────────────────────────────────────────────

export const getEvents = async () => {
  const snapshot = await getDocs(collection(db, "events"));
  const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  return docs.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
};

export const createEvent = async (eventData) => {
  return await addDoc(collection(db, "events"), {
    ...eventData, seatsBooked: 0, createdAt: serverTimestamp()
  });
};

export const updateEvent = async (eventId, data) => {
  await updateDoc(doc(db, "events", eventId), { ...data, updatedAt: serverTimestamp() });
};

export const deleteEvent = async (eventId) => {
  await deleteDoc(doc(db, "events", eventId));
};

export const reserveEventSeat = async (eventId, userId, userName) => {
  const eventRef = doc(db, "events", eventId);
  const eventDoc = await getDoc(eventRef);
  if (!eventDoc.exists()) throw new Error("Event not found");
  const event = eventDoc.data();
  if ((event.seatsBooked || 0) >= event.capacity) throw new Error("Event is full");
  if (event.isVIP) {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.data().membershipPlan !== "premium") throw new Error("VIP membership required");
  }
  await updateDoc(eventRef, { seatsBooked: (event.seatsBooked || 0) + 1 });
  await addDoc(collection(db, "eventReservations"), {
    eventId, userId, userName, createdAt: serverTimestamp()
  });
};

// ─── FOOD & VENDOR ────────────────────────────────────────

export const getVendors = async () => {
  const snapshot = await getDocs(collection(db, "vendors"));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getMenuItems = async (vendorId) => {
  const snapshot = await getDocs(collection(db, `vendors/${vendorId}/menu`));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addMenuItem = async (vendorId, itemData) => {
  return await addDoc(collection(db, `vendors/${vendorId}/menu`), {
    ...itemData, available: true, createdAt: serverTimestamp()
  });
};

export const updateMenuItem = async (vendorId, itemId, data) => {
  await updateDoc(doc(db, `vendors/${vendorId}/menu`, itemId), data);
};

export const deleteMenuItem = async (vendorId, itemId) => {
  await deleteDoc(doc(db, `vendors/${vendorId}/menu`, itemId));
};

export const createOrder = async (orderData) => {
  const orderRef = await addDoc(collection(db, "orders"), {
    ...orderData, status: "preparing", createdAt: serverTimestamp()
  });
  const pts = Math.floor(orderData.total);
  await awardPoints(orderData.userId, pts, `Food purchase ($${orderData.total})`);
  return orderRef.id;
};

export const getOrders = async (vendorId) => {
  const q = query(collection(db, "orders"), where("vendorId", "==", vendorId));
  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  return docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const getUserOrders = async (userId) => {
  const q = query(collection(db, "orders"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  return docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const updateOrderStatus = async (orderId, status) => {
  await updateDoc(doc(db, "orders", orderId), { status, updatedAt: serverTimestamp() });
};

// ─── LOST & FOUND ─────────────────────────────────────────

export const submitLostItem = async (data) => {
  return await addDoc(collection(db, "lostFound"), {
    ...data, status: "searching", createdAt: serverTimestamp()
  });
};

export const getLostItems = async () => {
  const snapshot = await getDocs(collection(db, "lostFound"));
  const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  return docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const updateLostItemStatus = async (itemId, status) => {
  await updateDoc(doc(db, "lostFound", itemId), { status, updatedAt: serverTimestamp() });
};

// ─── SUPPORT TICKETS ──────────────────────────────────────

export const submitSupportTicket = async (data) => {
  return await addDoc(collection(db, "supportTickets"), {
    ...data, status: "open", createdAt: serverTimestamp()
  });
};

export const getSupportTickets = async (userId = null) => {
  let docs;
  if (userId) {
    const q = query(collection(db, "supportTickets"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } else {
    const snapshot = await getDocs(collection(db, "supportTickets"));
    docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  return docs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const updateTicketStatus = async (ticketId, status) => {
  await updateDoc(doc(db, "supportTickets", ticketId), { status, updatedAt: serverTimestamp() });
};

// ─── JOB LISTINGS ─────────────────────────────────────────

export const getJobListings = async () => {
  const snapshot = await getDocs(collection(db, "jobs"));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const applyToJob = async (jobId, applicantData) => {
  return await addDoc(collection(db, `jobs/${jobId}/applications`), {
    ...applicantData, status: "pending_review", createdAt: serverTimestamp()
  });
};

// ─── ANALYTICS ────────────────────────────────────────────

export const getAnalyticsSummary = async () => {
  const [bookings, users, orders] = await Promise.all([
    getDocs(collection(db, "bookings")),
    getDocs(collection(db, "users")),
    getDocs(collection(db, "orders"))
  ]);
  const totalRevenue =
    bookings.docs.reduce((sum, d) => sum + (d.data().totalPrice || 0), 0) +
    orders.docs.reduce((sum, d) => sum + (d.data().total || 0), 0);
  return {
    totalBookings: bookings.size,
    totalUsers: users.size,
    totalOrders: orders.size,
    totalRevenue
  };
};

// ─── DATABASE SEEDING ─────────────────────────────────────

export const seedDatabase = async () => {
  const zones = [
    { name: "Trampoline Zone A", emoji: "🤸", capacity: 25, currentOccupancy: 18, minAge: 5, maxAge: 14, minHeight: 110, pricePerHour: 18, status: "active",      waitTime: 5  },
    { name: "Climbing Wall B",   emoji: "🧗", capacity: 20, currentOccupancy: 9,  minAge: 7, maxAge: 16, minHeight: 130, pricePerHour: 22, status: "active",      waitTime: 0  },
    { name: "Ball Pit Zone",     emoji: "⚽", capacity: 24, currentOccupancy: 22, minAge: 2, maxAge: 8,  minHeight: 80,  pricePerHour: 15, status: "active",      waitTime: 15 },
    { name: "Foam Pit Arena",    emoji: "🌊", capacity: 20, currentOccupancy: 8,  minAge: 4, maxAge: 12, minHeight: 100, pricePerHour: 20, status: "active",      waitTime: 0  },
    { name: "Interactive Games", emoji: "🎮", capacity: 30, currentOccupancy: 12, minAge: 5, maxAge: 15, minHeight: 90,  pricePerHour: 18, status: "active",      waitTime: 0  },
    { name: "Carousel Zone",     emoji: "🎠", capacity: 15, currentOccupancy: 0,  minAge: 2, maxAge: 10, minHeight: 80,  pricePerHour: 12, status: "maintenance", waitTime: 0  }
  ];
  for (const zone of zones) await addDoc(collection(db, "zones"), { ...zone, createdAt: serverTimestamp() });

  const events = [
    { title: "Kids Birthday Bash",  emoji: "🎂", location: "Trampoline Zone A", date: "2026-05-16", time: "15:00", endTime: "18:00", capacity: 30,  seatsBooked: 22, price: 35,  isVIP: false, status: "upcoming" },
    { title: "Summer Splash Party", emoji: "🌊", location: "All Zones",         date: "2026-05-20", time: "10:00", endTime: "17:00", capacity: 100, seatsBooked: 58, price: 25,  isVIP: false, status: "upcoming" },
    { title: "VIP Exclusive Night", emoji: "👑", location: "Full Park",         date: "2026-05-25", time: "19:00", endTime: "23:00", capacity: 50,  seatsBooked: 38, price: 150, isVIP: true,  status: "upcoming" }
  ];
  for (const event of events) await addDoc(collection(db, "events"), { ...event, createdAt: serverTimestamp() });

  const vendors = [
    { name: "In N Out",     emoji: "🍔", location: "Food Court Zone A",  rating: 4.7, isOpen: true },
    { name: "Slice Palace", emoji: "🍕", location: "Food Court Zone B",  rating: 4.5, isOpen: true },
    { name: "Café Nexus",   emoji: "☕", location: "Near Main Entrance", rating: 4.8, isOpen: true }
  ];
  const menus = {
    "In N Out":     [
      { name: "Classic Burger",   category: "Main",  price: 8,  containsAlcohol: false },
      { name: "Double Burger",    category: "Main",  price: 11, containsAlcohol: false },
      { name: "Fries",            category: "Side",  price: 4,  containsAlcohol: false },
      { name: "Cola",             category: "Drink", price: 3,  containsAlcohol: false },
      { name: "Beer",             category: "Drink", price: 6,  containsAlcohol: true  }
    ],
    "Slice Palace": [
      { name: "Margherita Slice", category: "Main",  price: 5,  containsAlcohol: false },
      { name: "Pepperoni Slice",  category: "Main",  price: 6,  containsAlcohol: false },
      { name: "Garlic Bread",     category: "Side",  price: 3,  containsAlcohol: false },
      { name: "Juice Box",        category: "Drink", price: 2,  containsAlcohol: false }
    ],
    "Café Nexus":   [
      { name: "Cappuccino",       category: "Drink", price: 4,  containsAlcohol: false },
      { name: "Latte",            category: "Drink", price: 4,  containsAlcohol: false },
      { name: "Kids Hot Choc",    category: "Drink", price: 3,  containsAlcohol: false },
      { name: "Croissant",        category: "Food",  price: 3,  containsAlcohol: false }
    ]
  };
  for (const vendor of vendors) {
    const vRef = await addDoc(collection(db, "vendors"), { ...vendor, createdAt: serverTimestamp() });
    for (const item of (menus[vendor.name] || [])) {
      await addDoc(collection(db, `vendors/${vRef.id}/menu`), { ...item, available: true, createdAt: serverTimestamp() });
    }
  }

  const jobs = [
    { title: "Cashier",             company: "In N Out",          location: "Food Court", requirements: "High school education",          description: "Handles purchase transactions with customers throughout the day.", type: "Part-time", salary: "$12/hr", status: "open" },
    { title: "Activity Supervisor", company: "PlaySphere Nexus",  location: "Play Zones", requirements: "Safety certification preferred", description: "Supervise activities, ensure child safety and capacity compliance.", type: "Full-time", salary: "$16/hr", status: "open" },
    { title: "Event Assistant",     company: "PlaySphere Events", location: "All Zones",  requirements: "No experience needed",           description: "Help organize and run birthday parties and special events.",      type: "Weekends", salary: "$14/hr", status: "open" }
  ];
  for (const job of jobs) await addDoc(collection(db, "jobs"), { ...job, createdAt: serverTimestamp() });

  console.log("✅ Database seeded successfully!");
};
