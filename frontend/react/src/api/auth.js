// src/api/auth.js
import client from './client'

export async function login({ username, password }) {
    return client.post('/api/auth/login/', { username, password })
}

export async function register(payload) {
    return client.post('/api/auth/register/', payload)
}

export async function getCurrentUser() {
    return client.get('/api/auth/me/')
}
