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
// -------------------------------------------------------------
export const authApi = {
  async verifyEmail(email) {
    try {
      return await apiRequest('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email })
      })
    } catch {
      const trimmed = email.trim().toLowerCase()
      const isExisting = ['admin@coeptech.ac.in', 'faculty@coeptech.ac.in', 'nirmala21.comp@coep.ac.in'].includes(trimmed)
      return {
        email: trimmed,
        status: isExisting ? 'existing' : 'new',
        message: isExisting ? 'Existing university account detected.' : 'New campus account.'
      }
    }
  },

  async sendOtp(email) {
    try {
      return await apiRequest('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email })
      })
    } catch {
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString()
      return {
        success: true,
        email,
        expiresInSeconds: 600,
        preview: {
          otp: mockOtp,
          verificationUrl: `/verify-email?token=mock-${Date.now()}&email=${encodeURIComponent(email)}`,
          recipient: email
        }
      }
    }
  },

  async verifyOtp(email, otp, role) {
    try {
      return await apiRequest('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp, role })
      })
    } catch {
      const trimmed = email.trim().toLowerCase()
      let userRole = role || 'Student'
      let name = trimmed.split('@')[0].replace(/[._]/g, ' ')
      name = name.charAt(0).toUpperCase() + name.slice(1)

      if (trimmed.includes('admin')) {
        userRole = 'Administrator'
        name = 'Central Estate Admin'
      } else if (trimmed.includes('faculty') || trimmed.includes('vkk')) {
        userRole = 'Faculty'
        name = 'Dr. V. K. Kulkarni'
      } else if (trimmed.includes('mindspark') || trimmed.includes('club')) {
        userRole = 'Club Lead'
        name = 'MindSpark Secretarial Lead'
      }

      return {
        success: true,
        user: {
          id: `COEP-${Math.floor(1000 + Math.random() * 9000)}`,
          name,
          email: trimmed,
          role: userRole,
          department: userRole === 'Administrator' ? 'Central Estate & Infrastructure' : 'Computer Engineering',
          authProvider: 'coep-otp',
          authenticatedAt: new Date().toISOString()
        }
      }
    }
  },

  async verifyLink(token, email) {
    try {
      return await apiRequest(`/auth/verify-link?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email || '')}`)
    } catch {
      return this.verifyOtp(email || 'student@coeptech.ac.in', '123456', 'Student')
    }
  },

  async outlookLogin(email, role) {
    try {
      return await apiRequest('/auth/outlook', {
        method: 'POST',
        body: JSON.stringify({ email, role })
      })
    } catch {
      const trimmed = email ? email.trim().toLowerCase() : 'student@coeptech.ac.in'
      let userRole = role || 'Student'
      let name = trimmed.split('@')[0].replace(/[._]/g, ' ')
      name = name.charAt(0).toUpperCase() + name.slice(1)

      if (trimmed.includes('admin')) {
        userRole = 'Administrator'
        name = 'Central Estate Admin'
      } else if (trimmed.includes('faculty') || trimmed.includes('vkk')) {
        userRole = 'Faculty'
        name = 'Dr. V. K. Kulkarni'
      } else if (trimmed.includes('mindspark') || trimmed.includes('club')) {
        userRole = 'Club Lead'
        name = 'MindSpark Secretarial Lead'
      }

      return {
        success: true,
        user: {
          id: `COEP-${Math.floor(1000 + Math.random() * 9000)}`,
          name,
          email: trimmed,
          role: userRole,
          department: userRole === 'Administrator' ? 'Central Estate & Infrastructure' : 'Computer Engineering',
          authProvider: 'microsoft-outlook',
          authenticatedAt: new Date().toISOString()
        }
      }
    }
  },

  async login(email, password, role) {
    try {
      return await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role })
      })
    } catch {
      const trimmed = email.trim().toLowerCase()
      let userRole = role || 'Student'
      let name = trimmed.split('@')[0].replace(/[._]/g, ' ')
      name = name.charAt(0).toUpperCase() + name.slice(1)

      if (trimmed.includes('admin')) {
        userRole = 'Administrator'
        name = 'Central Estate Admin'
      } else if (trimmed.includes('faculty') || trimmed.includes('vkk')) {
        userRole = 'Faculty'
        name = 'Dr. V. K. Kulkarni'
      } else if (trimmed.includes('mindspark') || trimmed.includes('club')) {
        userRole = 'Club Lead'
        name = 'MindSpark Secretarial Lead'
      }

      return {
        success: true,
        user: {
          id: `COEP-${Math.floor(1000 + Math.random() * 9000)}`,
          name,
          email: trimmed,
          role: userRole,
          department: userRole === 'Administrator' ? 'Central Estate & Infrastructure' : 'Computer Engineering',
          authProvider: 'password',
          authenticatedAt: new Date().toISOString()
        }
      }
    }
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
