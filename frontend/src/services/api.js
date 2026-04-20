import axios from 'axios'

// ✅ Create axios instance
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ✅ REQUEST INTERCEPTOR (attach token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('it_token')

    // Debug log (optional)
    if (import.meta.env.DEV) {
      console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`, {
        token: !!token,
      })
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    console.error('[REQUEST ERROR]', error)
    return Promise.reject(error)
  }
)

// ✅ RESPONSE INTERCEPTOR (global error handling)
api.interceptors.response.use(
  (response) => {
    // Debug log (optional)
    if (import.meta.env.DEV) {
      console.log(`[API RESPONSE] ${response.config.url}`, response.status)
    }
    return response
  },
  (error) => {
    const status = error.response?.status
    const url = error.config?.url

    console.error('[API ERROR]', {
      status,
      url,
      message: error.response?.data,
    })

    // 🔥 Handle unauthorized (token expired / invalid)
    if (status === 401) {
      localStorage.removeItem('it_token')
      localStorage.removeItem('it_user')

      // Avoid infinite redirect loop
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api