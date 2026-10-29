const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    })
    const data = await response.json()
    if (!response.ok) {
      const err = new Error(data.error || `Request failed with status ${response.status}`)
      err.status = response.status
      err.data = data
      throw err
    }
    return data
  } catch (err) {
    console.warn(`[API] Network request to ${endpoint} failed:`, err.message)
    throw err
  }
}

// -------------------------------------------------------------
// Authentication API
// All methods throw on failure — no insecure silent fallbacks.
// Role assignment is exclusively handled by the backend (Supabase DB).
// -------------------------------------------------------------
export const authApi = {
  // Check if email exists in the institutional directory
  async verifyEmail(email) {
    return await apiRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  },

  // Request a 6-digit OTP to be sent to the institutional email
  async sendOtp(email) {
    return await apiRequest('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  },

  // Verify the OTP — backend returns a DB-verified user profile
  async verifyOtp(email, otp) {
    return await apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    })
  },

  // Verify a magic link token
  async verifyLink(token, email) {
    return await apiRequest(
      `/auth/verify-link?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email || '')}`
    )
  },

  // Sync Microsoft OAuth result with backend (backend returns DB role)
  async outlookLogin(email) {
    return await apiRequest('/auth/outlook', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  },

  // Password-based login — backend verifies against DB
  async login(email, password) {
    return await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  }
}

// -------------------------------------------------------------
// Venues API
// -------------------------------------------------------------
export const venuesApi = {
  async getAll(params = {}) {
    const query = new URLSearchParams(params).toString()
    return await apiRequest(`/venues${query ? `?${query}` : ''}`)
  },

  async getById(id) {
    return await apiRequest(`/venues/${id}`)
  },

  async create(venueData) {
    return await apiRequest('/venues', {
      method: 'POST',
      body: JSON.stringify(venueData)
    })
  },

  async update(id, updates) {
    return await apiRequest(`/venues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  },

  async delete(id) {
    return await apiRequest(`/venues/${id}`, {
      method: 'DELETE'
    })
  }
}

// -------------------------------------------------------------
// Bookings API
// -------------------------------------------------------------
export const bookingsApi = {
  async getAll(params = {}) {
    const query = new URLSearchParams(params).toString()
    return await apiRequest(`/bookings${query ? `?${query}` : ''}`)
  },

  async getAvailability(venueName, date) {
    const query = new URLSearchParams({ venueName, date }).toString()
    return await apiRequest(`/bookings/availability?${query}`)
  },

  async getById(id) {
    return await apiRequest(`/bookings/${id}`)
  },

  async create(bookingData) {
    return await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    })
  },

  async updateStatus(id, status, reason = '', actor = '') {
    return await apiRequest(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason, actor })
    })
  },

  async delete(id) {
    return await apiRequest(`/bookings/${id}`, {
      method: 'DELETE'
    })
  },

  async verifyPass(passCode) {
    return await apiRequest(`/bookings/verify-pass/${encodeURIComponent(passCode)}`)
  },

  async sendPassEmail(data) {
    return await apiRequest('/bookings/send-pass-email', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

// -------------------------------------------------------------
// Institutional Users & Directory API
// -------------------------------------------------------------
export const usersApi = {
  async getAll(params = {}) {
    const query = new URLSearchParams(params).toString()
    return await apiRequest(`/users${query ? `?${query}` : ''}`)
  },

  async create(userData) {
    return await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  },

  async bulkImport(usersArray) {
    return await apiRequest('/users/import', {
      method: 'POST',
      body: JSON.stringify({ users: usersArray })
    })
  },

  async updateRole(id, role) {
    return await apiRequest(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    })
  },

  async updateStatus(id, status) {
    return await apiRequest(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
  },

  async delete(id) {
    return await apiRequest(`/users/${id}`, {
      method: 'DELETE'
    })
  }
}

// -------------------------------------------------------------
// Role Requests API
// -------------------------------------------------------------
export const roleRequestsApi = {
  async getAll() {
    return await apiRequest('/role-requests')
  },

  async create(requestData) {
    return await apiRequest('/role-requests', {
      method: 'POST',
      body: JSON.stringify(requestData)
    })
  },

  async updateStatus(id, status, reviewedBy = 'Administrator') {
    return await apiRequest(`/role-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reviewedBy })
    })
  }
}

// -------------------------------------------------------------
// Academic Timetable API
// -------------------------------------------------------------
export const timetableApi = {
  async getAll() {
    return await apiRequest('/timetable')
  },

  async create(entryData) {
    return await apiRequest('/timetable', {
      method: 'POST',
      body: JSON.stringify(entryData)
    })
  },

  async bulkImport(entriesArray) {
    return await apiRequest('/timetable/bulk', {
      method: 'POST',
      body: JSON.stringify({ entries: entriesArray })
    })
  },

  async delete(id) {
    return await apiRequest(`/timetable/${id}`, {
      method: 'DELETE'
    })
  }
}

// -------------------------------------------------------------
// Audit Logs API
// -------------------------------------------------------------
export const logsApi = {
  async getAll(limit = 100) {
    return await apiRequest(`/logs?limit=${limit}`)
  },

  async create(logData) {
    return await apiRequest('/logs', {
      method: 'POST',
      body: JSON.stringify(logData)
    })
  }
}

// -------------------------------------------------------------
// Campus Events API
// -------------------------------------------------------------
export const eventsApi = {
  async getAll() {
    return await apiRequest('/events')
  }
}

// -------------------------------------------------------------
// Cashfree Payments Gateway API
// -------------------------------------------------------------
export const paymentsApi = {
  async createOrder(payload) {
    return await apiRequest('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  async verify(orderId, bookingId = null) {
    return await apiRequest('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ orderId, bookingId })
    })
  },

  async getStatus(orderId) {
    return await apiRequest(`/payments/status/${encodeURIComponent(orderId)}`)
  }
}
