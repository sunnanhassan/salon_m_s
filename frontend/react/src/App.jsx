import LandingPage from "./pages/LandingPage";
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SalonList from "./pages/SalonList";
import SalonDetail from "./pages/SalonDetail";
import BookingForm from "./pages/BookingForm";
import MyBookings from "./pages/MyBookings";
import PrivateRoute from "./components/PrivateRoute";
import RequireRole from "./components/RequireRole";

// Owner pages
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerSalonForm from "./pages/owner/OwnerSalonForm";
import OwnerServices from "./pages/owner/OwnerServices";
import OwnerBookings from "./pages/owner/OwnerBookings";
import OwnerEarnings from "./pages/owner/OwnerEarnings"; // ⬅️ add this import

import { useSelector } from "react-redux";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Salon browsing */}
        <Route path="/salons" element={<SalonList />} />
        <Route path="/salons/:id" element={<SalonDetail />} />

        {/* Booking */}
        <Route
          path="/book/:salonId/:serviceId"
          element={
            <PrivateRoute>
              <BookingForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <PrivateRoute>
              <MyBookings />
            </PrivateRoute>
          }
        />

        {/* Owner routes */}
        <Route
          path="/owner"
          element={
            <RequireRole role="salon_owner">
              <OwnerDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/owner/salons/new"
          element={
            <RequireRole role="salon_owner">
              <OwnerSalonForm />
            </RequireRole>
          }
        />
        <Route
          path="/owner/salons/:id/edit"
          element={
            <RequireRole role="salon_owner">
              <OwnerSalonForm />
            </RequireRole>
          }
        />
        <Route
          path="/owner/salons/:id/services"
          element={
            <RequireRole role="salon_owner">
              <OwnerServices />
            </RequireRole>
          }
        />
        <Route
          path="/owner/bookings"
          element={
            <RequireRole role="salon_owner">
              <OwnerBookings />
            </RequireRole>
          }
        />
        <Route
          path="/owner/earnings" // ⬅️ new route
          element={
            <RequireRole role="salon_owner">
              <OwnerEarnings />
            </RequireRole>
          }
        />
      </Routes>
    </>
  );
}
