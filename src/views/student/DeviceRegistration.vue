<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiClient } from '@/api/client'
import { Smartphone, CheckCircle2, Loader2, ArrowLeft, Trash2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

// Token z query string (?token=...)
const tokenFromUrl = (route.query.token as string) || ''

const token = ref(tokenFromUrl)
const deviceName = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

async function handleSubmit(): Promise<void> {
  if (!token.value.trim()) {
    error.value = 'Token rejestracyjny jest wymagany.'
    return
  }
  if (!deviceName.value.trim()) {
    error.value = 'Podaj nazwę urządzenia.'
    return
  }

  loading.value = true
  error.value = null

  try {
    await apiClient.userDeviceRegisterWithToken(token.value.trim(), {
      deviceName: deviceName.value.trim(),
      deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
    })
    success.value = true
  } catch {
    error.value = 'Nie udało się zarejestrować urządzenia. Sprawdź token i spróbuj ponownie.'
  } finally {
    loading.value = false
  }
}

function handleResetDevice(): void {
  apiClient.deviceAuthReset()
  success.value = false
  error.value = null
}
</script>

<template>
  <div class="max-w-md mx-auto">
    <button
      @click="router.back()"
      class="flex items-center gap-1 text-gray-500 hover:text-indigo-600 text-sm mb-4 transition"
    >
      <ArrowLeft class="w-4 h-4" /> Powrót
    </button>

    <!-- Sukces -->
    <div v-if="success" class="text-center py-12">
      <CheckCircle2 class="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h2 class="text-xl font-bold text-gray-900 mb-2">Urządzenie zarejestrowane!</h2>
      <p class="text-gray-500 mb-6">
        Twoje urządzenie zostało pomyślnie zarejestrowane. Możesz teraz rejestrować obecność.
      </p>
      <button
        @click="router.push('/')"
        class="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium"
      >
        Przejdź do pulpitu
      </button>
    </div>

    <!-- Formularz rejestracji -->
    <template v-else>
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-100 mb-3">
          <Smartphone class="w-7 h-7 text-blue-600" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Rejestracja urządzenia</h1>
        <p class="text-gray-500 text-sm mt-1">
          Zarejestruj to urządzenie, aby móc rejestrować obecność
        </p>
      </div>

      <form
        @submit.prevent="handleSubmit"
        class="bg-white rounded-2xl border border-gray-200 p-6 space-y-4"
      >
        <div
          v-if="error"
          class="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200"
        >
          {{ error }}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Token rejestracyjny</label>
          <input
            v-model="token"
            type="text"
            class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
            placeholder="Wklej token od wykładowcy..."
          />
          <p class="text-xs text-gray-400 mt-1">
            Token otrzymasz od wykładowcy lub z linku rejestracyjnego
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nazwa urządzenia</label>
          <input
            v-model="deviceName"
            type="text"
            class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
            placeholder="np. Mój telefon"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
          {{ loading ? 'Rejestrowanie...' : 'Zarejestruj urządzenie' }}
        </button>
      </form>

      <!-- Reset urządzenia -->
      <div
        v-if="apiClient.deviceToken"
        class="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4"
      >
        <p class="text-sm text-amber-800 mb-2">
          <strong>Uwaga:</strong> To urządzenie jest już zarejestrowane.
        </p>
        <button
          @click="handleResetDevice"
          class="flex items-center gap-1 text-sm text-amber-700 underline hover:text-amber-900"
        >
          <Trash2 class="w-3.5 h-3.5" /> Resetuj rejestrację urządzenia
        </button>
      </div>
    </template>
  </div>
</template>
