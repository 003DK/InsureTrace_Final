import api from './api'

const authService = {
  async login(email, password) {
    const res = await api.post('/auth/login', {
      email,
      password,
    })

    const data = res.data

    // ✅ STORE TOKEN (CRITICAL FIX)
    localStorage.setItem('it_token', data.access_token)
    localStorage.setItem('it_user', JSON.stringify(data.user))

    return data
  },

  async register(userData) {
    const res = await api.post('/auth/register', userData)
    return res.data
  },

  logout() {
    localStorage.removeItem('it_token')
    localStorage.removeItem('it_user')
  },

  getUser() {
    return JSON.parse(localStorage.getItem('it_user'))
  }
}

export default authService