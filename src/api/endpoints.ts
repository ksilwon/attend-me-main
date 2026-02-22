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

// ============ AUTENTYKACJA ============
// userLogin(loginName: string, password: string): Promise<TokenResult>

export const userLogin = async (loginName: string, password: string): Promise<TokenResult> => {
  // Próbuj różne warianty endpointu
  const endpoints = [
    `/api/User/Login?loginName=${encodeURIComponent(loginName)}&password=${encodeURIComponent(password)}`,
    `/User/Login?loginName=${encodeURIComponent(loginName)}&password=${encodeURIComponent(password)}`,
    `/user/login?loginName=${encodeURIComponent(loginName)}&password=${encodeURIComponent(password)}`
  ]

  for (const endpoint of endpoints) {
    try {
      const response = await http.post<TokenResult>(endpoint)
      return response.data
    } catch (err: any) {
      if (err.response?.status !== 404) {
        throw err
      }
    }
  }

  throw new Error('Nie można połączyć z serwerem')
}

// userGet(userId: number | undefined): Promise<User>
export const userGet = async (userId?: number): Promise<User> => {
  const url = userId !== undefined ? `/api/User/Get?userId=${userId}` : '/api/User/Get'
  const response = await http.get<User>(url)
  return response.data
}

// ============ WYKŁADOWCA ============
// courseTeacherSessionsGet(body): Promise<CourseSessionListItemPagedList>

export const courseTeacherSessionsGet = async (
  params: CourseSessionListFiltersPagedListParams
): Promise<CourseSessionListItemPagedList> => {
  const response = await http.post<CourseSessionListItemPagedList>(
    '/api/Course/Teacher/Sessions/Get',
    params
  )
  return response.data
}

// courseTeacherSessionGet(sessionId): Promise<CourseSessionListItem>
export const courseTeacherSessionGet = async (sessionId: number): Promise<CourseSessionListItem> => {
  const response = await http.get<CourseSessionListItem>(
    `/api/Course/Teacher/Session/Get?sessionId=${sessionId}`
  )
  return response.data
}

// courseSessionAttendanceListGet(sessionId): Promise<CourseSessionAttendanceRecord[]>
export const courseSessionAttendanceListGet = async (
  sessionId: number
): Promise<CourseSessionAttendanceRecord[]> => {
  const response = await http.get<CourseSessionAttendanceRecord[]>(
    `/api/Course/Session/Attendance/List/Get?sessionId=${sessionId}`
  )
  return response.data
}

// courseSessionAttendanceScannerTokenGet(courseSessionId): Promise<TokenResult>
export const courseSessionAttendanceScannerTokenGet = async (
  courseSessionId: number
): Promise<TokenResult> => {
  const response = await http.get<TokenResult>(
    `/api/Course/Session/Attendance/Scanner/Token/Get?courseSessionId=${courseSessionId}`
  )
  return response.data
}

// courseSessionAttendanceRegister(attenderToken): Promise<User>
export const courseSessionAttendanceRegister = async (
  attenderToken: string,
  scannerToken: string
): Promise<User> => {
  const response = await http.post<User>(
    `/api/Course/Session/Attendance/Register?attenderToken=${encodeURIComponent(attenderToken)}`,
    {},
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
    '/api/Course/Student/Sessions/Get',
    params
  )
  return response.data
}

// courseStudentGroupSessionsGet(courseGroupId): Promise<CourseSessionListItem[]>
export const courseStudentGroupSessionsGet = async (
  courseGroupId: number
): Promise<CourseSessionListItem[]> => {
  const response = await http.get<CourseSessionListItem[]>(
    `/api/Course/Student/Group/Sessions/Get?courseGroupId=${courseGroupId}`
  )
  return response.data
}

// courseStudentAttendanceGet(courseGroupId): Promise<AttendanceLog[]>
export const courseStudentAttendanceGet = async (
  courseGroupId: number
): Promise<AttendanceLog[]> => {
  const response = await http.get<AttendanceLog[]>(
    `/api/Course/Student/Attendance/Get?courseGroupId=${courseGroupId}`
  )
  return response.data
}

// userAttendanceTicketGet(): Promise<TokenResult>
export const userAttendanceTicketGet = async (): Promise<TokenResult> => {
  const response = await http.get<TokenResult>('/api/User/Attendance/Ticket/Get')
  return response.data
}

// ============ REJESTRACJA URZĄDZENIA ============
// userDeviceRegisterWithToken(token, data): Promise<TokenResult>

export const userDeviceRegisterWithToken = async (
  token: string,
  data: DeviceRegisterDTO
): Promise<TokenResult> => {
  const response = await http.post<TokenResult>(
    `/api/User/Device/Register?token=${encodeURIComponent(token)}`,
    data
  )
  return response.data
}