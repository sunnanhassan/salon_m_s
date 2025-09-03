import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookings, cancelBookingAction } from "../store/bookingsSlice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import dayjs from "dayjs";
import { Scissors, Building2, MapPin, CreditCard } from "lucide-react";

export default function MyBookings() {
  const dispatch = useDispatch();
  const { items = [], loading, error } = useSelector((s) => s.bookings || {});

  // Fetch bookings
  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  // Cancel booking handler
  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await dispatch(cancelBookingAction(id)).unwrap?.(); // RTK-safe
      alert("Booking cancelled successfully.");
    } catch (err) {
      console.error(err);
      alert(err?.message || "Cancel failed");
    }
  };

  // Badge styling for booking
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Badge styling for payment
  const getPaymentColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Format datetime
  const formatDateTime = (dt) => {
    if (!dt) return "N/A";
    const d = dayjs(dt);
    return d.isValid() ? d.format("ddd, MMM D YYYY, h:mm A") : "Invalid date";
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-8 text-slate-900">My Bookings</h1>

      {/* Error message */}
      {error && (
        <div className="text-red-600 mb-4 font-medium">
          Failed to load bookings. Please try again.
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-slate-600">Loading your bookings...</div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="text-slate-500 text-lg">
          You haven’t made any bookings yet.
        </div>
      )}

      {/* Booking list */}
      <div className="space-y-6">
        {items.map((b) => (
          <Card
            key={b.id}
            className="shadow-lg hover:shadow-xl border border-slate-200 rounded-xl transition-all duration-200"
          >
            {/* Header */}
            <CardHeader
              className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-5 
              bg-gradient-to-r from-slate-50 via-white to-slate-100 rounded-t-xl border-b border-slate-200 backdrop-blur-sm"
            >
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-rose-500" />
                  <CardTitle className="text-lg md:text-xl font-semibold text-slate-900 tracking-wide">
                    {b.service?.name ?? "Premium Service"}
                  </CardTitle>
                </div>

                {/* Salon name */}
                <p className="text-sm text-slate-700 flex items-center gap-1">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span className="font-medium">
                    {b.salon?.name ?? "Elite Salon & Spa"}
                  </span>
                </p>

                {/* Salon address */}
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {b.salon?.address ?? "N/A"}
                </p>
              </div>

              <Badge
                className={`uppercase px-4 py-1.5 text-sm rounded-full font-semibold shadow-sm tracking-wide ${getStatusColor(
                  b.status
                )}`}
              >
                {b.status}
              </Badge>
            </CardHeader>

            {/* Content */}
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {/* Left side */}
              <div className="space-y-2">
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Service Duration:</span>{" "}
                  {b.service?.duration_minutes ?? 0} mins
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Price:</span> $
                  {b.service?.price != null && !isNaN(Number(b.service.price))
                    ? Number(b.service.price).toFixed(2)
                    : "N/A"}
                </p>

                {/* Payment info */}
                {b.payment && (
                  <div className="mt-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">
                      Method:{" "}
                      <span className="font-medium uppercase">
                        {b.payment.method}
                      </span>
                    </span>
                    <Badge
                      className={`uppercase px-3 py-0.5 text-xs rounded-full font-semibold tracking-wide ${getPaymentColor(
                        b.payment.status
                      )}`}
                    >
                      {b.payment.status}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Right side */}
              <div className="space-y-2">
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Start Time:</span>{" "}
                  {formatDateTime(b.start_time)}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">End Time:</span>{" "}
                  {formatDateTime(b.end_time)}
                </p>
              </div>

              {/* Cancel Button */}
              {b.status !== "cancelled" && (
                <div className="md:col-span-2 pt-3 flex justify-end">
                  <Button
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => handleCancel(b.id)}
                  >
                    Cancel Booking
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
