<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiClient } from '@/api/client'
import type { CourseSessionListItem, AttendanceLog } from '@/types/api'
import { formatDateTime } from '@/utils/dateFilters'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import {
  ArrowLeft, RefreshCw, QrCode, CheckCircle2, XCircle,
  MapPin, Monitor, Calendar, Users, BarChart3,
} from 'lucide-vue-next'

const props = defineProps<{
  courseGroupId: string
  sessionId: string
}>()

const router = useRouter()

const sessions = ref<CourseSessionListItem[]>([])
const attendance = ref<AttendanceLog[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const refreshing = ref(false)

const groupId = Number(props.courseGroupId)
const sessId = Number(props.sessionId)
const hasDevice = !!apiClient.deviceToken

/** Bieżące zajęcia */
const currentSession = computed(() =>
  sessions.value.find((s) => s.id === sessId)
)

/** Obecność na bieżących zajęciach */
const currentAttendance = computed(() =>
  attendance.value.find((a) => a.sessionId === sessId)
)

/** Statystyki */
const totalSessions = computed(() => sessions.value.length)
const completedSessions = computed(() => attendance.value.length)
const presentCount = computed(() => attendance.value.filter((a) => a.isPresent).length)

const progressPercent = computed(() =>
  totalSessions.value > 0
    ? Math.round((completedSessions.value / totalSessions.value) * 100)
    : 0
)
const frequencyPercent = computed(() =>
  completedSessions.value > 0
    ? Math.round((presentCount.value / completedSessions.value) * 100)
    : 0
)

async function fetchData(): Promise<void> {
  try {
    const [sess, att] = await Promise.all([
      apiClient.courseStudentGroupSessionsGet(groupId),
      apiClient.courseStudentAttendanceGet(groupId),
    ])
    sessions.value = sess
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

// Auto-odświeżanie co 15 s
let interval: ReturnType<typeof setInterval> | null = null
onMounted(() => { interval = setInterval(fetchData, 15000) })
onUnmounted(() => { if (interval) clearInterval(interval) })

async function handleRefresh(): Promise<void> {
  refreshing.value = true
  await fetchData()
  refreshing.value = false
}

/** Czy student jest obecny na bieżących zajęciach */
function isPresent(): boolean {
  return (
    currentAttendance.value?.isPresent === true ||
    currentSession.value?.attendanceStatus?.toLowerCase() === 'present'
  )
}
</script>

<template>
  <div>
    <button
      @click="router.back()"
      class="flex items-center gap-1 text-gray-500 hover:text-indigo-600 text-sm mb-4 transition"
    >
      <ArrowLeft class="w-4 h-4" /> Powrót
    </button>

    <LoadingSpinner v-if="loading" message="Ładowanie szczegółów zajęć..." />
    <ErrorMessage v-else-if="error && !currentSession" :message="error!" @retry="fetchData" />

    <template v-else-if="currentSession">
      <!-- Nagłówek zajęć -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h1 class="text-xl font-bold text-gray-900 mb-3">{{ currentSession.courseName }}</h1>
        <div class="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
          <span class="flex items-center gap-1.5">
            <Users class="w-4 h-4 text-indigo-500" /> {{ currentSession.courseGroupName }}
          </span>
          <span class="flex items-center gap-1.5">
            <Calendar class="w-4 h-4 text-indigo-500" />
            {{ formatDateTime(currentSession.sessionDate, currentSession.startTime) }}
            <template v-if="currentSession.endTime">
              – {{ currentSession.endTime.substring(0, 5) }}
            </template>
          </span>
          <span class="flex items-center gap-1.5">
            <template v-if="currentSession.isRemote">
              <Monitor class="w-4 h-4 text-indigo-500" /> Zdalnie
            </template>
            <template v-else>
              <MapPin class="w-4 h-4 text-indigo-500" />
              {{ currentSession.location || 'Brak sali' }}
            </template>
          </span>
        </div>

        <!-- Status + akcje -->
        <div class="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Obecność:</span>
            <span v-if="isPresent()" class="flex items-center gap-1 text-sm font-medium text-green-700">
              <CheckCircle2 class="w-4 h-4" /> Obecny
            </span>
            <span v-else class="flex items-center gap-1 text-sm font-medium text-gray-500">
              <XCircle class="w-4 h-4" /> Nieobecny
            </span>
          </div>
          <div class="flex gap-2">
            <button
              @click="handleRefresh"
              :disabled="refreshing"
              class="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
            >
              <RefreshCw :class="['w-4 h-4', refreshing ? 'animate-spin' : '']" /> Odśwież
            </button>
            <button
              @click="router.push({ name: 'student-attendance' })"
              :disabled="!hasDevice"
              class="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              <QrCode class="w-4 h-4" /> Rejestruj obecność
            </button>
          </div>
        </div>
      </div>

      <!-- Statystyki -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div class="bg-white rounded-xl border border-gray-200 p-4">
          <div class="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <BarChart3 class="w-4 h-4" /> Frekwencja
          </div>
          <div class="text-2xl font-bold text-indigo-600">{{ frequencyPercent }}%</div>
          <div class="text-xs text-gray-400 mt-1">
            {{ presentCount }} z {{ completedSessions }} zajęć
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-4">
          <div class="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Calendar class="w-4 h-4" /> Postęp kursu
          </div>
          <div class="text-2xl font-bold text-indigo-600">{{ progressPercent }}%</div>
          <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              class="bg-indigo-600 h-2 rounded-full transition-all"
              :style="{ width: progressPercent + '%' }"
            />
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-4">
          <div class="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Users class="w-4 h-4" /> Zajęcia
          </div>
          <div class="text-2xl font-bold text-gray-900">{{ totalSessions }}</div>
          <div class="text-xs text-gray-400 mt-1">Odbyte: {{ completedSessions }}</div>
        </div>
      </div>

      <!-- Historia obecności -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-900">Historia obecności</h2>
        </div>

        <div v-if="attendance.length === 0" class="text-center py-8 text-gray-400 text-sm">
          Brak danych o obecności.
        </div>

        <div v-else class="divide-y divide-gray-50">
          <div
            v-for="log in attendance"
            :key="log.sessionId"
            :class="[
              'px-6 py-3 flex items-center justify-between',
              log.sessionId === sessId ? 'bg-indigo-50' : 'hover:bg-gray-50',
            ]"
          >
            <div class="flex items-center gap-3">
              <div
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  log.isPresent ? 'bg-green-100' : 'bg-gray-100',
                ]"
              >
                <CheckCircle2 v-if="log.isPresent" class="w-4 h-4 text-green-600" />
                <XCircle v-else class="w-4 h-4 text-gray-400" />
              </div>
              <p class="text-sm font-medium text-gray-900">
                {{ formatDateTime(log.sessionDate, log.startTime) }}
                <template v-if="log.endTime"> – {{ log.endTime.substring(0, 5) }}</template>
              </p>
            </div>
            <span
              :class="[
                'text-xs font-medium px-2.5 py-1 rounded-full',
                log.isPresent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500',
              ]"
            >
              {{ log.isPresent ? 'Obecny' : 'Nieobecny' }}
            </span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
