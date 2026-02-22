<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { computed } from 'vue'

const router = useRouter()
const authStore = useAuthStore()

const userDisplayName = computed(() => {
  const u = authStore.user
  if (!u) return 'Użytkownik'
  const first = u.firstName ?? u.name ?? ''
  const last = u.lastName ?? u.surname ?? ''
  if (first || last) return `${first} ${last}`.trim()
  return u.loginName || 'Użytkownik'
})

const userRole = computed(() => {
  if (authStore.isTeacher) return 'Wykładowca'
  if (authStore.isStudent) return 'Student'
  return 'Użytkownik'
})

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-vh-100 d-flex flex-column">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <RouterLink to="/app" class="navbar-brand fw-bold">
          <i class="bi bi-qr-code-scan me-2"></i>
          AttendMe
        </RouterLink>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <RouterLink to="/app" class="nav-link">
                <i class="bi bi-house-door me-1"></i>
                Pulpit
              </RouterLink>
            </li>
            <li v-if="authStore.isStudent" class="nav-item">
              <RouterLink to="/app/attendance" class="nav-link">
                <i class="bi bi-qr-code me-1"></i>
                Rejestruj obecność
              </RouterLink>
            </li>
          </ul>

          <ul class="navbar-nav">
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                <i class="bi bi-person-circle me-1"></i>
                {{ userDisplayName }}
                <span class="badge bg-light text-primary ms-1">{{ userRole }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <span class="dropdown-item-text text-muted">
                    {{ authStore.user?.loginName }}
                  </span>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <button class="dropdown-item text-danger" @click="handleLogout">
                    <i class="bi bi-box-arrow-right me-2"></i>
                    Wyloguj
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="flex-grow-1 py-4">
      <div class="container">
        <RouterView />
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-light py-3 mt-auto">
      <div class="container text-center text-muted">
        <small>AttendMe &copy; 2025 - System sprawdzania obecności</small>
      </div>
    </footer>
  </div>
</template>