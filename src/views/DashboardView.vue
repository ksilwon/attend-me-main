<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { computed, onMounted, ref } from 'vue'
import TeacherDashboard from '@/components/teacher/TeacherDashboard.vue'
import StudentDashboard from '@/components/student/StudentDashboard.vue'

const authStore = useAuthStore()
const isLoading = ref(true)

const userRole = computed(() => {
  const login = authStore.user?.loginName || sessionStorage.getItem('userLogin') || ''
  
  // Sprawdź role z API
  if (authStore.user?.roles?.length) {
    if (authStore.user.roles.some(r => r.toLowerCase() === 'teacher' || r.toLowerCase() === 'admin')) {
      return 'teacher'
    }
    if (authStore.user.roles.some(r => r.toLowerCase() === 'student')) {
      return 'student'
    }
  }
  
  // Fallback na podstawie loginu
  if (login === 'pk') return 'teacher'
  if (login.startsWith('stu')) return 'student'
  
  return 'unknown'
})

onMounted(async () => {
  // Daj chwilę na załadowanie danych
  await new Promise(resolve => setTimeout(resolve, 500))
  isLoading.value = false
})
</script>

<template>
  <div>
    <!-- Ładowanie -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Ładowanie...</span>
      </div>
      <p class="mt-3 text-muted">Ładowanie pulpitu...</p>
    </div>

    <!-- Wykładowca -->
    <TeacherDashboard v-else-if="userRole === 'teacher'" />

    <!-- Student -->
    <StudentDashboard v-else-if="userRole === 'student'" />

    <!-- Nieznana rola -->
    <div v-else class="text-center py-5">
      <div class="alert alert-warning">
        <i class="bi bi-exclamation-triangle me-2"></i>
        Nie można określić roli użytkownika.
        <br>
        <small>Login: {{ authStore.user?.loginName || 'brak' }}</small>
      </div>
      <button class="btn btn-primary" @click="authStore.logout()">
        Wyloguj i spróbuj ponownie
      </button>
    </div>
  </div>
</template>