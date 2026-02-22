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

export const userLogin = async (loginName: string, password: string): Promise<TokenResult> => {
  const url = `/user/login?loginName=${encodeURIComponent(loginName)}&password=${encodeURIComponent(password)}`
  const response = await http.post<TokenResult>(url)
  return response.data
}

export const userGet = async (userId?: number): Promise<User> => {
  const url = userId !== undefined ? `/user/get?userId=${userId}` : '/user/get'
  const response = await http.get<User>(url)
  return response.data
}

export const courseTeacherSessionsGet = async (
  params: CourseSessionListFiltersPagedListParams
): Promise<CourseSessionListItemPagedList> => {
  const response = await http.post<CourseSessionListItemPagedList>(
    '/course/teacher/sessions/get',
    params
  )
  return response.data
}

export const courseTeacherSessionGet = async (sessionId: number): Promise<CourseSessionListItem> => {
  const response = await http.get<CourseSessionListItem>(
    `/course/teacher/session/get?sessionId=${sessionId}`
  )
  return response.data
}

export const courseSessionAttendanceListGet = async (
  sessionId: number
): Promise<CourseSessionAttendanceRecord[]> => {
  const response = await http.get<CourseSessionAttendanceRecord[]>(
    `/course/session/attendance-list/get?sessionId=${sessionId}`
  )
  return response.data
}

export const courseSessionAttendanceScannerTokenGet = async (
  courseSessionId: number
): Promise<TokenResult> => {
  const response = await http.get<TokenResult>(
    `/course/session/attendance/scanner/token/get?courseSessionId=${courseSessionId}`
  )
  return response.data
}

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

export const courseStudentSessionsGet = async (
  params: CourseSessionListFiltersPagedListParams
): Promise<CourseSessionListItemPagedList> => {
  const response = await http.post<CourseSessionListItemPagedList>(
    '/course/student/sessions/get',
    params
  )
  return response.data
}

export const courseStudentGroupSessionsGet = async (
  courseGroupId: number
): Promise<CourseSessionListItem[]> => {
  const response = await http.get<CourseSessionListItem[]>(
    `/course/student/group/sessions/get?courseGroupId=${courseGroupId}`
  )
  return response.data
}

export const courseStudentAttendanceGet = async (
  courseGroupId: number
): Promise<AttendanceLog[]> => {
  const response = await http.get<AttendanceLog[]>(
    `/course/student/attendance/get?courseGroupId=${courseGroupId}`
  )
  return response.data
}

export const userAttendanceTicketGet = async (): Promise<TokenResult> => {
  const response = await http.get<TokenResult>('/user/attendance/ticket/get')
  return response.data
}

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

export const userDeviceRegisterTokenGet = async (
  deviceUserId?: number
): Promise<TokenResult> => {
  const url = deviceUserId !== undefined
    ? `/user/device/register/token/get?deviceUserId=${deviceUserId}`
    : '/user/device/register/token/get'
  const response = await http.get<TokenResult>(url)
  return response.data
}

export const userDeviceReset = async (deviceUserId?: number): Promise<void> => {
  const url = deviceUserId !== undefined
    ? `/user/device/reset?deviceUserId=${deviceUserId}`
    : '/user/device/reset'
  await http.post(url)
}
