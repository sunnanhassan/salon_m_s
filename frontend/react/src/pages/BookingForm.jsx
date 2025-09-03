import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import client from "../api/client";
import { createBooking } from "../api/bookings";
import { createPayment } from "../api/payments"; // COD payment API
import dayjs from "dayjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function BookingForm() {
  const { salonId, serviceId } = useParams();
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [service, setService] = useState({ name: "", price: 0 });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod"); // default COD
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (!serviceId) return;
      setLoading(true);
      setError(null);

      try {
        // Fetch slots
        const resSlots = await client.get(
          "/api/bookings/bookings/availability/",
          {
            params: {
              salon_id: salonId,
              service_id: serviceId,
              date: selectedDate,
            },
          }
        );
        setSlots(Array.isArray(resSlots) ? resSlots : []);

        // Fetch service details
        const resService = await client.get(
          `/api/salons/services/${serviceId}/`
        );
        setService({
          name: resService.name || "Service",
          price: resService.price || 0,
        });
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to fetch data");
        setSlots([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [salonId, serviceId, selectedDate]);

  const handleBookClick = (slot) => {
    setSelectedSlot(slot);
    setShowModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    setError(null);
    setShowModal(false);

    try {
      // Step 1: Create booking
      const bookingRes = await createBooking({
        salon_id: Number(salonId),
        service_id: Number(serviceId),
        start_time: selectedSlot.start,
      });

      // Step 2: Handle payment based on selected method
      if (paymentMethod === "cod") {
        try {
          await createPayment({
            booking_id: bookingRes.id,
            method: "cod",
          });
        } catch (paymentErr) {
          // If payment already exists, treat as success
          const msg =
            paymentErr.response?.data?.message || paymentErr.message || "";
          if (!msg.toLowerCase().includes("already exists")) {
            throw paymentErr;
          }
        }
      }

      // Step 3: Update local slots
      const newSlots = slots.map((s) =>
        s.start === selectedSlot.start ? { ...s, available: false } : s
      );
      setSlots(newSlots);

      // Step 4: Success toast
      toast.success("Booking successful!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Step 5: Redirect
      setTimeout(() => navigate("/my-bookings"), 1500);
    } catch (err) {
      console.error("Booking error:", err);
      const errMsg =
        err.response?.data?.message || err.message || "Booking failed";
      setError(errMsg);
      toast.error(`Booking failed: ${errMsg}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-16 px-4 relative">
      <ToastContainer />

      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 via-white to-slate-100 p-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Select a Time Slot
          </h2>
          <p className="text-gray-600 mt-1">
            {service.name} - ${service.price}
          </p>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-4 border p-2 rounded-lg"
          />
        </div>

        {error && <div className="text-red-600 text-center my-2">{error}</div>}
        {loading && (
          <p className="text-center text-slate-500 py-4">Loading slots...</p>
        )}

        {!loading && slots.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {slots.map((slot, index) => {
                  const start = dayjs(slot.start);
                  const end = dayjs(slot.end);
                  return (
                    <tr
                      key={index}
                      className={slot.available ? "" : "bg-gray-100"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {start.format("HH:mm")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {end.format("HH:mm")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {slot.available ? (
                          <button
                            onClick={() => handleBookClick(slot)}
                            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg"
                          >
                            Book
                          </button>
                        ) : (
                          <span className="text-gray-500">Booked</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && slots.length === 0 && (
          <p className="text-center text-slate-500 py-4">No slots available</p>
        )}

        <div className="bg-gray-50 text-center py-4 text-sm text-gray-500">
          Book your preferred time slot.
        </div>

        {/* Confirmation Modal */}
        {showModal && selectedSlot && (
          <>
            <div
              className="fixed inset-0 z-40"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
            ></div>
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg p-6 w-96 text-center relative">
                <h3 className="text-lg font-bold mb-4">Confirm Booking</h3>
                <p className="mb-2 text-gray-700">
                  Service: <strong>{service.name}</strong>
                </p>
                <p className="mb-2 text-gray-700">
                  Price: <strong>${service.price}</strong>
                </p>
                <p className="mb-4">
                  Time:{" "}
                  <strong>
                    {dayjs(selectedSlot.start).format("HH:mm")} -{" "}
                    {dayjs(selectedSlot.end).format("HH:mm")}
                  </strong>
                </p>

                {/* Payment Method Selection */}
                <div className="mb-4 text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-2"
                      />
                      Cash on Delivery
                    </label>
                    <label className="flex items-center text-gray-400">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        disabled
                        className="mr-2"
                      />
                      Card (Coming soon)
                    </label>
                  </div>
                </div>

                <div className="flex justify-around">
                  <button
                    onClick={handleConfirmBooking}
                    className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
