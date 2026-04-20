import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { claimService, vehicleService } from '../services/claimService'

const AGENTS = ['Vision Agent', 'Forensic Agent', 'Compliance Agent', 'Consensus AI']

export default function ClaimUpload() {
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState([])
  const [loadingVehicles, setLoadingVehicles] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [quickVehicle, setQuickVehicle] = useState({
    registration_number: '', make: '', model: '', year: new Date().getFullYear(),
    engine_number: '', chassis_number: '', policy_number: '', policy_expiry: '',
  })

  const [form, setForm] = useState({
    vehicle_id: '',
    incident_description: '',
    incident_story: '',
    incident_location: '',
    gps_latitude: '',
    gps_longitude: '',
    incident_timestamp: new Date().toISOString().slice(0, 16),
    files: [],
  })

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const data = await vehicleService.getMyVehicles()
        setVehicles(data)
        if (data[0]) setForm((p) => ({ ...p, vehicle_id: data[0].id }))
      } finally {
        setLoadingVehicles(false)
      }
    }
    loadVehicles()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const addVehicle = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const created = await vehicleService.createVehicle(quickVehicle)
      setVehicles((p) => [created, ...p])
      setForm((p) => ({ ...p, vehicle_id: created.id }))
      setQuickVehicle({ registration_number: '', make: '', model: '', year: new Date().getFullYear(), engine_number: '', chassis_number: '', policy_number: '', policy_expiry: '' })
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not create vehicle')
    }
  }

  const handleFileChange = (e) => {
    const picked = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'))
    setForm((p) => ({ ...p, files: picked.slice(0, 6) }))
  }

  const submitClaim = async () => {
    setError('')
    if (!form.vehicle_id) return setError('Please add/select a vehicle first.')
    if (!form.incident_description.trim() || !form.incident_story.trim()) return setError('Please add summary and full story.')
    if (form.files.length < 2) return setError('Please upload at least 2 images.')

    setSubmitting(true)
    try {
      const payload = {
        vehicle_id: form.vehicle_id,
        incident_description: form.incident_description,
        incident_story: form.incident_story,
        incident_location: form.incident_location,
        gps_latitude: form.gps_latitude ? Number(form.gps_latitude) : null,
        gps_longitude: form.gps_longitude ? Number(form.gps_longitude) : null,
        incident_timestamp: new Date(form.incident_timestamp).toISOString(),
        media_urls: form.files.map((f) => `local://${f.name}`),
      }

      const created = await claimService.createClaim(payload)
      for (let i = 0; i < AGENTS.length; i++) {
        await new Promise((r) => setTimeout(r, 750))
      }

      let latest = created
      for (let i = 0; i < 12; i++) {
        await new Promise((r) => setTimeout(r, 1500))
        latest = await claimService.getClaim(created.id)
        if (latest.status !== 'submitted') break
      }
      navigate('/result', { state: { claim: latest } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Claim submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl text-white font-bold">File New Claim</h1>
        {error && <p className="text-red-400">{error}</p>}

        <div className="card space-y-3">
          <h2 className="text-white font-semibold">Vehicle</h2>
          {loadingVehicles ? <p className="text-slate-400">Loading vehicles...</p> : (
            <select name="vehicle_id" value={form.vehicle_id} onChange={handleChange} className="input-field">
              <option value="">Select vehicle</option>
              {vehicles.map((v) => <option value={v.id} key={v.id}>{v.registration_number} · {v.make} {v.model}</option>)}
            </select>
          )}

          <form onSubmit={addVehicle} className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
            <input className="input-field" placeholder="Reg. Number" value={quickVehicle.registration_number} onChange={(e) => setQuickVehicle((p) => ({ ...p, registration_number: e.target.value }))} required />
            <input className="input-field" placeholder="Make" value={quickVehicle.make} onChange={(e) => setQuickVehicle((p) => ({ ...p, make: e.target.value }))} required />
            <input className="input-field" placeholder="Model" value={quickVehicle.model} onChange={(e) => setQuickVehicle((p) => ({ ...p, model: e.target.value }))} required />
            <input className="input-field" type="number" placeholder="Year" value={quickVehicle.year} onChange={(e) => setQuickVehicle((p) => ({ ...p, year: Number(e.target.value) }))} required />
            <input className="input-field" placeholder="Engine Number" value={quickVehicle.engine_number} onChange={(e) => setQuickVehicle((p) => ({ ...p, engine_number: e.target.value }))} required />
            <input className="input-field" placeholder="Chassis Number" value={quickVehicle.chassis_number} onChange={(e) => setQuickVehicle((p) => ({ ...p, chassis_number: e.target.value }))} required />
            <input className="input-field" placeholder="Policy Number" value={quickVehicle.policy_number} onChange={(e) => setQuickVehicle((p) => ({ ...p, policy_number: e.target.value }))} required />
            <input className="input-field" type="date" value={quickVehicle.policy_expiry} onChange={(e) => setQuickVehicle((p) => ({ ...p, policy_expiry: e.target.value }))} required />
            <button className="btn-ghost md:col-span-2">Save Vehicle</button>
          </form>
        </div>

        <div className="card space-y-3">
          <h2 className="text-white font-semibold">Incident Details</h2>
          <input name="incident_description" value={form.incident_description} onChange={handleChange} className="input-field" placeholder="Short summary (what happened?)" />
          <textarea name="incident_story" value={form.incident_story} onChange={handleChange} className="input-field min-h-32" placeholder="Tell the full story with sequence, weather, road, witnesses, etc." />
          <input name="incident_location" value={form.incident_location} onChange={handleChange} className="input-field" placeholder="Incident location" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input type="datetime-local" name="incident_timestamp" value={form.incident_timestamp} onChange={handleChange} className="input-field" />
            <input name="gps_latitude" value={form.gps_latitude} onChange={handleChange} className="input-field" placeholder="Latitude" />
            <input name="gps_longitude" value={form.gps_longitude} onChange={handleChange} className="input-field" placeholder="Longitude" />
          </div>
        </div>

        <div className="card space-y-3">
          <h2 className="text-white font-semibold">Evidence Upload (2+ images required)</h2>
          <input type="file" multiple accept="image/*" onChange={handleFileChange} className="input-field" />
          <p className="text-slate-400 text-sm">Selected: {form.files.length} image(s).</p>
        </div>

        <button disabled={submitting} onClick={submitClaim} className="btn-primary w-full py-3">
          {submitting ? 'Submitting + running AI consensus...' : 'Submit Claim'}
        </button>
      </div>
    </div>
  )
}