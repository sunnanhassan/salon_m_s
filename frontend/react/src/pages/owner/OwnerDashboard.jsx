// src/pages/owner/OwnerDashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { listSalons } from "../../api/salons";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { listBookings } from "../../api/bookings"; // assuming you have this API

export default function OwnerDashboard() {
  const [salons, setSalons] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const auth = useSelector((s) => s.auth);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Load salons
        const allSalons = await listSalons();
        const mine = allSalons.filter((s) => s.owner === auth.user.id);
        setSalons(mine);

        // Load bookings
        const allBookings = await listBookings();
        const myBookings = allBookings.filter((b) =>
          mine.some((s) => s.id === b.salon.id)
        );
        setBookings(myBookings);
      } catch (e) {
        setErr(e.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, [auth.user]);

  // === Booking stats ===
  const stats = useMemo(() => {
    const total = bookings.length;
    const upcoming = bookings.filter(
      (b) => new Date(b.start_time) > new Date() && b.status !== "cancelled"
    ).length;
    const completed = bookings.filter((b) => b.status === "confirmed").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;

    return { total, upcoming, completed, cancelled };
  }, [bookings]);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        👋 Welcome, {auth.user?.username}
      </h1>

      {loading && (
        <div className="text-center py-10 text-gray-500 animate-pulse">
          Loading your data...
        </div>
      )}

      {err && (
        <div className="text-center py-4 text-red-600 bg-red-100 rounded-xl mb-6">
          {err}
        </div>
      )}

      {/* === Dashboard Stats === */}
      {!loading && salons.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
            <div className="text-gray-500 text-sm">Total Bookings</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.total}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
            <div className="text-gray-500 text-sm">Upcoming Bookings</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.upcoming}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
            <div className="text-gray-500 text-sm">Completed Bookings</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.completed}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
            <div className="text-gray-500 text-sm">Cancelled Bookings</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.cancelled}
            </div>
          </div>
        </div>
      )}

      {/* === Salons List === */}
      {!loading && salons.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-gray-600 text-lg">
            You don’t have any salons yet.
          </p>
          <Link
            to="/owner/salons/new"
            className="mt-4 inline-block bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-lg font-medium shadow"
          >
            + Create Salon
          </Link>
        </div>
      )}

      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {salons.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="font-semibold text-xl text-gray-900">
                {s.name}
              </div>
              <div className="text-gray-500 text-sm">{s.address}</div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to={`/owner/salons/${s.id}/services`}
                className="bg-sky-50 text-sky-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-100 transition"
              >
                Services
              </Link>
              <Link
                to={`/owner/bookings?salon=${s.id}`}
                className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition"
              >
                Bookings
              </Link>
              <Link
                to={`/owner/salons/${s.id}/edit`}
                className="bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>

      {salons.length > 0 && (
        <div className="mt-8 text-center">
          <Link
            to="/owner/salons/new"
            className="inline-block bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-lg font-medium shadow"
          >
            + Add Another Salon
          </Link>
        </div>
      )}
    </div>
  );
}
