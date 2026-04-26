// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Visitor Pages
import VisitorDashboard from "./pages/visitor/Dashboard";
import Booking from "./pages/visitor/Booking";
import Tickets from "./pages/visitor/Tickets";
import Children from "./pages/visitor/Children";
import Zones from "./pages/visitor/Zones";
import AIRecommendations from "./pages/visitor/AIRecommendations";
import ParkMap from "./pages/visitor/ParkMap";
import Events from "./pages/visitor/Events";
import Rewards from "./pages/visitor/Rewards";
import Food from "./pages/visitor/Food";
import Support from "./pages/visitor/Support";
import Jobs from "./pages/visitor/Jobs";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminZones from "./pages/admin/AdminZones";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminVendors from "./pages/admin/AdminVendors";
import AdminLostFound from "./pages/admin/AdminLostFound";

// Staff Pages
import StaffDashboard from "./pages/staff/StaffDashboard";
import CheckIn from "./pages/staff/CheckIn";

// Vendor Pages
import VendorDashboard from "./pages/vendor/VendorDashboard";
import MenuManager from "./pages/vendor/MenuManager";
import Orders from "./pages/vendor/Orders";

// Protected Route component
function ProtectedRoute({ children, roles }) {
  const { currentUser, userProfile } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (roles && userProfile && !roles.includes(userProfile.role)) {
    return <Navigate to={`/${userProfile.role}`} replace />;
  }
  return children;
}

// Role-based redirect after login
function RoleRedirect() {
  const { userProfile } = useAuth();
  if (!userProfile) return <Navigate to="/login" replace />;
  const routes = { visitor: "/visitor", admin: "/admin", staff: "/staff", vendor: "/vendor" };
  return <Navigate to={routes[userProfile.role] || "/visitor"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* Visitor Routes */}
          <Route path="/visitor" element={<ProtectedRoute roles={["visitor"]}><Layout /></ProtectedRoute>}>
            <Route index element={<VisitorDashboard />} />
            <Route path="booking" element={<Booking />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="children" element={<Children />} />
            <Route path="zones" element={<Zones />} />
            <Route path="ai" element={<AIRecommendations />} />
            <Route path="map" element={<ParkMap />} />
            <Route path="events" element={<Events />} />
            <Route path="rewards" element={<Rewards />} />
            <Route path="food" element={<Food />} />
            <Route path="support" element={<Support />} />
            <Route path="jobs" element={<Jobs />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><Layout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="zones" element={<AdminZones />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="vendors" element={<AdminVendors />} />
            <Route path="lost-found" element={<AdminLostFound />} />
          </Route>

          {/* Staff Routes */}
          <Route path="/staff" element={<ProtectedRoute roles={["staff"]}><Layout /></ProtectedRoute>}>
            <Route index element={<StaffDashboard />} />
            <Route path="checkin" element={<CheckIn />} />
            <Route path="zones" element={<AdminZones />} />
            <Route path="lost-found" element={<AdminLostFound />} />
          </Route>

          {/* Vendor Routes */}
          <Route path="/vendor" element={<ProtectedRoute roles={["vendor"]}><Layout /></ProtectedRoute>}>
            <Route index element={<VendorDashboard />} />
            <Route path="menu" element={<MenuManager />} />
            <Route path="orders" element={<Orders />} />
            <Route path="jobs" element={<Jobs />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
