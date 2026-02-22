export interface User {
  id: number
  loginName: string
  firstName: string
  lastName: string
  indexNo?: string
  roles: string[]
}

export interface TokenResult {
  token: string
  validTo: string
  lastAttendance?: AttendanceInfo
}

export interface AttendanceInfo {
  userId: number
  userName: string
  sessionId: number
  timestamp: string
}

export interface CourseSessionListItem {
  sessionId: number
  courseId: number
  courseName: string
  courseGroupId: number
  groupName: string
  sessionDate: string
  startTime: string
  endTime: string
  location?: string
  isRemote: boolean
  attendanceStatus?: string
}

export interface CourseSessionListFiltersPagedListParams {
  pageNumber: number
  pageSize: number
  text?: string
  dateFrom?: string
  dateTo?: string
}

export interface CourseSessionListItemPagedList {
  items: CourseSessionListItem[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

export interface CourseSessionAttendanceRecord {
  userId: number
  firstName: string
  lastName: string
  indexNo: string
  isPresent: boolean
  attendanceTime?: string
}

export interface AttendanceLog {
  sessionId: number
  sessionDate: string
  startTime: string
  endTime: string
  isPresent: boolean
  attendanceTime?: string
}

export interface DeviceRegisterDTO {
  deviceName: string
  deviceIdentifier: string
}