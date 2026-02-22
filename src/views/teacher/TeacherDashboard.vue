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
import { MapPin, Monitor, Calendar, Users } from 'lucide-vue-next'

const router = useRouter()

const sessions = ref<CourseSessionListItem[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const timeFilter = ref<TimeFilter>('all')
const searchText = ref('')

async function fetchSessions(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    const dateRange = getDateRange(timeFilter.value)
    const result = await apiClient.courseTeacherSessionsGet({
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

function openSession(session: CourseSessionListItem): void {
  router.push({ name: 'teacher-session', params: { sessionId: session.id } })
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Pulpit Wykładowcy</h1>
      <p class="text-gray-500 text-sm mt-1">Lista prowadzonych zajęć</p>
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
        <h3
          class="font-semibold text-gray-900 group-hover:text-indigo-700 transition truncate"
        >
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
            <template v-if="session.endTime"> – {{ session.endTime.substring(0, 5) }}</template>
          </span>
          <span class="flex items-center gap-1">
            <template v-if="session.isRemote">
              <Monitor class="w-3.5 h-3.5" />
              Zdalnie
            </template>
            <template v-else>
              <MapPin class="w-3.5 h-3.5" />
              {{ session.location || 'Brak sali' }}
            </template>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
