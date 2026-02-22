<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiClient } from '@/api/client'
import QrCodeComponent from '@/components/QrCode.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import { QrCode, Loader2, Smartphone, ArrowLeft, CheckCircle2 } from 'lucide-vue-next'

const router = useRouter()

const ticket = ref<string | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const registered = ref(false)

const hasDevice = !!apiClient.deviceToken
let ticketInterval: ReturnType<typeof setInterval> | null = null

/** Pobranie nowego ticketu */
async function fetchTicket(): Promise<void> {
  try {
    const result = await apiClient.userAttendanceTicketGet()
    ticket.value = result.token
    error.value = null

    // Informacja o rejestracji obecności (jeśli token zawiera dane)
    // Backend może zwrócić odpowiedni status
  } catch {
    error.value = 'Nie udało się pobrać kodu obecności. Sprawdź rejestrację urządzenia.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!hasDevice) {
    loading.value = false
    error.value = 'Urządzenie nie jest zarejestrowane. Otwórz link rejestracyjny od wykładowcy.'
    return
  }

  fetchTicket()
  // Odświeżanie ticketu co 2 sekundy
  ticketInterval = setInterval(fetchTicket, 2000)
})

onUnmounted(() => {
  if (ticketInterval) clearInterval(ticketInterval)
})
</script>

<template>
  <div class="max-w-md mx-auto">
    <button
      @click="router.back()"
      class="flex items-center gap-1 text-gray-500 hover:text-indigo-600 text-sm mb-4 transition"
    >
      <ArrowLeft class="w-4 h-4" /> Powrót
    </button>

    <!-- Brak urządzenia -->
    <div v-if="!hasDevice" class="text-center py-12">
      <Smartphone class="w-16 h-16 text-amber-500 mx-auto mb-4" />
      <h2 class="text-xl font-bold text-gray-900 mb-2">Urządzenie niezarejestrowane</h2>
      <p class="text-gray-500 mb-4">
        Aby rejestrować obecność, musisz najpierw zarejestrować to urządzenie.
        Poproś wykładowcę o link rejestracyjny.
      </p>
      <button
        @click="router.push({ name: 'register-device' })"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        Zarejestruj urządzenie
      </button>
    </div>

    <template v-else>
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-100 mb-3">
          <QrCode class="w-7 h-7 text-green-600" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Rejestrowanie obecności</h1>
        <p class="text-gray-500 text-sm mt-1">
          Zbliż telefon do kamery urządzenia skanującego
        </p>
      </div>

      <ErrorMessage v-if="error" :message="error" @retry="fetchTicket" />

      <!-- Ładowanie -->
      <div
        v-else-if="loading"
        class="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col items-center gap-3"
      >
        <Loader2 class="w-8 h-8 text-indigo-600 animate-spin" />
        <p class="text-gray-500 text-sm">Generowanie kodu QR...</p>
      </div>

      <!-- Kod QR -->
      <div
        v-else-if="ticket"
        class="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col items-center"
      >
        <!-- Komunikat o zarejestrowanej obecności -->
        <div
          v-if="registered"
          class="mb-4 bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2"
        >
          <CheckCircle2 class="w-4 h-4" /> Obecność zarejestrowana!
        </div>

        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <QrCodeComponent :value="ticket" :size="250" />
        </div>
        <div class="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <Loader2 class="w-4 h-4 animate-spin text-indigo-500" />
          Kod odświeżany co 2 sekundy
        </div>
      </div>
    </template>
  </div>
</template>
