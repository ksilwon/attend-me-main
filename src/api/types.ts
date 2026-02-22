/** Zgodne z backendem: userId, loginName, name, surname, isTeacher, isStudent, isAdmin */
export interface User {
  id?: number
  userId?: number
  loginName: string
  firstName?: string
  lastName?: string
  name?: string
  surname?: string
  indexNo?: string
  roles?: string[]
}

export interface TokenResult {
  token: string
  validTo?: string
  expires?: string
  lastAttendance?: AttendanceInfo
}

export interface AttendanceInfo {
  userId: number
  userName: string
  sessionId: number
  timestamp: string
}

/** Backend może zwracać courseSessionId, dateStart, dateEnd, courseGroupName, locationName */
export interface CourseSessionListItem {
  sessionId?: number
  courseSessionId?: number
  courseId: number
  courseName: string
  courseGroupId: number
  groupName?: string
  courseGroupName?: string
  sessionDate?: string
  dateStart?: string
  dateEnd?: string
  startTime?: string
  endTime?: string
  location?: string
  locationName?: string
  isRemote?: boolean
  attendanceStatus?: string
}

/** Filtr listy zajęć – backend oczekuje tych pól w obiekcie "filters" */
export interface CourseSessionListFilters {
  search?: string | null
  courseName?: string | null
  courseGroupName?: string | null
  locationName?: string | null
  dateStart?: string | null
  dateEnd?: string | null
}

export interface CourseSessionListFiltersPagedListParams {
  pageNumber: number
  pageSize: number
  filters?: CourseSessionListFilters
  sortBy?: string | null
}

export interface CourseSessionListItemPagedList {
  items: CourseSessionListItem[]
  totalCount: number
  pageNumber: number
  pageSize: number
}

/** Backend: userName, userSurname, studentAlbumIdNumber, wasUserPresent, attendanceLogMinDateCreated */
export interface CourseSessionAttendanceRecord {
  userId?: number
  attenderUserId?: number
  firstName?: string
  lastName?: string
  userName?: string
  userSurname?: string
  indexNo?: string
  studentAlbumIdNumber?: number
  isPresent?: boolean
  wasUserPresent?: boolean
  attendanceTime?: string
  attendanceLogMinDateCreated?: string
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