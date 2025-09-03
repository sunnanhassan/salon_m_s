import client from './client'

// List all salons
export async function listSalons() {
    return client.get('/api/salons/salons/')
}

// Get single salon
export async function getSalon(salonId) {
    return client.get(`/api/salons/salons/${salonId}/`)
}

// Get services for a salon
export async function getServicesForSalon(salonId) {
    return client.get('/api/salons/services/', { params: { salon: salonId } })
}

// Create salon
export async function createSalon(data) {
    return client.post('/api/salons/salons/', data)
}

// Update salon
export async function updateSalon(salonId, data) {
    return client.put(`/api/salons/salons/${salonId}/`, data)
}

// Create service
export async function createService(salonId, payload) {
    return client.post('/api/salons/services/', { ...payload, salon: salonId })
}

// Update service
export async function updateService(serviceId, payload) {
    return client.put(`/api/salons/services/${serviceId}/`, payload)
}

// Delete service
export async function deleteService(serviceId) {
    return client.delete(`/api/salons/services/${serviceId}/`)
}
