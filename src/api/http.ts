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
    // Nie dodawaj tokenu do logowania
    if (config.url?.includes('/user/login')) {
      return config
    }

    const authStore = useAuthStore()
    
    // Sprawdź czy to request wymagający device token
    if (config.url?.includes('/user/attendance/ticket') || 
        config.url?.includes('/user/device/register')) {
      const deviceToken = authStore.deviceToken
      if (deviceToken) {
        config.headers.Authorization = `Bearer ${deviceToken}`
      }
    } else if (authStore.token) {
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