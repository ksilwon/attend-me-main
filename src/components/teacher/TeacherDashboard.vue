<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { courseTeacherSessionsGet } from '@/api/endpoints'
import type { CourseSessionListItem } from '@/api/types'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import SessionFilters from '@/components/common/SessionFilters.vue'

const router = useRouter()

const allSessions = ref<CourseSessionListItem[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const filters = ref({
  dateFilter: 'all',
  searchText: ''
})

const getDateRange = (filter: string): { dateFrom?: string; dateTo?: string } => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0] ?? ''
  }

  switch (filter) {
    case 'today':
      return {
        dateFrom: formatDate(today),
        dateTo: formatDate(today)
      }
    case 'tomorrow': {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return {
        dateFrom: formatDate(tomorrow),
        dateTo: formatDate(tomorrow)
      }
    }
    case 'week': {
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)
      return {
        dateFrom: formatDate(today),
        dateTo: formatDate(nextWeek)
      }
    }
    case 'past': {
      const pastDate = new Date('2020-01-01')
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return {
        dateFrom: formatDate(pastDate),
        dateTo: formatDate(yesterday)
      }
    }
    default:
      return {}
  }
}

const getSessionDateStr = (s: CourseSessionListItem): string => {
  const raw = s.sessionDate ?? s.dateStart ?? ''
  if (!raw) return ''
  const d = new Date(raw)
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0] ?? ''
}

const sessions = computed(() => {
  const list = allSessions.value
  const dateFilter = filters.value.dateFilter
  const searchText = (filters.value.searchText || '').trim().toLowerCase()
  const range = getDateRange(dateFilter)

  return list.filter((s) => {
    if (dateFilter !== 'all' && range.dateFrom && range.dateTo) {
      const sessionDate = getSessionDateStr(s)
      if (!sessionDate || sessionDate < range.dateFrom || sessionDate > range.dateTo) {
        return false
      }
    }
    if (searchText) {
      const courseName = (s.courseName ?? '').toLowerCase()
      const groupName = (s.groupName ?? s.courseGroupName ?? '').toLowerCase()
      const location = (s.location ?? s.locationName ?? '').toLowerCase()
      const match = courseName.includes(searchText) || groupName.includes(searchText) || location.includes(searchText)
      if (!match) return false
    }
    return true
  })
})

const fetchSessions = async () => {
  loading.value = true
  error.value = null

  try {
    const result = await courseTeacherSessionsGet({
      pageNumber: 1,
      pageSize: 999999
    })
    allSessions.value = result.items || []
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Błąd pobierania listy zajęć'
    console.error('Błąd:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (s: CourseSessionListItem): string => {
  const start = s.startTime ?? (s.dateStart ? new Date(s.dateStart).toTimeString().slice(0, 5) : '')
  const end = s.endTime ?? (s.dateEnd ? new Date(s.dateEnd).toTimeString().slice(0, 5) : '')
  return `${start} - ${end}`
}

const sessionDate = (s: CourseSessionListItem) => s.sessionDate ?? s.dateStart ?? ''
const sessionLocation = (s: CourseSessionListItem) =>
  s.isRemote ? 'Zdalnie' : (s.location ?? s.locationName ?? 'Brak informacji')
const sessionGroup = (s: CourseSessionListItem) => s.groupName ?? s.courseGroupName ?? ''

const getSessionId = (s: CourseSessionListItem) =>
  s.sessionId ?? s.courseSessionId ?? 0

const goToSession = (s: CourseSessionListItem) => {
  router.push({ name: 'teacher-session', params: { id: String(getSessionId(s)) } })
}

onMounted(() => {
  fetchSessions()
})
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>
        <i class="bi bi-calendar-check me-2"></i>
        Moje zajęcia
      </h2>
      <button class="btn btn-outline-primary" @click="fetchSessions" :disabled="loading">
        <i class="bi bi-arrow-clockwise me-1"></i>
        Odśwież
      </button>
    </div>

    <SessionFilters v-model="filters" />

    <LoadingSpinner v-if="loading" message="Ładowanie zajęć..." />

    <div v-else-if="error" class="alert alert-danger">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ error }}
    </div>

    <div v-else-if="sessions.length === 0" class="text-center py-5">
      <i class="bi bi-calendar-x display-1 text-muted"></i>
      <p class="mt-3 text-muted">Brak zajęć dla wybranych filtrów</p>
    </div>

    <div v-else class="row">
      <div
        v-for="session in sessions"
        :key="session.sessionId"
        class="col-md-6 col-lg-4 mb-4"
      >
        <div
          class="card h-100 session-card"
          @click="goToSession(session)"
          style="cursor: pointer"
        >
          <div class="card-body">
            <h5 class="card-title text-primary">
              {{ session.courseName }}
            </h5>
            <h6 class="card-subtitle mb-2 text-muted">
              <i class="bi bi-people me-1"></i>
              {{ sessionGroup(session) }}
            </h6>

            <hr />

            <p class="mb-2">
              <i class="bi bi-calendar-event me-2 text-primary"></i>
              {{ formatDate(sessionDate(session)) }}
            </p>
            <p class="mb-2">
              <i class="bi bi-clock me-2 text-primary"></i>
              {{ formatTime(session) }}
            </p>
            <p class="mb-0">
              <i class="bi bi-geo-alt me-2 text-primary"></i>
              <span v-if="session.isRemote" class="badge bg-info">Zdalnie</span>
              <span v-else>{{ sessionLocation(session) }}</span>
            </p>
          </div>
          <div class="card-footer bg-transparent">
            <small class="text-muted">
              Kliknij, aby zobaczyć szczegóły
              <i class="bi bi-chevron-right"></i>
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.session-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.session-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}
</style>