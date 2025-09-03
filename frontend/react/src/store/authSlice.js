// src/store/authSlice.js
import { createSlice } from '@reduxjs/toolkit'
import * as authApi from '../api/auth'

const loadAuth = () => {
    try {
        return JSON.parse(localStorage.getItem('auth')) || { user: null, access: null, refresh: null }
    } catch (e) {
        return { user: null, access: null, refresh: null }
    }
}

const initialState = { ...loadAuth(), loading: false, error: null }

const slice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        start(state) { state.loading = true; state.error = null },
        success(state, action) { state.loading = false; state.error = null; Object.assign(state, action.payload) },
        fail(state, action) { state.loading = false; state.error = action.payload },
        logout(state) { state.user = null; state.access = null; state.refresh = null; localStorage.removeItem('auth') }
    }
})

export const { start, success, fail, logout } = slice.actions
export default slice.reducer

// plain thunks

export function loginUser({ username, password }) {
    return async dispatch => {
        dispatch(start())
        try {
            // 1) get tokens
            const tokens = await authApi.login({ username, password })
            // store tokens temporarily so client can use Authorization header for next call
            const tokenPayload = { access: tokens.access, refresh: tokens.refresh }
            localStorage.setItem('auth', JSON.stringify(tokenPayload))

            // 2) fetch current user profile (must be an authenticated call)
            const user = await authApi.getCurrentUser()

            const payload = { ...tokenPayload, user }
            localStorage.setItem('auth', JSON.stringify(payload))
            dispatch(success(payload))
            return payload
        } catch (err) {
            dispatch(fail(err.message || 'Login failed'))
            // keep tokens removed on failure
            localStorage.removeItem('auth')
            throw err
        }
    }
}

export function registerUser(payload) {
    return async dispatch => {
        dispatch(start())
        try {
            const res = await authApi.register(payload)
            dispatch(success({ user: null, access: null, refresh: null })) // not logged in yet
            return res
        } catch (err) {
            dispatch(fail(err.message || 'Registration failed'))
            throw err
        }
    }
}
