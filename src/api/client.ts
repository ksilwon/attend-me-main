import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import type {
  TokenResult,
  User,
  CourseSessionListItemPagedList,
  CourseSessionListFiltersPagedListParams,
  CourseSessionListItem,
  CourseSessionAttendanceRecord,
  AttendanceLog,
  DeviceRegisterDTO,
} from '@/types/api'

const BASE_URL = 'https://attendme-backend.runasp.net'

class AttendMeClient {
  private api: AxiosInstance
  private _userToken: string | null = null
  private _deviceToken: string | null = null
  private _scannerToken: string | null = null

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    })

    this._userToken = sessionStorage.getItem('attendme_user_token')
    this._deviceToken = localStorage.getItem('attendme_device_token')

    this.api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = this.getActiveToken(config.url)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
  }

  private getActiveToken(url?: string): string | null {
    if (url?.includes('/api/User/attendance-ticket')) {
      return this._deviceToken
    }
    if (url?.includes('/api/CourseSession/attendance/register')) {
      return this._scannerToken
    }
    return this._userToken
  }

  get userToken(): string | null {
    return this._userToken
  }

  get deviceToken(): string | null {
    return this._deviceToken
  }

  setUserToken(token: string | null): void {
    this._userToken = token
    if (token) {
      sessionStorage.setItem('attendme_user_token', token)
    } else {
      sessionStorage.removeItem('attendme_user_token')
    }
  }

  setDeviceToken(token: string | null): void {
    this._deviceToken = token
    if (token) {
      localStorage.setItem('attendme_device_token', token)
    } else {
      localStorage.removeItem('attendme_device_token')
    }
  }

  setScannerToken(token: string | null): void {
    this._scannerToken = token
  }

  async userLogin(loginName: string, password: string): Promise<TokenResult> {
    const { data } = await this.api.post<TokenResult>('/api/User/login', { loginName, password })
    this.setUserToken(data.token)
    return data
  }

  async userGet(userId?: number): Promise<User> {
    const url = userId !== undefined ? `/api/User/${userId}` : '/api/User'
    const { data } = await this.api.get<User>(url)
    return data
  }

  logout(): void {
    this.setUserToken(null)
  }

  deviceAuthReset(): void {
    this.setDeviceToken(null)
  }

  async courseTeacherSessionsGet(
    body: CourseSessionListFiltersPagedListParams
  ): Promise<CourseSessionListItemPagedList> {
    const { data } = await this.api.post<CourseSessionListItemPagedList>(
      '/api/CourseSession/teacher/list',
      body
    )
    return data
  }

  async courseTeacherSessionGet(sessionId: number): Promise<CourseSessionListItem> {
    const { data } = await this.api.get<CourseSessionListItem>(
      `/api/CourseSession/teacher/${sessionId}`
    )
    return data
  }

  async courseSessionAttendanceListGet(
    sessionId: number
  ): Promise<CourseSessionAttendanceRecord[]> {
    const { data } = await this.api.get<CourseSessionAttendanceRecord[]>(
      `/api/CourseSession/${sessionId}/attendance`
    )
    return data
  }

  async courseSessionAttendanceScannerTokenGet(
    courseSessionId: number
  ): Promise<TokenResult> {
    const { data } = await this.api.get<TokenResult>(
      `/api/CourseSession/${courseSessionId}/attendance/scanner-token`
    )
    return data
  }

  async courseSessionAttendanceRegister(attenderToken: string): Promise<User> {
    const { data } = await this.api.post<User>(
      '/api/CourseSession/attendance/register',
      JSON.stringify(attenderToken),
      { headers: { 'Content-Type': 'application/json' } }
    )
    return data
  }

  async courseStudentSessionsGet(
    body: CourseSessionListFiltersPagedListParams
  ): Promise<CourseSessionListItemPagedList> {
    const { data } = await this.api.post<CourseSessionListItemPagedList>(
      '/api/CourseSession/student/list',
      body
    )
    return data
  }

  async courseStudentGroupSessionsGet(
    courseGroupId: number
  ): Promise<CourseSessionListItem[]> {
    const { data } = await this.api.get<CourseSessionListItem[]>(
      `/api/CourseSession/student/group/${courseGroupId}`
    )
    return data
  }

  async courseStudentAttendanceGet(courseGroupId: number): Promise<AttendanceLog[]> {
    const { data } = await this.api.get<AttendanceLog[]>(
      `/api/CourseSession/student/group/${courseGroupId}/attendance`
    )
    return data
  }

  async userDeviceRegisterWithToken(
    token: string,
    deviceData: DeviceRegisterDTO
  ): Promise<TokenResult> {
    const prevToken = this._userToken
    this._userToken = token
    try {
      const { data } = await this.api.post<TokenResult>('/api/User/device/register', deviceData)
      this.setDeviceToken(data.token)
      this._userToken = prevToken
      return data
    } catch (e) {
      this._userToken = prevToken
      throw e
    }
  }

  async userAttendanceTicketGet(): Promise<TokenResult> {
    const { data } = await this.api.get<TokenResult>('/api/User/attendance-ticket')
    return data
  }
}

export const apiClient = new AttendMeClient()
