// src/api/bookings.js
import client from "./client";

export function createBooking(payload) {
    return client.post("/api/bookings/bookings/", payload);
}

export function listBookings() {
    return client.get("/api/bookings/bookings/");
}

export function cancelBooking(id) {
    return client.post(`/api/bookings/bookings/${id}/cancel/`);
}

export function getBooking(id) {
    return client.get(`/api/bookings/bookings/${id}/`);
}
