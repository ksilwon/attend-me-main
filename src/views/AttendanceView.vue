<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import QrcodeVue from 'qrcode.vue'
import { userAttendanceTicketGet } from '@/api/endpoints'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const ticket = ref<string | null>(null)
const lastAttendance = ref<{ userName: string; timestamp: string } | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

let ticketInterval: number | null = null

const isDeviceReady = computed(() => authStore.isDeviceRegistered)

const fetchTicket = async () => {
  if (!isDeviceReady.value) {
    error.value = 'Urządzenie nie jest zarejestrowane. Poproś wykładowcę o link rejestracyjny.'
    loading.value = false
    return
  }

  try {
    const result = await userAttendanceTicketGet()
    ticket.value = result.token

    if (result.lastAttendance) {
      lastAttendance.value = {
        userName: result.lastAttendance.userName,
        timestamp: result.lastAttendance.timestamp
      }
    }

    error.value = null
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Błąd pobierania kodu'
    console.error('Błąd:', err)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push({ name: 'dashboard' })
}

onMounted(() => {
  fetchTicket()
  ticketInterval = window.setInterval(fetchTicket, 2000)
})

onUnmounted(() => {
  if (ticketInterval) {
    clearInterval(ticketInterval)
  }
})
</script>

<template>
  <div class="text-center py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button class="btn btn-outline-secondary" @click="goBack">
        <i class="bi bi-arrow-left me-1"></i>
        Powrót
      </button>
      <h3 class="mb-0">
        <i class="bi bi-qr-code me-2"></i>
        Kod obecności
      </h3>
      <div></div>
    </div>

    <div
      v-if="lastAttendance"
      class="alert alert-success"
      role="alert"
    >
      <i class="bi bi-check-circle me-2"></i>
      Obecność zarejestrowana!
      <br />
      <small>{{ new Date(lastAttendance.timestamp).toLocaleString('pl-PL') }}</small>
    </div>

    <div v-if="!isDeviceReady" class="alert alert-warning">
      <i class="bi bi-exclamation-triangle me-2"></i>
      <strong>Urządzenie niezarejestrowane</strong>
      <p class="mb-0 mt-2">
        Poproś wykładowcę o link do rejestracji urządzenia, a następnie otwórz go na tym telefonie.
      </p>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ error }}
    </div>

    <div v-else-if="loading" class="py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Ładowanie...</span>
      </div>
      <p class="mt-3 text-muted">Generowanie kodu...</p>
    </div>

    <div v-else-if="ticket" class="qr-container">
      <div class="card mx-auto" style="max-width: 350px;">
        <div class="card-body p-4">
          <QrcodeVue
            :value="ticket"
            :size="280"
            level="M"
            class="mx-auto d-block"
          />
        </div>
      </div>

      <div class="mt-4">
        <p class="lead">
          <i class="bi bi-phone me-2"></i>
          Zbliż telefon do skanera
        </p>
        <p class="text-muted">
          Kod odświeża się automatycznie co 2 sekundy
        </p>
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Odświeżanie...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.qr-container {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>