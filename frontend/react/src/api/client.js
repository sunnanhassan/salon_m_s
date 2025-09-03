// src/api/client.js
import axios from 'axios'

export const API_BASE = 'https://salonms-production.up.railway.app/'

const client = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to attach JWT
client.interceptors.request.use(config => {
    const raw = localStorage.getItem('auth')
    if (raw) {
        try {
            const { access } = JSON.parse(raw)
            if (access) config.headers.Authorization = `Bearer ${access}`
        } catch (e) { }
    }
    return config
}, error => Promise.reject(error))

// Response interceptor for error handling
client.interceptors.response.use(
    res => res.data,
    err => {
        const detail = err.response?.data?.detail || err.response?.data?.message || err.message
        const error = new Error(detail)
        error.status = err.response?.status
        error.payload = err.response?.data
        return Promise.reject(error)
    }
)

export default client
