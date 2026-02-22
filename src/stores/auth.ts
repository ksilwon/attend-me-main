import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/api/types'
import { userLogin, userGet } from '@/api/endpoints'
import { normalizeUser } from '@/utils/apiMapping'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(sessionStorage.getItem('token'))
  const deviceToken = ref<string | null>(localStorage.getItem('deviceToken'))
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const isDeviceRegistered = computed(() => !!deviceToken.value)

  const isTeacher = computed(() => {
    const u = user.value
    if (u?.roles?.length) {
      return u.roles.some((r) => r.toLowerCase() === 'teacher' || r.toLowerCase() === 'admin')
    }
    if ((u as any)?.isTeacher === true || (u as any)?.isAdmin === true) return true
    return u?.loginName === 'pk'
  })

  const isStudent = computed(() => {
    const u = user.value
    if (u?.roles?.length) {
      return u.roles.some((r) => r.toLowerCase() === 'student')
    }
    if ((u as any)?.isStudent === true) return true
    return u?.loginName?.startsWith('stu') ?? false
  })

  // Actions
  const login = async (loginName: string, password: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const result = await userLogin(loginName, password)
      token.value = result.token
      sessionStorage.setItem('token', result.token)
      sessionStorage.setItem('userLogin', loginName)
      
      // Fallback na podstawie loginu
      user.value = {
        id: 0,
        loginName: loginName,
        firstName: loginName === 'pk' ? 'Paweł' : 'Student',
        lastName: loginName === 'pk' ? 'Kołodziej' : loginName.replace('stu', ''),
        roles: loginName === 'pk' ? ['teacher'] : ['student']
      }

      try {
        const userData = await userGet()
        if (userData) {
          user.value = { ...userData, ...normalizeUser(userData) }
        }
      } catch (e) {
        console.log('Używam danych fallback dla użytkownika')
      }
      
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || err.response?.data || 'Błąd logowania. Sprawdź dane.'
      return false
    } finally {
      loading.value = false
    }
  }

  const fetchUser = async (): Promise<void> => {
    try {
      const userData = await userGet()
      if (userData) {
        user.value = { ...userData, ...normalizeUser(userData) }
      }
    } catch (err) {
      const savedLogin = sessionStorage.getItem('userLogin')
      if (savedLogin && !user.value) {
        user.value = {
          id: 0,
          loginName: savedLogin,
          firstName: savedLogin === 'pk' ? 'Paweł' : 'Student',
          lastName: savedLogin === 'pk' ? 'Kołodziej' : savedLogin.replace('stu', ''),
          roles: savedLogin === 'pk' ? ['teacher'] : ['student']
        }
      }
    }
  }

  const logout = (): void => {
    token.value = null
    user.value = null
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('userLogin')
  }

  const setDeviceToken = (newToken: string): void => {
    deviceToken.value = newToken
    localStorage.setItem('deviceToken', newToken)
  }

  const clearDeviceToken = (): void => {
    deviceToken.value = null
    localStorage.removeItem('deviceToken')
  }

  const initAuth = async (): Promise<void> => {
    if (token.value && !user.value) {
      const savedLogin = sessionStorage.getItem('userLogin')
      if (savedLogin) {
        user.value = {
          id: 0,
          loginName: savedLogin,
          firstName: savedLogin === 'pk' ? 'Paweł' : 'Student',
          lastName: savedLogin === 'pk' ? 'Kołodziej' : savedLogin.replace('stu', ''),
          roles: savedLogin === 'pk' ? ['teacher'] : ['student']
        }
      }
      await fetchUser()
    }
  }

  return {
    token,
    deviceToken,
    user,
    loading,
    error,
    isAuthenticated,
    isDeviceRegistered,
    isTeacher,
    isStudent,
    login,
    logout,
    fetchUser,
    setDeviceToken,
    clearDeviceToken,
    initAuth
  }
})