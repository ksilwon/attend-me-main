<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { courseStudentSessionsGet } from '@/api/endpoints'
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
      return { dateFrom: formatDate(today), dateTo: formatDate(today) }
    case 'tomorrow': {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return { dateFrom: formatDate(tomorrow), dateTo: formatDate(tomorrow) }
    }
    case 'week': {
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)
      return { dateFrom: formatDate(today), dateTo: formatDate(nextWeek) }
    }
    case 'past': {
      const pastDate = new Date('2020-01-01')
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return { dateFrom: formatDate(pastDate), dateTo: formatDate(yesterday) }
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
    const result = await courseStudentSessionsGet({
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
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatTime = (s: CourseSessionListItem): string => {
  const start = s.startTime ?? (s.dateStart ? new Date(s.dateStart).toTimeString().slice(0, 5) : '')
  const end = s.endTime ?? (s.dateEnd ? new Date(s.dateEnd).toTimeString().slice(0, 5) : '')
  return `${start} - ${end}`
}

const sessionDateStr = (s: CourseSessionListItem) => s.sessionDate ?? s.dateStart ?? ''

const getAttendanceStatus = (status?: string): { text: string; class: string } => {
  switch (status?.toLowerCase()) {
    case 'present':
      return { text: 'Obecny', class: 'bg-success' }
    case 'absent':
      return { text: 'Nieobecny', class: 'bg-danger' }
    default:
      return { text: 'Brak danych', class: 'bg-secondary' }
  }
}

const getSessionId = (s: CourseSessionListItem) => s.sessionId ?? s.courseSessionId ?? 0

const goToSession = (session: CourseSessionListItem) => {
  router.push({
    name: 'student-session',
    params: {
      id: String(getSessionId(session)),
      groupId: String(session.courseGroupId)
    }
  })
}

const goToAttendance = () => {
  router.push({ name: 'attendance' })
}

onMounted(() => {
  fetchSessions()
})
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>
        <i class="bi bi-book me-2"></i>
        Moje zajęcia
      </h2>
      <div>
        <button class="btn btn-success me-2" @click="goToAttendance">
          <i class="bi bi-qr-code me-1"></i>
          Rejestruj obecność
        </button>
        <button class="btn btn-outline-primary" @click="fetchSessions" :disabled="loading">
          <i class="bi bi-arrow-clockwise me-1"></i>
          Odśwież
        </button>
      </div>
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

    <div v-else class="list-group">
      <div
        v-for="session in sessions"
        :key="session.sessionId"
        class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
        style="cursor: pointer"
        @click="goToSession(session)"
      >
        <div>
          <h5 class="mb-1">{{ session.courseName }}</h5>
          <p class="mb-1 text-muted">
            <i class="bi bi-calendar-event me-1"></i>
            {{ formatDate(sessionDateStr(session)) }}
            <span class="ms-2">
              <i class="bi bi-clock me-1"></i>
              {{ formatTime(session) }}
            </span>
          </p>
          <small>
            <i class="bi bi-geo-alt me-1"></i>
            <span v-if="session.isRemote">Zdalnie</span>
            <span v-else>{{ session.location ?? session.locationName ?? 'Brak lokalizacji' }}</span>
          </small>
        </div>
        <div class="text-end">
          <span
            class="badge"
            :class="getAttendanceStatus(session.attendanceStatus).class"
          >
            {{ getAttendanceStatus(session.attendanceStatus).text }}
          </span>
          <br />
          <small class="text-muted">{{ session.groupName ?? session.courseGroupName }}</small>
        </div>
      </div>
    </div>
  </div>
</template>