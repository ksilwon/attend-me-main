import http from './http'

export type TokenResult = { token: string }
export type User = {
  userId?: number
  loginName?: string
  roles?: string[] | string
}

export async function userLogin(loginName: string, password: string) {
  const res = await http.post('/user/login', null, {
    params: { loginName, password },
  })
  return res.data as { token: string; expires?: string }
}

export async function userGet(userId?: number) {
  const res = await http.get('/user/get', { params: userId ? { userId } : undefined })
  return res.data
}