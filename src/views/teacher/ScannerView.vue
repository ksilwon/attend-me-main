<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { apiClient } from '@/api/client'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import {
  ScanLine, CheckCircle2, XCircle, Camera, GraduationCap,
} from 'lucide-vue-next'

const props = defineProps<{ sessionId: string }>()

const route = useRoute()

interface ScanResult {
  id: number
  message: string
  success: boolean
}

const loading = ref(true)
const error = ref<string | null>(null)
const scanResults = ref<ScanResult[]>([])
const cameraActive = ref(false)
const manualToken = ref('')
const videoEl = ref<HTMLVideoElement | null>(null)

let nextResultId = 0
let lastScanned = ''
let stream: MediaStream | null = null
let scanLoop = false

const id = Number(props.sessionId)

// ── Inicjalizacja tokenu skanera ────────────────────────
onMounted(async () => {
  const tokenFromUrl = route.query.token as string | undefined

  if (tokenFromUrl) {
    // Token z URL (skaner otwarty na innym urządzeniu)
    apiClient.setScannerToken(tokenFromUrl)
    loading.value = false
  } else {
    // Zalogowany wykładowca – pobieramy token z backendu
    try {
      const result = await apiClient.courseSessionAttendanceScannerTokenGet(id)
      apiClient.setScannerToken(result.token)
    } catch {
      error.value = 'Nie udało się uzyskać tokenu skanera. Sprawdź uprawnienia.'
    } finally {
      loading.value = false
    }
  }
})

onUnmounted(() => {
  apiClient.setScannerToken(null)
  stopCamera()
})

// ── Wynik skanowania ────────────────────────────────────
function addResult(message: string, success: boolean): void {
  const result: ScanResult = { id: nextResultId++, message, success }
  scanResults.value.unshift(result)
  if (scanResults.value.length > 10) scanResults.value.pop()
  // Automatyczne usunięcie po 8 s
  const rid = result.id
  setTimeout(() => {
    scanResults.value = scanResults.value.filter((r) => r.id !== rid)
  }, 8000)
}

// ── Rejestracja obecności ───────────────────────────────
async function registerAttendance(token: string): Promise<void> {
  const trimmed = token.trim()
  if (!trimmed || trimmed === lastScanned) return
  lastScanned = trimmed

  try {
    const user = await apiClient.courseSessionAttendanceRegister(trimmed)
    addResult(`✓ Obecność zarejestrowana: ${user.firstName} ${user.lastName}`, true)
  } catch {
    addResult('✗ Nie udało się zarejestrować obecności. Kod nieprawidłowy lub wygasły.', false)
  }

  setTimeout(() => { lastScanned = '' }, 3000)
}

// ── Kamera ──────────────────────────────────────────────
async function startCamera(): Promise<void> {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    })
    if (videoEl.value) {
      videoEl.value.srcObject = stream
      videoEl.value.play()
    }
    cameraActive.value = true
    startBarcodeScanning()
  } catch {
    addResult('Nie udało się uruchomić kamery. Sprawdź uprawnienia przeglądarki.', false)
  }
}

function stopCamera(): void {
  scanLoop = false
  if (stream) {
    stream.getTracks().forEach((t) => t.stop())
    stream = null
  }
  cameraActive.value = false
}

/** Skanowanie QR za pomocą BarcodeDetector API (jeżeli dostępne) */
function startBarcodeScanning(): void {
  if (!('BarcodeDetector' in window)) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
  scanLoop = true

  const scan = async (): Promise<void> => {
    if (!scanLoop || !videoEl.value || videoEl.value.readyState < 4) {
      if (scanLoop) requestAnimationFrame(scan)
      return
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const barcodes: any[] = await detector.detect(videoEl.value)
      for (const b of barcodes) {
        if (b.rawValue) registerAttendance(b.rawValue)
      }
    } catch { /* ignorujemy błędy detekcji */ }

    if (scanLoop) setTimeout(() => requestAnimationFrame(scan), 500)
  }

  requestAnimationFrame(scan)
}

function handleManualSubmit(): void {
  if (manualToken.value.trim()) {
    registerAttendance(manualToken.value.trim())
    manualToken.value = ''
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Minimalny nagłówek -->
    <div class="bg-indigo-700 text-white py-3 px-4 shadow-lg flex items-center gap-2">
      <GraduationCap class="w-6 h-6" />
      <span class="font-bold text-lg">AttendMe</span>
      <span class="text-indigo-200 text-sm ml-2">— Skaner obecności</span>
    </div>

    <div class="max-w-2xl mx-auto px-4 py-6">
      <LoadingSpinner v-if="loading" message="Inicjalizacja skanera..." />
      <ErrorMessage v-else-if="error" :message="error" />

      <template v-else>
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-100 mb-3">
            <ScanLine class="w-7 h-7 text-indigo-600" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Skaner obecności</h1>
          <p class="text-gray-500 text-sm mt-1">
            Zeskanuj kod QR studenta, aby zarejestrować obecność
          </p>
        </div>

        <!-- Kamera -->
        <div class="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div v-if="!cameraActive">
            <button
              @click="startCamera"
              class="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center gap-2 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition"
            >
              <Camera class="w-8 h-8" />
              <span class="font-medium">Uruchom kamerę</span>
              <span class="text-xs">Kliknij, aby aktywować skaner QR</span>
            </button>
          </div>
          <div v-else class="relative">
            <video ref="videoEl" class="w-full rounded-lg bg-black" playsinline muted />
            <div class="absolute inset-0 border-2 border-indigo-500 rounded-lg pointer-events-none">
              <div class="absolute inset-[15%] border-2 border-white/50 rounded-lg" />
            </div>
            <button
              @click="stopCamera"
              class="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
            >
              Zatrzymaj
            </button>
          </div>
        </div>

        <!-- Ręczne wprowadzenie tokenu -->
        <div class="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <p class="text-sm font-medium text-gray-700 mb-2">
            Ręczne wprowadzenie tokenu (do testów):
          </p>
          <div class="flex gap-2">
            <input
              v-model="manualToken"
              type="text"
              @keydown.enter="handleManualSubmit"
              placeholder="Wklej token obecności..."
              class="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              @click="handleManualSubmit"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
            >
              Zarejestruj
            </button>
          </div>
        </div>

        <!-- Wyniki skanowania -->
        <div v-if="scanResults.length" class="space-y-2">
          <h3 class="text-sm font-medium text-gray-700">Wyniki skanowania:</h3>
          <div
            v-for="result in scanResults"
            :key="result.id"
            :class="[
              'flex items-center gap-2 p-3 rounded-lg text-sm',
              result.success
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200',
            ]"
          >
            <CheckCircle2 v-if="result.success" class="w-5 h-5 shrink-0" />
            <XCircle v-else class="w-5 h-5 shrink-0" />
            <span>{{ result.message }}</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
