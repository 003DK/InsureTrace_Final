import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { LoadingSpinner } from '../components/ProtectedRoute'

const DIGI_MOCK = {
  full_name: 'Dhanush Kanth',
  aadhaar: 'XXXX-XXXX-8821',
  vehicle: 'TN-09-BK-4521 (Honda City 2022)',
  policy: 'POL-2024-HC-88921 (Valid till Dec 2025)',
  email: 'dhanush@example.com',
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [digiModal, setDigiModal] = useState(false)
  const [digiState, setDigiState] = useState('idle') // idle | loading | done

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const data = await authService.login(form.email, form.password)
      login(data.user, data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  const handleDigiLocker = () => {
    setDigiModal(true); setDigiState('loading')
    setTimeout(() => setDigiState('done'), 2000)
  }

  const useDigiData = () => {
    setDigiModal(false)
    navigate('/signup', { state: { prefill: DIGI_MOCK } })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 page-enter px-4">
      <div className="absolute inset-0 bg-grid-pattern" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-accent/3 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-accent to-navy-700 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z"/></svg>
            </div>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 font-body text-sm mt-2">Sign in to your InsureTrace account</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-body">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-body font-medium text-slate-400 uppercase tracking-wider mb-2 block">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required
                placeholder="you@example.com" className="input-field" />
            </div>
            <div>
              <label className="text-xs font-body font-medium text-slate-400 uppercase tracking-wider mb-2 block">Password</label>
              <div className="relative">
                <input name="password" type={show ? 'text' : 'password'} value={form.password} onChange={handleChange} required
                  placeholder="••••••••" className="input-field pr-12" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {show
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
              {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-slate-500 text-xs">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <button onClick={handleDigiLocker}
            className="w-full flex items-center justify-center gap-3 glass-light border border-white/10 rounded-xl px-5 py-3.5 hover:border-cyan-accent/30 transition-all">
            <div className="w-6 h-6 bg-[#003580] rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">D</span>
            </div>
            <span className="text-sm font-body font-medium text-white">Login via DigiLocker</span>
          </button>

          <p className="text-center text-slate-400 text-sm font-body mt-6">
            No account?{' '}
            <Link to="/signup" className="text-cyan-accent hover:underline">Create one</Link>
          </p>
        </div>
      </div>

      {/* DigiLocker Modal */}
      {digiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(4,13,31,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="glass gradient-border rounded-2xl p-8 w-full max-w-sm shadow-2xl">
            {digiState === 'loading' ? (
              <div className="flex flex-col items-center gap-5 py-4">
                <div className="w-16 h-16 bg-[#003580]/20 border border-[#003580]/40 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl font-bold text-blue-400">D</span>
                </div>
                <LoadingSpinner size="md" label="Connecting to DigiLocker..." />
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 text-lg">✓</div>
                  <h3 className="font-display text-lg font-bold text-white">Documents Fetched</h3>
                </div>
                <div className="space-y-3 mb-6">
                  {[
                    ['Name', DIGI_MOCK.full_name],
                    ['Aadhaar', DIGI_MOCK.aadhaar],
                    ['Vehicle', DIGI_MOCK.vehicle],
                    ['Policy', DIGI_MOCK.policy],
                  ].map(([k, v]) => (
                    <div key={k} className="glass-light rounded-xl px-4 py-3">
                      <p className="text-xs text-slate-500 font-body">{k}</p>
                      <p className="text-sm text-white font-body font-medium">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={useDigiData} className="btn-primary flex-1 py-3 text-sm">Use this data</button>
                  <button onClick={() => setDigiModal(false)} className="btn-ghost flex-1 py-3 text-sm">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
