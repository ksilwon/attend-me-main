import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        { path: '', redirect: { name: 'login' } },
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/LoginView.vue')
        },
        {
          path: 'register-device',
          name: 'register-device',
          component: () => import('@/views/RegisterDeviceView.vue')
        }
      ]
    },
    {
      path: '/scan/:sessionId',
      name: 'scanner',
      component: () => import('@/views/ScannerView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/app',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue')
        },
        {
          path: 'session/:id',
          name: 'teacher-session',
          component: () => import('@/views/TeacherSessionView.vue')
        },
        {
          path: 'student/session/:id/:groupId',
          name: 'student-session',
          component: () => import('@/views/StudentSessionView.vue')
        },
        {
          path: 'attendance',
          name: 'attendance',
          component: () => import('@/views/AttendanceView.vue')
        }
      ]
    }
  ]
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // Inicjalizuj auth jeśli jest token
  if (authStore.token && !authStore.user) {
    await authStore.initAuth()
  }

  // Sprawdź czy wymaga autoryzacji
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }
  
  // Jeśli zalogowany i próbuje wejść na login - przekieruj do dashboard
  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }
  
  // W przeciwnym razie pozwól przejść
  return true
})

export default router