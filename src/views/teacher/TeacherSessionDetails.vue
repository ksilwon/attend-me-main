<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiClient } from '@/api/client'
import type { CourseSessionListItem, CourseSessionAttendanceRecord } from '@/types/api'
import { formatDateTime } from '@/utils/dateFilters'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import {
  ArrowLeft, RefreshCw, ScanLine, Copy, Check, ExternalLink,
  UserCheck, UserX, MapPin, Monitor, Calendar, Users,
} from 'lucide-vue-next'

const props = defineProps<{ sessionId: string }>()

const router = useRouter()
const session = ref<CourseSessionListItem | null>(null)
const attendance = ref<CourseSessionAttendanceRecord[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const refreshing = ref(false)
const copied = ref(false)
const scannerLink = ref('')

const id = Number(props.sessionId)

/** Pobieranie danych zajęć i listy obecności */
async function fetchData(): Promise<void> {
  try {
    const [sess, att] = await Promise.all([
      apiClient.courseTeacherSessionGet(id),
      apiClient.courseSessionAttendanceListGet(id),
    ])
    session.value = sess
    attendance.value = att
    error.value = null
  } catch {
    error.value = 'Nie udało się pobrać danych zajęć.'
  }
}

onMounted(async () => {
  await fetchData()
  loading.value = false
})

// Auto-odświeżanie co 15 sekund
let refreshInterval: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  refreshInterval = setInterval(fetchData, 15000)
})
onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})

async function handleRefresh(): Promise<void> {
  refreshing.value = true
  await fetchData()
  refreshing.value = false
}

/** Generowanie i kopiowanie linku skanera */
async function copyScannerLink(): Promise<void> {
  try {
    const result = await apiClient.courseSessionAttendanceScannerTokenGet(id)
    const url = `${window.location.origin}${window.location.pathname}#/scanner/${props.sessionId}?token=${result.token}`
    scannerLink.value = url
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2500)
  } catch {
    error.value = 'Nie udało się wygenerować linku skanera.'
  }
}

function openScanner(): void {
  router.push({ name: 'scanner', params: { sessionId: props.sessionId } })
}

// Zliczanie obecnych
function presentCount(): number {
  return attendance.value.filter((a) => a.isPresent).length
}
</script>

<template>
  <div>
    <button
      @click="router.back()"
      class="flex items-center gap-1 text-gray-500 hover:text-indigo-600 text-sm mb-4 transition"
    >
      <ArrowLeft class="w-4 h-4" />
      Powrót
    </button>

    <LoadingSpinner v-if="loading" message="Ładowanie szczegółów zajęć..." />
    <ErrorMessage v-else-if="error && !session" :message="error" @retry="fetchData" />

    <template v-else-if="session">
      <!-- Nagłówek zajęć -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h1 class="text-xl font-bold text-gray-900 mb-3">{{ session.courseName }}</h1>
        <div class="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
          <span class="flex items-center gap-1.5">
            <Users class="w-4 h-4 text-indigo-500" />
            {{ session.courseGroupName }}
          </span>
          <span class="flex items-center gap-1.5">
            <Calendar class="w-4 h-4 text-indigo-500" />
            {{ formatDateTime(session.sessionDate, session.startTime) }}
            <template v-if="session.endTime"> – {{ session.endTime.substring(0, 5) }}</template>
          </span>
          <span class="flex items-center gap-1.5">
            <template v-if="session.isRemote">
              <Monitor class="w-4 h-4 text-indigo-500" />
              Zdalnie
            </template>
            <template v-else>
              <MapPin class="w-4 h-4 text-indigo-500" />
              {{ session.location || 'Brak sali' }}
            </template>
          </span>
        </div>

        <!-- Akcje -->
        <div class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
          <button
            @click="openScanner"
            class="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
          >
            <ScanLine class="w-4 h-4" />
            Otwórz skaner
          </button>
          <button
            @click="copyScannerLink"
            class="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
          >
            <Check v-if="copied" class="w-4 h-4 text-green-500" />
            <Copy v-else class="w-4 h-4" />
            {{ copied ? 'Skopiowano!' : 'Kopiuj link skanera' }}
          </button>
          <a
            v-if="scannerLink"
            :href="scannerLink"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
          >
            <ExternalLink class="w-4 h-4" />
            Otwórz w nowej karcie
          </a>
        </div>
      </div>

      <!-- Lista obecności -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 class="font-semibold text-gray-900">Lista obecności</h2>
            <p class="text-sm text-gray-500 mt-0.5">
              Obecni: {{ presentCount() }} / {{ attendance.length }}
            </p>
          </div>
          <button
            @click="handleRefresh"
            :disabled="refreshing"
            class="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
          >
            <RefreshCw :class="['w-4 h-4', refreshing ? 'animate-spin' : '']" />
            Odśwież
          </button>
        </div>

        <div v-if="attendance.length === 0" class="text-center py-8 text-gray-400 text-sm">
          Brak studentów na liście.
        </div>

        <div v-else class="divide-y divide-gray-50">
          <div
            v-for="record in attendance"
            :key="record.userId"
            class="px-6 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <div class="flex items-center gap-3">
              <div
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  record.isPresent ? 'bg-green-100' : 'bg-gray-100',
                ]"
              >
                <UserCheck v-if="record.isPresent" class="w-4 h-4 text-green-600" />
                <UserX v-else class="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{ record.firstName }} {{ record.lastName }}
                </p>
                <p class="text-xs text-gray-500">Nr indeksu: {{ record.indexNumber }}</p>
              </div>
            </div>
            <span
              :class="[
                'text-xs font-medium px-2.5 py-1 rounded-full',
                record.isPresent
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500',
              ]"
            >
              {{ record.isPresent ? 'Obecny' : 'Nieobecny' }}
            </span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
