import axios from 'axios'

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1'
})

const authService = {
  login: async (email, password) => {
    const res = await API.post('/auth/login', {
      email,
      password
    })
    return res.data
  },

  register: async (userData) => {
    const res = await API.post('/auth/register', userData)
    return res.data
  }
}

export default authService