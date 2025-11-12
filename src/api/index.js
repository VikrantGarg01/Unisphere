import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to log failures (helps debug net errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const url = error?.config?.url || '(unknown url)'
      const method = error?.config?.method || ''
      console.error(`[api] Request failed: ${method.toUpperCase()} ${url}`, error.message)
    } catch (e) {
      console.error('[api] Response interceptor error', e)
    }
    return Promise.reject(error)
  }
)
export default api
