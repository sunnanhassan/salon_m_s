// src/store/index.js
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import bookingsReducer from './bookingsSlice'

const store = configureStore({
    reducer: {
        auth: authReducer,
        bookings: bookingsReducer,
    }
})

export default store
