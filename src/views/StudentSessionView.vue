<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  courseStudentGroupSessionsGet,
  courseStudentAttendanceGet
} from '@/api/endpoints'
import type { CourseSessionListItem, AttendanceLog } from '@/api/types'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()

const session = ref<CourseSessionListItem | null>(null)
const allSessions = ref<CourseSessionListItem[]>([])
const attendanceLog = ref<AttendanceLog[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const sessionId = computed(() => Number(route.params.id))
const groupId = computed(() => Number(route.params.groupId))

// Statystyki frekwencji
const attendanceStats = computed(() => {
  const total = attendanceLog.value.length
  const present = attendanceLog.value.filter(a => a.isPresent).length
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0
  
  // Oblicz zaawansowanie kursu
  const now = new Date()
  const pastSessions = allSessions.value.filter(
    (s) => new Date(s.sessionDate ?? s.dateStart ?? 0) <= now
  ).length
  const totalSessions = allSessions.value.length
  const progress = totalSessions > 0 ? Math.round((pastSessions / totalSessions) * 100) : 0

  return {
    total,
    present,
    absent: total - present,
    percentage,
    progress,
    pastSessions,
    totalSessions
  }
})

const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    const [sessionsData, attendanceData] = await Promise.all([
      courseStudentGroupSessionsGet(groupId.value),
      courseStudentAttendanceGet(groupId.value)
    ])

    allSessions.value = sessionsData
    attendanceLog.value = attendanceData

    // Znajdź bieżącą sesję
    session.value = sessionsData.find(s => s.sessionId === sessionId.value) || null
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Błąd pobierania danych'
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

const formatTime = (startTime: string, endTime: string): string => {
  const s = (startTime || '').substring(0, 5)
  const e = (endTime || '').substring(0, 5)
  return s && e ? `${s} - ${e}` : ''
}

const getSessionTimes = (s: CourseSessionListItem) => ({
  start: s.startTime ?? (s.dateStart ? new Date(s.dateStart).toTimeString().slice(0, 5) : ''),
  end: s.endTime ?? (s.dateEnd ? new Date(s.dateEnd).toTimeString().slice(0, 5) : '')
})

const goBack = () => {
  router.push({ name: 'dashboard' })
}

const goToAttendance = () => {
  router.push({ name: 'attendance' })
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <!-- Nagłówek -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button class="btn btn-outline-secondary" @click="goBack">
        <i class="bi bi-arrow-left me-1"></i>
        Powrót
      </button>
      <div>
        <button class="btn btn-success me-2" @click="goToAttendance">
          <i class="bi bi-qr-code me-1"></i>
          Rejestruj obecność
        </button>
        <button class="btn btn-outline-primary" @click="fetchData" :disabled="loading">
          <i class="bi bi-arrow-clockwise me-1"></i>
          Odśwież
        </button>
      </div>
    </div>

    <!-- Ładowanie -->
    <LoadingSpinner v-if="loading" message="Ładowanie szczegółów zajęć..." />

    <!-- Błąd -->
    <div v-else-if="error" class="alert alert-danger">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ error }}
    </div>

    <!-- Treść -->
    <div v-else-if="session">
      <!-- Sygnatura zajęć -->
      <div class="card mb-4">
        <div class="card-header bg-primary text-white">
          <h4 class="mb-0">
            <i class="bi bi-book me-2"></i>
            {{ session.courseName }}
          </h4>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <p class="mb-2">
                <i class="bi bi-people me-2 text-primary"></i>
                <strong>Grupa:</strong> {{ session.groupName ?? session.courseGroupName }}
              </p>
            </div>
            <div class="col-md-4">
              <p class="mb-2">
                <i class="bi bi-calendar-event me-2 text-primary"></i>
                <strong>Data:</strong> {{ formatDate(session.sessionDate ?? session.dateStart ?? '') }}
              </p>
            </div>
            <div class="col-md-4">
              <p class="mb-2">
                <i class="bi bi-clock me-2 text-primary"></i>
                <strong>Godzina:</strong> {{ formatTime(getSessionTimes(session).start, getSessionTimes(session).end) }}
              </p>
            </div>
          </div>
          <p class="mb-0">
            <i class="bi bi-geo-alt me-2 text-primary"></i>
            <strong>Lokalizacja:</strong>
            <span v-if="session.isRemote" class="badge bg-info ms-1">Zdalnie</span>
            <span v-else class="ms-1">{{ session.location ?? session.locationName ?? 'Brak informacji' }}</span>
          </p>
        </div>
      </div>

      <!-- Statystyki frekwencji -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h3 class="text-primary">{{ attendanceStats.percentage }}%</h3>
              <p class="text-muted mb-0">Frekwencja</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h3 class="text-success">{{ attendanceStats.present }}</h3>
              <p class="text-muted mb-0">Obecności</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h3 class="text-danger">{{ attendanceStats.absent }}</h3>
              <p class="text-muted mb-0">Nieobecności</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h3 class="text-info">{{ attendanceStats.progress }}%</h3>
              <p class="text-muted mb-0">Zaawansowanie kursu</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Pasek postępu -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="d-flex justify-content-between mb-2">
            <span>Zaawansowanie kursu</span>
            <span>{{ attendanceStats.pastSessions }} / {{ attendanceStats.totalSessions }} zajęć</span>
          </div>
          <div class="progress" style="height: 20px;">
            <div
              class="progress-bar bg-info"
              role="progressbar"
              :style="{ width: attendanceStats.progress + '%' }"
            >
              {{ attendanceStats.progress }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Historia obecności -->
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-clock-history me-2"></i>
            Historia obecności
          </h5>
        </div>
        <div class="card-body p-0">
          <div v-if="attendanceLog.length === 0" class="text-center py-4">
            <p class="text-muted mb-0">Brak historii obecności</p>
          </div>
          <table v-else class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Data</th>
                <th>Godzina</th>
                <th class="text-center">Status</th>
                <th>Zarejestrowano</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in attendanceLog" :key="log.sessionId">
                <td>{{ formatDate(log.sessionDate) }}</td>
                <td>{{ formatTime(log.startTime, log.endTime) }}</td>
                <td class="text-center">
                  <span
                    class="badge"
                    :class="log.isPresent ? 'bg-success' : 'bg-danger'"
                  >
                    {{ log.isPresent ? 'Obecny' : 'Nieobecny' }}
                  </span>
                </td>
                <td>
                  <span v-if="log.attendanceTime">
                    {{ new Date(log.attendanceTime).toLocaleTimeString('pl-PL') }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>