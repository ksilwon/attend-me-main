export interface TokenResult {
  token: string
  expiration?: string
}

export interface User {
  id: number
  loginName: string
  firstName: string
  lastName: string
  indexNumber?: string
  roles: string[]
}

export interface CourseSessionListItem {
  id: number
  courseId: number
  courseName: string
  courseGroupId: number
  courseGroupName: string
  sessionDate: string
  startTime: string
  endTime: string
  location: string
  isRemote: boolean
  teacherName?: string
  attendanceStatus?: string
}

export interface CourseSessionListItemPagedList {
  items: CourseSessionListItem[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export interface CourseSessionListFiltersPagedListParams {
  pageNumber: number
  pageSize: number
  dateFrom?: string
  dateTo?: string
  searchText?: string
}

export interface CourseSessionAttendanceRecord {
  userId: number
  firstName: string
  lastName: string
  indexNumber: string
  isPresent: boolean
  registeredAt?: string
}

export interface AttendanceLog {
  sessionId: number
  sessionDate: string
  startTime: string
  endTime: string
  isPresent: boolean
  registeredAt?: string
}

export interface DeviceRegisterDTO {
  deviceName: string
  deviceType?: string
}
