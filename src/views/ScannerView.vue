<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { QrcodeStream } from 'vue-qrcode-reader'
import {
  courseSessionAttendanceScannerTokenGet,
  courseSessionAttendanceRegister,
  courseTeacherSessionGet
} from '@/api/endpoints'
import type { CourseSessionListItem } from '@/api/types'
import { normalizeSession, normalizeUser } from '@/utils/apiMapping'

const route = useRoute()
const router = useRouter()

const session = ref<CourseSessionListItem | null>(null)
const scannerToken = ref<string | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const message = ref<{ text: string; type: 'success' | 'danger' | 'warning' } | null>(null)
const cameraError = ref<string | null>(null)

const sessionId = computed(() => Number(route.params.sessionId))
const normalizedSession = computed(() =>
  session.value ? normalizeSession(session.value) : null
)

const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    const [sessionData, tokenData] = await Promise.all([
      courseTeacherSessionGet(sessionId.value),
      courseSessionAttendanceScannerTokenGet(sessionId.value)
    ])
    session.value = sessionData
    scannerToken.value = tokenData.token
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Błąd inicjalizacji skanera'
    console.error('Błąd:', err)
  } finally {
    loading.value = false
  }
}

const onDecode = async (decodedString: string) => {
  if (!scannerToken.value || !decodedString) return

  try {
    const userResp = await courseSessionAttendanceRegister(decodedString, scannerToken.value)
    const u = normalizeUser(userResp)
    message.value = {
      text: `✓ Zarejestrowano obecność: ${u.firstName} ${u.lastName}`,
      type: 'success'
    }
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || 'Błąd rejestracji obecności'
    message.value = {
      text: `✗ ${errorMsg}`,
      type: 'danger'
    }
  }

  setTimeout(() => {
    message.value = null
  }, 3000)
}

const onCameraError = (err: Error) => {
  cameraError.value = `Błąd kamery: ${err.message}`
  console.error('Camera error:', err)
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

const goBack = () => {
  router.push({ name: 'teacher-session', params: { id: sessionId.value } })
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="min-vh-100 bg-dark text-white">
    <div class="container py-4">
      <!-- Nagłówek -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <button class="btn btn-outline-light" @click="goBack">
          <i class="bi bi-arrow-left me-1"></i>
          Powrót
        </button>
        <h4 class="mb-0">
          <i class="bi bi-qr-code-scan me-2"></i>
          Skaner obecności
        </h4>
        <div></div>
      </div>

      <!-- Info o zajęciach -->
      <div v-if="normalizedSession" class="text-center mb-4">
        <h5>{{ normalizedSession.courseName }}</h5>
        <p class="mb-0 text-muted">
          {{ normalizedSession.groupName }} • {{ formatDate(normalizedSession.sessionDate) }}
        </p>
      </div>

      <!-- Komunikat -->
      <div
        v-if="message"
        class="alert text-center"
        :class="'alert-' + message.type"
        role="alert"
      >
        <h5 class="mb-0">{{ message.text }}</h5>
      </div>

      <!-- Błąd -->
      <div v-if="error" class="alert alert-danger text-center">
        {{ error }}
      </div>

      <!-- Błąd kamery -->
      <div v-if="cameraError" class="alert alert-warning text-center">
        {{ cameraError }}
      </div>

      <!-- Ładowanie -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-light" role="status">
          <span class="visually-hidden">Ładowanie...</span>
        </div>
        <p class="mt-3">Inicjalizacja skanera...</p>
      </div>

      <!-- Skaner QR -->
      <div v-else-if="scannerToken" class="scanner-container mx-auto" style="max-width: 500px;">
        <div class="position-relative rounded overflow-hidden">
          <QrcodeStream
            @decode="onDecode"
            @error="onCameraError"
            :track="true"
          />
          <div class="scanner-overlay">
            <div class="scanner-frame"></div>
          </div>
        </div>

        <div class="text-center mt-4">
          <p class="lead">
            <i class="bi bi-phone me-2"></i>
            Zbliż telefon studenta do kamery
          </p>
          <p class="text-muted">
            Kod QR zostanie automatycznie zeskanowany
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scanner-container {
  position: relative;
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scanner-frame {
  width: 250px;
  height: 250px;
  border: 3px solid #00ff00;
  border-radius: 10px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
}
</style>