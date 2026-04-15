import api from './api'

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data)
    return res.data
  },
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    return res.data // { access_token, user }
  },
}
