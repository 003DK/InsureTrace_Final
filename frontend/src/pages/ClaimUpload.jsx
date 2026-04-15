import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { claimService } from '../services/claimService'

const STEPS = ['Incident Details', 'Upload Media', 'Review & Submit']

const AGENTS = [
  { id: 'vision',     label: 'Vision Agent',     desc: 'Analyzing damage photos...',       icon: '👁️' },
  { id: 'forensic',   label: 'Forensic Agent',   desc: 'Checking telematics data...',      icon: '🔬' },
  { id: 'compliance', label: 'Compliance Agent', desc: 'Verifying policy & history...',    icon: '✅' },
  { id: 'consensus',  label: 'Consensus AI',     desc: 'Synthesizing final verdict...',    icon: '⚖️' },
]

export default function ClaimUpload() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef()

  const [step, setStep] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const [agentsDone, setAgentsDone] = useState([])
  const [files, setFiles] = useState([])
  const [dragOver, setDragOver] = useState(false)

  const [form, setForm] = useState({
    vehicle_id: '',
    incident_description: '',
    incident_location: '',
    gps_latitude: '',
    gps_longitude: '',
    incident_timestamp: new Date().toISOString().slice(0, 16),
    obd_speed: '',
    obd_rpm: '',
    obd_airbag: false,
    obd_brake: false,
    obd_gforce: '',
  })
  const [errors, setErrors] = useState({})
  const [showOBD, setShowOBD] = useState(false)

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
    setErrors(p => ({ ...p, [name]: '' }))
  }

  const handleFiles = newFiles => {
    const arr = Array.from(newFiles).filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'))
    setFiles(p => [...p, ...arr].slice(0, 5))
  }

  const validateStep0 = () => {
    const e = {}
    if (!form.vehicle_id.trim()) e.vehicle_id = 'Vehicle number required'
    if (!form.incident_description.trim()) e.incident_description = 'Description required'
    if (!form.incident_timestamp) e.incident_timestamp = 'Date & time required'
    return e
  }

  const nextStep = () => {
    if (step === 0) {
      const e = validateStep0()
      if (Object.keys(e).length) { setErrors(e); return }
    }
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    setAnalyzing(true)
    setAgentsDone([])

    // Simulate agents completing one by one
    for (let i = 0; i < AGENTS.length; i++) {
      await new Promise(r => setTimeout(r, 1600))
      setAgentsDone(p => [...p, AGENTS[i].id])
    }

    // Build payload
    const payload = {
      vehicle_id: form.vehicle_id,
      incident_description: form.incident_description,
      incident_location: form.incident_location,
      gps_latitude: form.gps_latitude ? parseFloat(form.gps_latitude) : null,
      gps_longitude: form.gps_longitude ? parseFloat(form.gps_longitude) : null,
      incident_timestamp: new Date(form.incident_timestamp).toISOString(),
      obd_data: form.obd_speed ? {
        speed_kmh: parseFloat(form.obd_speed) || null,
        rpm: parseInt(form.obd_rpm) || null,
        airbag_deployed: form.obd_airbag,
        brake_signal: form.obd_brake,
        impact_g_force: parseFloat(form.obd_gforce) || null,
      } : null,
    }

    try {
      await claimService.createClaim(payload)
    } catch (_) { /* use mock on error */ }

    await new Promise(r => setTimeout(r, 600))
    navigate('/result')
  }

  const useGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setForm(p => ({
          ...p,
          gps_latitude: pos.coords.latitude.toFixed(6),
          gps_longitude: pos.coords.longitude.toFixed(6),
          incident_location: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        }))
      })
    }
  }

  if (analyzing) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="relative w-full max-w-md">
          <div className="card text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-cyan-accent/10 border border-cyan-accent/20 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-cyan-accent/30 border-t-cyan-accent rounded-full animate-spin" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">Swarm Intelligence Activated</h2>
            <p className="text-slate-400 font-body text-sm mb-8">Multi-agent analysis in progress...</p>

            <div className="space-y-3 text-left">
              {AGENTS.map(agent => {
                const done = agentsDone.includes(agent.id)
                const isActive = !done && agentsDone.length === AGENTS.indexOf(agent)
                return (
                  <div key={agent.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                    done ? 'border-green-500/20 bg-green-500/5' :
                    isActive ? 'border-cyan-accent/30 bg-cyan-accent/5' :
                    'border-white/5 bg-transparent opacity-40'
                  }`}>
                    <div className="text-xl">{agent.icon}</div>
                    <div className="flex-1">
                      <p className={`font-display font-semibold text-sm ${done ? 'text-green-400' : isActive ? 'text-cyan-accent' : 'text-slate-400'}`}>
                        {agent.label}
                      </p>
                      <p className="text-slate-500 font-body text-xs">{agent.desc}</p>
                    </div>
                    <div className="w-6 h-6 flex items-center justify-center">
                      {done
                        ? <span className="text-green-400 text-lg">✓</span>
                        : isActive
                        ? <div className="w-4 h-4 border-2 border-cyan-accent/40 border-t-cyan-accent rounded-full animate-spin" />
                        : <div className="w-2 h-2 rounded-full bg-slate-600" />
                      }
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 h-1.5 bg-navy-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-accent to-blue-400 rounded-full transition-all duration-700"
                style={{ width: `${(agentsDone.length / AGENTS.length) * 100}%` }}
              />
            </div>
            <p className="text-slate-500 text-xs font-body mt-2">
              {agentsDone.length} / {AGENTS.length} agents complete
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-950 page-enter pt-24 pb-16 px-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-50" />

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-cyan-accent text-sm font-body font-medium tracking-widest uppercase mb-2">New Claim</p>
          <h1 className="font-display text-3xl font-bold text-white">File an Insurance Claim</h1>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-sm transition-all ${
                  i < step ? 'bg-green-500 text-white' :
                  i === step ? 'bg-cyan-accent text-navy-900' :
                  'bg-navy-800 text-slate-500'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-body whitespace-nowrap ${i === step ? 'text-cyan-accent' : 'text-slate-500'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-3 mb-5 transition-colors ${i < step ? 'bg-green-500/50' : 'bg-navy-800'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="card">
          {/* Step 0: Incident Details */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-body font-medium text-slate-400 uppercase tracking-wider mb-2 block">Vehicle Registration Number *</label>
                <input name="vehicle_id" value={form.vehicle_id} onChange={handleChange}
                  placeholder="e.g. TN-09-BK-4521" className={`input-field ${errors.vehicle_id ? 'border-red-500/50' : ''}`} />
                {errors.vehicle_id && <p className="text-red-400 text-xs mt-1 font-body">{errors.vehicle_id}</p>}
              </div>

              <div>
                <label className="text-xs font-body font-medium text-slate-400 uppercase tracking-wider mb-2 block">Date & Time of Incident *</label>
                <input name="incident_timestamp" type="datetime-local" value={form.incident_timestamp} onChange={handleChange}
                  className={`input-field ${errors.incident_timestamp ? 'border-red-500/50' : ''}`} />
              </div>

              <div>
                <label className="text-xs font-body font-medium text-slate-400 uppercase tracking-wider mb-2 block">Incident Location</label>
                <div className="flex gap-2">
                  <input name="incident_location" value={form.incident_location} onChange={handleChange}
                    placeholder="e.g. MG Road, Bengaluru" className="input-field flex-1" />
                  <button type="button" onClick={useGPS}
                    className="glass-light border border-white/10 rounded-xl px-4 py-3 text-cyan-accent hover:border-cyan-accent/30 transition-all text-xs font-body whitespace-nowrap">
                    📍 GPS
                  </button>
                </div>
                {form.gps_latitude && (
                  <p className="text-xs text-green-400 mt-1 font-body">✓ GPS: {form.gps_latitude}, {form.gps_longitude}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-body font-medium text-slate-400 uppercase tracking-wider mb-2 block">Incident Description *</label>
                <textarea name="incident_description" value={form.incident_description} onChange={handleChange} rows={4}
                  placeholder="Describe exactly what happened — direction of travel, speed, what was hit, road conditions..."
                  className={`input-field resize-none ${errors.incident_description ? 'border-red-500/50' : ''}`} />
                {errors.incident_description && <p className="text-red-400 text-xs mt-1 font-body">{errors.incident_description}</p>}
              </div>
            </div>
          )}

          {/* Step 1: Upload Media */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Drag & Drop */}
              <div>
                <label className="text-xs font-body font-medium text-slate-400 uppercase tracking-wider mb-2 block">
                  Damage Photos / Video (up to 5)
                </label>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                    dragOver ? 'border-cyan-accent bg-cyan-accent/5' : 'border-navy-700 hover:border-cyan-accent/40 hover:bg-cyan-accent/2'
                  }`}>
                  <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
                  <div className="text-4xl mb-3">📸</div>
                  <p className="font-display font-semibold text-white mb-1">Drop files here or click to browse</p>
                  <p className="text-slate-500 text-xs font-body">Images or video • Max 5 files</p>
                </div>

                {files.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                    {files.map((f, i) => (
                      <div key={i} className="relative group">
                        <div className="aspect-square rounded-xl bg-navy-800 border border-white/10 flex items-center justify-center overflow-hidden">
                          {f.type.startsWith('image/') ? (
                            <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl">🎥</span>
                          )}
                        </div>
                        <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* OBD-II Section */}
              <div className="border border-white/5 rounded-xl overflow-hidden">
                <button onClick={() => setShowOBD(!showOBD)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/2 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🔌</span>
                    <div className="text-left">
                      <p className="font-display font-semibold text-white text-sm">OBD-II Telematics</p>
                      <p className="text-slate-500 text-xs font-body">Vehicle sensor data at time of impact</p>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 text-slate-400 transition-transform ${showOBD ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {showOBD && (
                  <div className="p-4 pt-0 grid grid-cols-2 gap-4 border-t border-white/5">
                    <div>
                      <label className="text-xs text-slate-400 font-body mb-1.5 block">Speed (km/h)</label>
                      <input name="obd_speed" value={form.obd_speed} onChange={handleChange} type="number" placeholder="0" className="input-field" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-body mb-1.5 block">RPM</label>
                      <input name="obd_rpm" value={form.obd_rpm} onChange={handleChange} type="number" placeholder="0" className="input-field" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-body mb-1.5 block">G-Force Reading</label>
                      <input name="obd_gforce" value={form.obd_gforce} onChange={handleChange} type="number" step="0.1" placeholder="0.0" className="input-field" />
                    </div>
                    <div className="flex flex-col gap-3 justify-center">
                      {[['obd_airbag', 'Airbag Deployed'], ['obd_brake', 'Brake Signal']].map(([name, label]) => (
                        <label key={name} className="flex items-center gap-3 cursor-pointer">
                          <div className={`w-10 h-6 rounded-full transition-colors relative ${form[name] ? 'bg-cyan-accent' : 'bg-navy-800'}`}
                            onClick={() => setForm(p => ({ ...p, [name]: !p[name] }))}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form[name] ? 'translate-x-5' : 'translate-x-1'}`} />
                          </div>
                          <span className="text-sm text-slate-300 font-body">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-white mb-4">Review Your Claim</h3>
              {[
                ['Vehicle', form.vehicle_id],
                ['Date & Time', new Date(form.incident_timestamp).toLocaleString('en-IN')],
                ['Location', form.incident_location || 'Not provided'],
                ['GPS Coordinates', form.gps_latitude ? `${form.gps_latitude}, ${form.gps_longitude}` : 'Not captured'],
                ['Media Files', `${files.length} file(s) attached`],
                ['OBD Data', form.obd_speed ? `${form.obd_speed} km/h, ${form.obd_airbag ? 'Airbag deployed' : 'No airbag'}` : 'Not provided'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-start gap-4 py-3 border-b border-white/5">
                  <span className="text-slate-400 text-sm font-body">{k}</span>
                  <span className="text-white text-sm font-body text-right max-w-[60%]">{v}</span>
                </div>
              ))}
              <div className="pt-2">
                <p className="text-slate-400 text-sm font-body mb-2">Description</p>
                <div className="glass-light rounded-xl p-4">
                  <p className="text-white text-sm font-body leading-relaxed">{form.incident_description}</p>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-xl bg-cyan-accent/5 border border-cyan-accent/20">
                <p className="text-cyan-accent text-sm font-body">
                  ⚡ Submitting will trigger Swarm Intelligence analysis. You'll receive a decision in seconds.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/5">
            <button onClick={() => step > 0 ? setStep(s => s - 1) : null}
              className={`btn-ghost px-6 py-3 text-sm ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}>
              ← Back
            </button>
            {step < 2
              ? <button onClick={nextStep} className="btn-primary px-8 py-3 text-sm">Continue →</button>
              : <button onClick={handleSubmit} className="btn-primary px-8 py-3 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  Analyze Claim
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
