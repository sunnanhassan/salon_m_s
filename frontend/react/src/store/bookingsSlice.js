// src/store/bookingsSlice.js
import { createSlice } from "@reduxjs/toolkit";
import * as bookingsApi from "../api/bookings";
import * as paymentsApi from "../api/payments";

const slice = createSlice({
    name: "bookings",
    initialState: { items: [], loading: false, error: null },
    reducers: {
        start(state) {
            state.loading = true;
            state.error = null;
        },
        set(state, action) {
            state.loading = false;
            state.items = action.payload;
        },
        add(state, action) {
            state.loading = false;
            state.items.unshift(action.payload);
        },
        update(state, action) {
            state.loading = false;
            state.items = state.items.map((b) =>
                b.id === action.payload.id ? action.payload : b
            );
        },
        // update only the nested payment object in the matching booking
        updatePaymentInBooking(state, action) {
            const updatedPayment = action.payload;
            state.loading = false;
            state.items = state.items.map((b) =>
                b.payment && b.payment.id === updatedPayment.id
                    ? { ...b, payment: updatedPayment }
                    : b
            );
        },
        fail(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    start,
    set,
    add,
    update,
    updatePaymentInBooking,
    fail,
} = slice.actions;
export default slice.reducer;

/* ----------------------- Plain thunks ----------------------- */

/**
 * Fetch all bookings (customer or owner endpoint that lists relevant bookings)
 */
export function fetchBookings(params) {
    return async (dispatch) => {
        dispatch(start());
        try {
            const data = await bookingsApi.listBookings(params);
            dispatch(set(data));
            return data;
        } catch (err) {
            dispatch(fail(err.message || "Failed to load bookings"));
            throw err;
        }
    };
}

/**
 * Create booking (customer)
 */
export function createBooking(payload) {
    return async (dispatch) => {
        dispatch(start());
        try {
            const booking = await bookingsApi.createBooking(payload);
            dispatch(add(booking));
            return booking;
        } catch (err) {
            dispatch(fail(err.message || "Booking failed"));
            throw err;
        }
    };
}

/**
 * Cancel booking
 * - Some backends return the updated booking; others return { status: 'cancelled' }.
 * - We'll handle both: if response has an id, update; otherwise re-fetch booking.
 */
export function cancelBookingAction(id) {
    return async (dispatch) => {
        dispatch(start());
        try {
            const res = await bookingsApi.cancelBooking(id);
            // If backend returns booking object with id -> update directly
            if (res && res.id) {
                dispatch(update(res));
                return res;
            }
            // Fallback: fetch the booking fresh and update
            const fresh = await bookingsApi.getBooking(id);
            dispatch(update(fresh));
            return fresh;
        } catch (err) {
            dispatch(fail(err.message || "Cancel failed"));
            throw err;
        }
    };
}

/**
 * Confirm booking (owner) — same fallback logic as cancel
 */
export function confirmBookingAction(id) {
    return async (dispatch) => {
        dispatch(start());
        try {
            const res = await bookingsApi.confirmBooking(id);
            if (res && res.id) {
                dispatch(update(res));
                return res;
            }
            const fresh = await bookingsApi.getBooking(id);
            dispatch(update(fresh));
            return fresh;
        } catch (err) {
            dispatch(fail(err.message || "Confirm failed"));
            throw err;
        }
    };
}

/**
 * Update payment status (owner or customer action)
 * - Use paymentsApi.updatePayment(paymentId, status)
 * - Backend usually returns the updated payment object. We then update it inside redux state.
 */
export function updatePaymentStatus(paymentId, status) {
    return async (dispatch) => {
        dispatch(start());
        try {
            const updatedPayment = await paymentsApi.updatePayment(paymentId, status);
            // If backend returns payment directly
            if (updatedPayment && updatedPayment.id) {
                dispatch(updatePaymentInBooking(updatedPayment));
                return updatedPayment;
            }

            // Fallback: if backend returned a wrapper like { payment: {...} }
            const p = updatedPayment.payment || updatedPayment.data || updatedPayment;
            dispatch(updatePaymentInBooking(p));
            return p;
        } catch (err) {
            dispatch(fail(err.message || "Payment update failed"));
            throw err;
        }
    };
}

/**
 * Convenience for marking paid (owner clicks 'Mark Paid')
 */
export function markPaymentReceived(paymentId) {
    return updatePaymentStatus(paymentId, "completed");
}
