import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBookings,
  cancelBookingAction,
  confirmBookingAction,
  updatePaymentStatus,
} from "../../store/bookingsSlice";
import { toast } from "react-toastify";
import { Button } from "../../components/ui/button";
// import Button from "../../components/ui/Button";

export default function OwnerBookings() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.bookings);
  const { user } = useSelector((s) => s.auth);
  const [confirmModal, setConfirmModal] = useState(null);

  // Filters & Sorting
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [salonFilter, setSalonFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  // === Actions ===
  const handleCancel = async (id) => {
    try {
      await dispatch(cancelBookingAction(id));
      toast.success("Booking cancelled successfully ❌");
    } catch (e) {
      toast.error(e.message || "Cancel failed");
    }
  };

  const handleConfirm = async (id) => {
    try {
      await dispatch(confirmBookingAction(id));
      toast.success("Booking confirmed ✅");
      setConfirmModal(null);
    } catch (e) {
      toast.error(e.message || "Confirm failed");
    }
  };

  const handlePaymentChange = async (paymentId, status) => {
    try {
      await dispatch(updatePaymentStatus(paymentId, status));
      if (status === "completed") toast.success("Payment completed ✅");
      else if (status === "failed") toast.error("Payment failed ❌");
      else toast.info("Payment marked as pending ⏳");
    } catch (e) {
      toast.error(e.message || "Failed to update payment");
    }
  };

  // === Unique salons for filter dropdown ===
  const ownerSalons = useMemo(() => {
    const map = {};
    items.forEach((b) => {
      if (b.salon?.id) map[b.salon.id] = b.salon.name;
    });
    return Object.entries(map).map(([id, name]) => ({ id, name }));
  }, [items]);

  // === Filtering & Sorting ===
  const filteredBookings = useMemo(() => {
    return items
      .filter((b) => {
        const query = search.toLowerCase();
        if (
          query &&
          !(
            b.id.toString().includes(query) ||
            b.customer.username.toLowerCase().includes(query) ||
            b.service.name.toLowerCase().includes(query) ||
            (b.salon?.owner?.username || b.salon?.owner_name || "")
              .toLowerCase()
              .includes(query)
          )
        )
          return false;

        if (statusFilter !== "all" && b.status !== statusFilter) return false;
        if (
          paymentFilter !== "all" &&
          (!b.payment || b.payment.status !== paymentFilter)
        )
          return false;
        if (salonFilter !== "all" && b.salon?.id.toString() !== salonFilter)
          return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest")
          return new Date(b.start_time) - new Date(a.start_time);
        if (sortBy === "oldest")
          return new Date(a.start_time) - new Date(b.start_time);
        return 0;
      });
  }, [items, search, statusFilter, paymentFilter, sortBy, salonFilter]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setSortBy("newest");
    setSalonFilter("all");
  };

  // === Earnings Summary ===
  const earnings = useMemo(() => {
    let total = 0,
      pending = 0,
      cleared = 0;
    filteredBookings.forEach((b) => {
      if (!b.payment || b.status === "cancelled") return;
      const amount = Number(b.payment.amount) || 0;
      total += amount;
      if (b.payment.status === "completed") cleared += amount;
      else if (b.payment.status === "pending") pending += amount;
    });
    return { total, pending, cleared };
  }, [filteredBookings]);

  const formatCurrency = (amount) =>
    `$${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // === Service-wise Earnings ===
  const serviceEarnings = useMemo(() => {
    const map = {};
    filteredBookings.forEach((b) => {
      if (!b.payment || b.status === "cancelled") return;
      const amount = Number(b.payment.amount) || 0;
      const name = b.service.name;
      if (!map[name]) map[name] = 0;
      map[name] += amount;
    });
    return Object.entries(map).map(([service, total]) => ({
      service,
      total,
    }));
  }, [filteredBookings]);

  // === Badge helpers ===
  const renderStatusBadge = (status) => {
    const colors = {
      confirmed: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      cancelled: "bg-red-100 text-red-700",
    };
    const labels = {
      confirmed: "Booking Confirmed",
      pending: "Booking Pending",
      cancelled: "Booking Cancelled",
    };
    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${colors[status]}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const renderPaymentBadge = (payment) => {
    if (!payment) return null;
    const colors = {
      completed: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      failed: "bg-red-100 text-red-700",
    };
    const labels = {
      completed: "Payment Completed",
      pending: "Payment Pending",
      failed: "Payment Failed",
    };
    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${
          colors[payment.status]
        }`}
      >
        {payment.method.toUpperCase()} • {labels[payment.status]}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        📋 Salon Bookings ({user?.username || "Owner"})
      </h1>

      {/* === Earnings Cards === */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow p-4 text-center">
          <div className="text-gray-500 text-sm">Total Earnings</div>
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(earnings.total)}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-4 text-center">
          <div className="text-gray-500 text-sm">Pending</div>
          <div className="text-xl font-bold text-yellow-600">
            {formatCurrency(earnings.pending)}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-4 text-center">
          <div className="text-gray-500 text-sm">Cleared</div>
          <div className="text-xl font-bold text-green-600">
            {formatCurrency(earnings.cleared)}
          </div>
        </div>
      </div>

      {/* === Service-wise Earnings === */}
      {serviceEarnings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {serviceEarnings.map((s) => (
            <div
              key={s.service}
              className="bg-white rounded-2xl shadow p-4 text-center border-t-4 border-indigo-500"
            >
              <div className="text-gray-500 text-sm">Service: {s.service}</div>
              <div className="text-xl font-bold text-gray-900 mt-1">
                {formatCurrency(s.total)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === Controls === */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="🔍 Search by ID, customer, service, or owner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Payments</option>
          <option value="pending">Payment Pending</option>
          <option value="completed">Payment Completed</option>
          <option value="failed">Payment Failed</option>
        </select>
        <select
          value={salonFilter}
          onChange={(e) => setSalonFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Salons</option>
          {ownerSalons.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
        <Button
          className="bg-gray-200 hover:bg-gray-300 text-slate-800 text-sm rounded-xl px-4 py-2"
          onClick={clearFilters}
        >
          🧹 Clear Filters
        </Button>
      </div>

      {loading && (
        <div className="text-slate-600 text-center">Loading bookings...</div>
      )}
      {!loading && filteredBookings.length === 0 && (
        <div className="text-slate-500 text-center py-8">
          No bookings found 🚫
        </div>
      )}

      <div className="space-y-6">
        {filteredBookings.map((b) => (
          <div
            key={b.id}
            className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 flex justify-between items-start hover:shadow-lg transition"
          >
            <div className="space-y-2">
              <div className="font-semibold text-lg text-slate-900">
                #{b.id} • {b.service.name} •{" "}
                <span className="text-indigo-600 font-bold">
                  {formatCurrency(b.payment?.amount || 0)}
                </span>
              </div>
              <div className="text-sm text-slate-600">
                👤 {b.customer.username}
              </div>
              <div className="text-sm text-slate-600">🏢 {b.salon.name}</div>

              <div className="text-sm text-slate-600">
                ⏰ {new Date(b.start_time).toLocaleString()} →{" "}
                {new Date(b.end_time).toLocaleString()}
              </div>

              <div className="flex gap-3 items-center pt-2">
                {renderStatusBadge(b.status)}
                {b.status !== "cancelled" &&
                  b.payment &&
                  renderPaymentBadge(b.payment)}
              </div>
            </div>

            <div className="flex flex-col gap-3 items-end">
              {b.status === "pending" && (
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white text-sm rounded-xl px-4 py-2"
                  onClick={() => setConfirmModal(b.id)}
                >
                  ✅ Confirm
                </Button>
              )}

              {b.status !== "cancelled" && (
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white text-sm rounded-xl px-4 py-2"
                  onClick={() => handleCancel(b.id)}
                >
                  ❌ Cancel
                </Button>
              )}

              {b.status !== "cancelled" && b.payment?.method === "cod" && (
                <div className="relative">
                  <label className="text-xs text-slate-500 mb-1 block">
                    Update Payment
                  </label>
                  <select
                    value={b.payment?.status || "pending"}
                    onChange={(e) =>
                      handlePaymentChange(b.payment.id, e.target.value)
                    }
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="completed">✅ Completed</option>
                    <option value="failed">❌ Failed</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {confirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-96 text-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              Confirm Booking
            </h2>
            <p className="text-slate-600 mb-6">
              Are you sure you want to confirm booking{" "}
              <span className="font-semibold">#{confirmModal}</span>?
            </p>
            <div className="flex justify-center gap-4">
              <Button
                className="bg-gray-300 hover:bg-gray-400 text-slate-800 text-sm rounded-xl px-4 py-2"
                onClick={() => setConfirmModal(null)}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white text-sm rounded-xl px-4 py-2"
                onClick={() => handleConfirm(confirmModal)}
              >
                ✅ Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
