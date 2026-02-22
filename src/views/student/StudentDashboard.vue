<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiClient } from '@/api/client'
import type { CourseSessionListItem } from '@/types/api'
import type { TimeFilter } from '@/utils/dateFilters'
import { getDateRange, formatDateTime } from '@/utils/dateFilters'
import SessionFilters from '@/components/SessionFilters.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import {
  MapPin, Monitor, Calendar, QrCode, CheckCircle2, XCircle, Users,
} from 'lucide-vue-next'

const router = useRouter()

const sessions = ref<CourseSessionListItem[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const timeFilter = ref<TimeFilter>('all')
const searchText = ref('')

const hasDevice = !!apiClient.deviceToken

async function fetchSessions(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const dateRange = getDateRange(timeFilter.value)
    const result = await apiClient.courseStudentSessionsGet({
      pageNumber: 1,
      pageSize: 999999,
      ...dateRange,
      searchText: searchText.value || undefined,
    })
    sessions.value = result.items ?? []
  } catch {
    error.value = 'Nie udało się pobrać listy zajęć.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchSessions)
watch([timeFilter, searchText], fetchSessions)

function openSession(s: CourseSessionListItem): void {
  router.push({
    name: 'student-session',
    params: { courseGroupId: s.courseGroupId, sessionId: s.id },
  })
}
</script>

<template>
  <div>
    <!-- Nagłówek -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Pulpit Studenta</h1>
        <p class="text-gray-500 text-sm mt-1">Twoje zajęcia i obecności</p>
      </div>
      <button
        @click="router.push({ name: 'student-attendance' })"
        :disabled="!hasDevice"
        :title="!hasDevice ? 'Najpierw zarejestruj urządzenie' : ''"
        class="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        <QrCode class="w-5 h-5" />
        Rejestruj obecność
      </button>
    </div>

    <!-- Ostrzeżenie o braku urządzenia -->
    <div
      v-if="!hasDevice"
      class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-800"
    >
      <strong>Uwaga:</strong> Urządzenie nie jest zarejestrowane. Aby rejestrować obecność,
      otwórz link rejestracyjny od wykładowcy lub przejdź do
      <button
        @click="router.push({ name: 'register-device' })"
        class="underline font-medium hover:text-amber-900"
      >
        rejestracji urządzenia </button>.
    </div>

    <SessionFilters v-model:timeFilter="timeFilter" v-model:searchText="searchText" />

    <LoadingSpinner v-if="loading" message="Ładowanie zajęć..." />
    <ErrorMessage v-else-if="error" :message="error" @retry="fetchSessions" />

    <div v-else-if="sessions.length === 0" class="text-center py-12 text-gray-400">
      <Calendar class="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p>Brak zajęć spełniających kryteria filtrowania.</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="session in sessions"
        :key="session.id"
        @click="openSession(session)"
        class="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-indigo-300 cursor-pointer transition group"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-gray-900 group-hover:text-indigo-700 transition truncate">
              {{ session.courseName }}
            </h3>
            <div class="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-500">
              <span class="flex items-center gap-1">
                <Users class="w-3.5 h-3.5" />
                {{ session.courseGroupName }}
              </span>
              <span class="flex items-center gap-1">
                <Calendar class="w-3.5 h-3.5" />
                {{ formatDateTime(session.sessionDate, session.startTime) }}
                <template v-if="session.endTime">
                  – {{ session.endTime.substring(0, 5) }}
                </template>
              </span>
              <span class="flex items-center gap-1">
                <template v-if="session.isRemote">
                  <Monitor class="w-3.5 h-3.5" /> Zdalnie
                </template>
                <template v-else>
                  <MapPin class="w-3.5 h-3.5" /> {{ session.location || 'Brak sali' }}
                </template>
              </span>
            </div>
          </div>
          <!-- Status obecności -->
          <div class="shrink-0">
            <span
              v-if="session.attendanceStatus?.toLowerCase() === 'present'"
              class="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700"
            >
              <CheckCircle2 class="w-3.5 h-3.5" /> Obecny
            </span>
            <span
              v-else
              class="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500"
            >
              <XCircle class="w-3.5 h-3.5" /> Nieobecny
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
