<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  courseTeacherSessionGet,
  courseSessionAttendanceListGet
} from '@/api/endpoints'
import type { CourseSessionListItem, CourseSessionAttendanceRecord } from '@/api/types'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()

const session = ref<CourseSessionListItem | null>(null)
const attendanceList = ref<CourseSessionAttendanceRecord[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const linkCopied = ref(false)

const sessionId = computed(() => Number(route.params.id))

const scannerLink = computed(() => {
  const baseUrl = window.location.origin + window.location.pathname
  return `${baseUrl}#/scan/${sessionId.value}`
})

const presentCount = computed(() => 
  attendanceList.value.filter(a => a.isPresent).length
)

const absentCount = computed(() => 
  attendanceList.value.filter(a => !a.isPresent).length
)

const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    const [sessionData, attendanceData] = await Promise.all([
      courseTeacherSessionGet(sessionId.value),
      courseSessionAttendanceListGet(sessionId.value)
    ])
    session.value = sessionData
    attendanceList.value = attendanceData
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
  return `${startTime.substring(0, 5)} - ${endTime.substring(0, 5)}`
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(scannerLink.value)
    linkCopied.value = true
    setTimeout(() => {
      linkCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Błąd kopiowania:', err)
  }
}

const openScanner = () => {
  router.push({ name: 'scanner', params: { sessionId: sessionId.value } })
}

const goBack = () => {
  router.push({ name: 'dashboard' })
}

// Auto-odświeżanie co 30 sekund
let refreshInterval: number | null = null

onMounted(() => {
  fetchData()
  refreshInterval = window.setInterval(fetchData, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
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
      <button class="btn btn-outline-primary" @click="fetchData" :disabled="loading">
        <i class="bi bi-arrow-clockwise me-1"></i>
        Odśwież
      </button>
    </div>

    <!-- Ładowanie -->
    <LoadingSpinner v-if="loading && !session" message="Ładowanie szczegółów zajęć..." />

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
                <strong>Grupa:</strong> {{ session.groupName }}
              </p>
            </div>
            <div class="col-md-4">
              <p class="mb-2">
                <i class="bi bi-calendar-event me-2 text-primary"></i>
                <strong>Data:</strong> {{ formatDate(session.sessionDate) }}
              </p>
            </div>
            <div class="col-md-4">
              <p class="mb-2">
                <i class="bi bi-clock me-2 text-primary"></i>
                <strong>Godzina:</strong> {{ formatTime(session.startTime, session.endTime) }}
              </p>
            </div>
          </div>
          <p class="mb-0">
            <i class="bi bi-geo-alt me-2 text-primary"></i>
            <strong>Lokalizacja:</strong>
            <span v-if="session.isRemote" class="badge bg-info ms-1">Zdalnie</span>
            <span v-else class="ms-1">{{ session.location || 'Brak informacji' }}</span>
          </p>
        </div>
      </div>

      <!-- Akcje skanowania -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-qr-code-scan me-2"></i>
            Skanowanie obecności
          </h5>
        </div>
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-md-8">
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  :value="scannerLink"
                  readonly
                />
                <button
                  class="btn"
                  :class="linkCopied ? 'btn-success' : 'btn-outline-secondary'"
                  @click="copyLink"
                >
                  <i :class="linkCopied ? 'bi bi-check' : 'bi bi-clipboard'"></i>
                  {{ linkCopied ? 'Skopiowano!' : 'Kopiuj' }}
                </button>
              </div>
            </div>
            <div class="col-md-4 text-end">
              <button class="btn btn-primary" @click="openScanner">
                <i class="bi bi-camera me-1"></i>
                Otwórz skaner
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista obecności -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="bi bi-list-check me-2"></i>
            Lista obecności
          </h5>
          <div>
            <span class="badge bg-success me-2">
              Obecni: {{ presentCount }}
            </span>
            <span class="badge bg-danger">
              Nieobecni: {{ absentCount }}
            </span>
          </div>
        </div>
        <div class="card-body p-0">
          <div v-if="attendanceList.length === 0" class="text-center py-4">
            <p class="text-muted mb-0">Brak studentów na liście</p>
          </div>
          <table v-else class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Lp.</th>
                <th>Imię i nazwisko</th>
                <th>Nr indeksu</th>
                <th class="text-center">Status</th>
                <th>Godzina</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in attendanceList" :key="record.userId">
                <td>{{ index + 1 }}</td>
                <td>{{ record.firstName }} {{ record.lastName }}</td>
                <td>{{ record.indexNo }}</td>
                <td class="text-center">
                  <span
                    class="badge"
                    :class="record.isPresent ? 'bg-success' : 'bg-danger'"
                  >
                    {{ record.isPresent ? 'Obecny' : 'Nieobecny' }}
                  </span>
                </td>
                <td>
                  <span v-if="record.attendanceTime">
                    {{ new Date(record.attendanceTime).toLocaleTimeString('pl-PL') }}
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