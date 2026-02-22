import type { CourseSessionListItem, CourseSessionAttendanceRecord, User } from '@/api/types'

export function normalizeSession(s: CourseSessionListItem): {
  sessionId: number
  courseName: string
  groupName: string
  sessionDate: string
  startTime: string
  endTime: string
  location: string
  isRemote: boolean
  attendanceStatus?: string
} {
  const sessionId = s.sessionId ?? s.courseSessionId ?? 0
  const sessionDate = s.sessionDate ?? s.dateStart ?? ''
  const startTime = s.startTime ?? (s.dateStart ? new Date(s.dateStart).toTimeString().slice(0, 5) : '')
  const endTime = s.endTime ?? (s.dateEnd ? new Date(s.dateEnd).toTimeString().slice(0, 5) : '')
  const groupName = s.groupName ?? s.courseGroupName ?? ''
  const location = s.location ?? s.locationName ?? ''
  return {
    sessionId,
    courseName: s.courseName,
    groupName,
    sessionDate,
    startTime,
    endTime,
    location,
    isRemote: s.isRemote ?? false,
    attendanceStatus: s.attendanceStatus
  }
}

export function normalizeAttendanceRecord(r: CourseSessionAttendanceRecord): {
  userId: number
  firstName: string
  lastName: string
  indexNo: string
  isPresent: boolean
  attendanceTime?: string
} {
  const userId = r.userId ?? r.attenderUserId ?? 0
  const firstName = r.firstName ?? r.userName ?? ''
  const lastName = r.lastName ?? r.userSurname ?? ''
  const indexNo = r.indexNo ?? (r.studentAlbumIdNumber != null ? String(r.studentAlbumIdNumber) : '')
  const isPresent = r.isPresent ?? r.wasUserPresent ?? false
  const attendanceTime = r.attendanceTime ?? r.attendanceLogMinDateCreated
  return { userId, firstName, lastName, indexNo, isPresent, attendanceTime }
}

export function normalizeUser(u: User): {
  id: number
  loginName: string
  firstName: string
  lastName: string
  roles: string[]
} {
  const id = u.id ?? u.userId ?? 0
  const firstName = u.firstName ?? u.name ?? ''
  const lastName = u.lastName ?? u.surname ?? ''
  const roles = u.roles ?? []
  return {
    id,
    loginName: u.loginName,
    firstName,
    lastName,
    roles
  }
}
