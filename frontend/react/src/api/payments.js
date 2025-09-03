// src/api/payments.js
import client from "./client";

// Create a payment
export function createPayment(payload) {
    return client.post("/api/payments/", payload);
}

// Update payment status
export function updatePayment(id, status) {
    return client.patch(`/api/payments/${id}/`, { status });
}

// Mark payment as completed (COD received)
export function markPaid(id) {
    return updatePayment(id, "completed");
}

// List all payments
export function listPayments() {
    return client.get("/api/payments/");
}

// Get payment details
export function getPayment(id) {
    return client.get(`/api/payments/${id}/`);
}
