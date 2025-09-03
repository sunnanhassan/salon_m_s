// src/pages/owner/OwnerEarnings.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { listBookings } from "../../api/bookings"; // API to fetch bookings
import { listSalons } from "../../api/salons";

// Optional helper to format currency locally
function formatCurrency(amount) {
  return `$${Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function OwnerEarnings() {
  const auth = useSelector((s) => s.auth);
  const [salons, setSalons] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Get salons owned by this user
        const allSalons = await listSalons();
        const mine = allSalons.filter((s) => s.owner === auth.user.id);
        setSalons(mine);

        // Get bookings for these salons
        const allBookings = await listBookings();
        const myBookings = allBookings.filter((b) =>
          mine.some((s) => s.id === b.salon.id)
        );
        setBookings(myBookings);
      } catch (e) {
        setErr(e.message || "Failed to load earnings");
      } finally {
        setLoading(false);
      }
    })();
  }, [auth.user]);

  // === Earnings Calculations ===
  const earnings = useMemo(() => {
    let total = 0;
    let pending = 0;
    let cleared = 0;

    bookings.forEach((b) => {
      if (!b.payment) return;
      const amount = Number(b.payment.amount) || 0; // Coerce to number safely
      if (b.payment.status === "completed") {
        cleared += amount;
        total += amount;
      } else if (b.payment.status === "pending") {
        pending += amount;
        total += amount;
      }
    });

    return { total, pending, cleared };
  }, [bookings]);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        💰 Earnings Overview
      </h1>

      {loading && (
        <div className="text-center py-10 text-gray-500 animate-pulse">
          Loading earnings data...
        </div>
      )}

      {err && (
        <div className="text-center py-4 text-red-600 bg-red-100 rounded-xl mb-6">
          {err}
        </div>
      )}

      {!loading && (
        <>
          {/* Earnings Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
              <div className="text-gray-500 text-sm">Total Earnings</div>
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(earnings.total)}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
              <div className="text-gray-500 text-sm">Pending Earnings</div>
              <div className="text-3xl font-bold text-yellow-600">
                {formatCurrency(earnings.pending)}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
              <div className="text-gray-500 text-sm">Cleared Earnings</div>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(earnings.cleared)}
              </div>
            </div>
          </div>

          {/* Optional: Monthly Breakdown */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Monthly Earnings Breakdown
            </h2>
            <div className="text-gray-500 text-sm mb-2">
              *(Chart can be added here using Recharts or Chart.js)*
            </div>
          </div>
        </>
      )}
    </div>
  );
}
