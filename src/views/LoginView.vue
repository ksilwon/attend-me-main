<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loginName = ref('')
const password = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  if (!loginName.value || !password.value) {
    authStore.error = 'Wprowadź login i hasło'
    return
  }

  const success = await authStore.login(loginName.value, password.value)
  if (success) {
    router.push({ name: 'dashboard' })
  }
}
</script>

<template>
  <div class="card shadow">
    <div class="card-body p-4">
      <h4 class="card-title text-center mb-4">Logowanie</h4>

      <form @submit.prevent="handleLogin">
        <div v-if="authStore.error" class="alert alert-danger alert-dismissible" role="alert">
          {{ authStore.error }}
          <button 
            type="button" 
            class="btn-close" 
            @click="authStore.error = null"
          ></button>
        </div>

        <div class="mb-3">
          <label for="loginName" class="form-label">Login</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-person"></i>
            </span>
            <input
              id="loginName"
              v-model="loginName"
              type="text"
              class="form-control"
              placeholder="Wprowadź login"
              :disabled="authStore.loading"
              autocomplete="username"
            />
          </div>
        </div>

        <div class="mb-4">
          <label for="password" class="form-label">Hasło</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-lock"></i>
            </span>
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-control"
              placeholder="Wprowadź hasło"
              :disabled="authStore.loading"
              autocomplete="current-password"
            />
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-primary w-100"
          :disabled="authStore.loading"
        >
          <span v-if="authStore.loading">
            <span class="spinner-border spinner-border-sm me-2"></span>
            Logowanie...
          </span>
          <span v-else>
            <i class="bi bi-box-arrow-in-right me-2"></i>
            Zaloguj się
          </span>
        </button>
      </form>
    </div>
  </div>
</template>