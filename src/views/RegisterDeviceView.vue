<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userDeviceRegisterWithToken } from '@/api/endpoints'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const deviceName = ref('')
const deviceIdentifier = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const token = computed(() => (route.query.token as string) || '')

const generateDeviceId = (): string => {
  const data = [navigator.userAgent, screen.width, screen.height, Date.now(), Math.random()]
  return btoa(data.join('|')).substring(0, 32)
}

const handleRegister = async () => {
  if (!deviceName.value) {
    error.value = 'Podaj nazwę urządzenia'
    return
  }

  loading.value = true
  error.value = null

  try {
    const result = await userDeviceRegisterWithToken(token.value, {
      deviceName: deviceName.value,
      deviceIdentifier: deviceIdentifier.value
    })
    authStore.setDeviceToken(result.token)
    success.value = true
    setTimeout(() => router.push({ name: 'login' }), 2000)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Błąd rejestracji'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  deviceIdentifier.value = generateDeviceId()
  if (!token.value) {
    error.value = 'Brak tokenu rejestracyjnego. Użyj linku od wykładowcy.'
  }
})
</script>

<template>
  <div class="card shadow">
    <div class="card-body p-4">
      <h4 class="card-title text-center mb-4">
        <i class="bi bi-phone me-2"></i>
        Rejestracja urządzenia
      </h4>
      <div v-if="success" class="alert alert-success text-center">
                <i class="bi bi-check-circle display-4"></i>
                <h5 class="mt-3">Urządzenie zarejestrowane!</h5>
                <p class="mb-0">Za chwilę zostaniesz przekierowany...</p>
              </div>

              <form v-else @submit.prevent="handleRegister">
                <div v-if="error" class="alert alert-danger">{{ error }}</div>

                <div class="mb-3">
                  <label class="form-label">Nazwa urządzenia</label>
                  <input
                    v-model="deviceName"
                    type="text"
                    class="form-control"
                    placeholder="np. Mój telefon"
                    :disabled="loading || !token"
                  />
                </div>

                <div class="mb-4">
                  <label class="form-label">Identyfikator urządzenia</label>
                  <input
                    v-model="deviceIdentifier"
                    type="text"
                    class="form-control"
                    readonly
                  />
                  <small class="text-muted">Wygenerowano automatycznie</small>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100"
                  :disabled="loading || !token"
                >
                  <span v-if="loading">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Rejestracja...
                  </span>
                  <span v-else>
                    <i class="bi bi-check-lg me-2"></i>
                    Zarejestruj urządzenie
                  </span>
                </button>
              </form>
    </div>
  </div>
</template>