import api from './api'

export const claimService = {
  async createClaim(data) {
    const res = await api.post('/claims/', data)
    return res.data
  },
  async getClaim(id) {
    const res = await api.get(`/claims/${id}`)
    return res.data
  },
  async getMyClaims() {
    const res = await api.get('/claims/')
    return res.data
  },
  async getAllClaims() {
    const res = await api.get('/claims/all')
    return res.data
  },
}

export const vehicleService = {
  async getMyVehicles() {
    const res = await api.get('/vehicles/')
    return res.data
  },
  async createVehicle(data) {
    const res = await api.post('/vehicles/', data)
    return res.data
  },
}