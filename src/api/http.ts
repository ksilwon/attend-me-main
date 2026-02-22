import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = 'https://attendme-backend.runasp.net'

const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - dodaje token do nagłówków
http.interceptors.request.use(
  (config) => {
    // Nie dodawaj tokenu do logowania ani rejestracji urządzenia (token w query)
    if (config.url?.includes('/user/login') || config.url?.includes('/user/device/register')) {
      return config
    }

    const authStore = useAuthStore()

    // Żądania biletów obecności (QR) wymagają tokenu urządzenia
    if (config.url?.includes('/user/attendance/ticket/get')) {
      const deviceToken = authStore.deviceToken
      if (deviceToken) {
        config.headers.Authorization = `Bearer ${deviceToken}`
      }
      return config
    }

    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - obsługa błędów
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      window.location.hash = '#/login'
    }
    return Promise.reject(error)
  }
)

export default http