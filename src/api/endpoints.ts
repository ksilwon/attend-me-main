import http from './http'
import type {
  User,
  TokenResult,
  CourseSessionListItem,
  CourseSessionListFiltersPagedListParams,
  CourseSessionListItemPagedList,
  CourseSessionAttendanceRecord,
  AttendanceLog,
  DeviceRegisterDTO
} from './types'

/**
 * Endpointy API zgodne ze specyfikacją OpenAPI backendu AttendMe
 * (https://attendme-backend.runasp.net/swagger/v1/swagger.json)
 */

// ============ AUTENTYKACJA ============
// userLogin(loginName: string, password: string): Promise<TokenResult>

export const userLogin = async (loginName: string, password: string): Promise<TokenResult> => {
  const url = `/user/login?loginName=${encodeURIComponent(loginName)}&password=${encodeURIComponent(password)}`
  const response = await http.post<TokenResult>(url)
  return response.data
}

// userGet(userId: number | undefined): Promise<User>
export const userGet = async (userId?: number): Promise<User> => {
  const url = userId !== undefined ? `/user/get?userId=${userId}` : '/user/get'
  const response = await http.get<User>(url)
  return response.data
}

// ============ WYKŁADOWCA ============
// courseTeacherSessionsGet(body): Promise<CourseSessionListItemPagedList>

export const courseTeacherSessionsGet = async (
  params: CourseSessionListFiltersPagedListParams
): Promise<CourseSessionListItemPagedList> => {
  const response = await http.post<CourseSessionListItemPagedList>(
    '/course/teacher/sessions/get',
    params
  )
  return response.data
}

// courseTeacherSessionGet(sessionId): Promise<CourseSessionListItem>
export const courseTeacherSessionGet = async (sessionId: number): Promise<CourseSessionListItem> => {
  const response = await http.get<CourseSessionListItem>(
    `/course/teacher/session/get?sessionId=${sessionId}`
  )
  return response.data
}

// courseSessionAttendanceListGet(sessionId): Promise<CourseSessionAttendanceRecord[]>
export const courseSessionAttendanceListGet = async (
  sessionId: number
): Promise<CourseSessionAttendanceRecord[]> => {
  const response = await http.get<CourseSessionAttendanceRecord[]>(
    `/course/session/attendance-list/get?sessionId=${sessionId}`
  )
  return response.data
}

// courseSessionAttendanceScannerTokenGet(courseSessionId): Promise<TokenResult>
export const courseSessionAttendanceScannerTokenGet = async (
  courseSessionId: number
): Promise<TokenResult> => {
  const response = await http.get<TokenResult>(
    `/course/session/attendance/scanner/token/get?courseSessionId=${courseSessionId}`
  )
  return response.data
}

// courseSessionAttendanceRegister(attenderToken, scannerToken): Promise<User>
// Backend: GET /course/session/attendance/register?attenderToken=... z nagłówkiem Authorization: Bearer <scannerToken>
export const courseSessionAttendanceRegister = async (
  attenderToken: string,
  scannerToken: string
): Promise<User> => {
  const response = await http.get<User>(
    `/course/session/attendance/register?attenderToken=${encodeURIComponent(attenderToken)}`,
    {
      headers: {
        Authorization: `Bearer ${scannerToken}`
      }
    }
  )
  return response.data
}

// ============ STUDENT ============
// courseStudentSessionsGet(body): Promise<CourseSessionListItemPagedList>

export const courseStudentSessionsGet = async (
  params: CourseSessionListFiltersPagedListParams
): Promise<CourseSessionListItemPagedList> => {
  const response = await http.post<CourseSessionListItemPagedList>(
    '/course/student/sessions/get',
    params
  )
  return response.data
}

// courseStudentGroupSessionsGet(courseGroupId): Promise<CourseSessionListItem[]>
export const courseStudentGroupSessionsGet = async (
  courseGroupId: number
): Promise<CourseSessionListItem[]> => {
  const response = await http.get<CourseSessionListItem[]>(
    `/course/student/group/sessions/get?courseGroupId=${courseGroupId}`
  )
  return response.data
}

// courseStudentAttendanceGet(courseGroupId): Promise<AttendanceLog[]>
export const courseStudentAttendanceGet = async (
  courseGroupId: number
): Promise<AttendanceLog[]> => {
  const response = await http.get<AttendanceLog[]>(
    `/course/student/attendance/get?courseGroupId=${courseGroupId}`
  )
  return response.data
}

// userAttendanceTicketGet(): Promise<TokenResult> – wymaga tokenu urządzenia (device token)
export const userAttendanceTicketGet = async (): Promise<TokenResult> => {
  const response = await http.get<TokenResult>('/user/attendance/ticket/get')
  return response.data
}

// ============ REJESTRACJA URZĄDZENIA ============
// userDeviceRegisterWithToken(token, data): Promise<TokenResult>

export const userDeviceRegisterWithToken = async (
  token: string,
  data: DeviceRegisterDTO
): Promise<TokenResult> => {
  const response = await http.post<TokenResult>(
    `/user/device/register?token=${encodeURIComponent(token)}`,
    data
  )
  return response.data
}

// userDeviceRegisterTokenGet(deviceUserId): Promise<TokenResult> – dla wykładowcy (generowanie linku)
export const userDeviceRegisterTokenGet = async (
  deviceUserId?: number
): Promise<TokenResult> => {
  const url = deviceUserId !== undefined
    ? `/user/device/register/token/get?deviceUserId=${deviceUserId}`
    : '/user/device/register/token/get'
  const response = await http.get<TokenResult>(url)
  return response.data
}

// deviceAuthReset() – zerowanie tokenu urządzenia po stronie klienta (localStorage)
// Opcjonalnie: wywołanie backendu POST /user/device/reset?deviceUserId=... (wymaga roli teacher)
export const userDeviceReset = async (deviceUserId?: number): Promise<void> => {
  const url = deviceUserId !== undefined
    ? `/user/device/reset?deviceUserId=${deviceUserId}`
    : '/user/device/reset'
  await http.post(url)
}