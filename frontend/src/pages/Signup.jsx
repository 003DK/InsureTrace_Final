import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../services/authService'
import { LoadingSpinner } from '../components/ProtectedRoute'

function strength(p) {
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
}

export default function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const prefill = location.state?.prefill || {}

  const [form, setForm] = useState({
    full_name: prefill.full_name || '',
    email: prefill.email || '',
    phone: '',
    password: '',
    confirm: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.full_name.trim()) errs.full_name = 'Name is required'
    if (!form.email.includes('@')) errs.email = 'Valid email required'
    if (!/^\+?[0-9]{10,13}$/.test(form.phone)) errs.phone = 'Valid phone number required'
    if (form.password.length < 8) errs.password = 'Min 8 characters'
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match'
    return errs
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true); setApiError('')
    try {
      await authService.register({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      })
      navigate('/login', { state: { success: 'Account created! Please sign in.' } })
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Registration failed. Try again.')
    } finally { setLoading(false) }
  }

  const pw = strength(form.password)
  const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 page-enter px-4 py-12">
      <div className="absolute inset-0 bg-grid-pattern" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-accent to-navy-700 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5"><path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z"/></svg>
            </div>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 font-body text-sm mt-2">Join InsureTrace — file claims in minutes</p>
        </div>

        {prefill.full_name && (
          <div className="mb-4 p-3 rounded-xl bg-cyan-accent/10 border border-cyan-accent/20 text-cyan-accent text-sm font-body flex items-center gap-2">
            <span>✓</span> Pre-filled from DigiLocker
          </div>
        )}

        <div className="card">
          {apiError && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-body">{apiError}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'full_name', label: 'Full Name', type: 'text', placeholder: 'Dhanush Kanth' },
              { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
              { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 98765 43210' },
            ].map(f => (
              <div key={f.name}>
                <label className="text-xs font-body font-medium text-slate-400 uppercase tracking-wider mb-2 block">{f.label}</label>
                <input name={f.name} type={f.type} value={form[f.name]} onChange={handleChange}
                  placeholder={f.placeholder} className={`input-field ${errors[f.name] ? 'border-red-500/50' : ''}`} />
                {errors[f.name] && <p className="text-red-400 text-xs mt-1 font-body">{errors[f.name]}</p>}
              </div>
            ))}

            <div>
              <label className="text-xs font-body font-medium text-slate-400 uppercase tracking-wider mb-2 block">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                placeholder="Min 8 characters" className={`input-field ${errors.password ? 'border-red-500/50' : ''}`} />
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${i <= pw ? strengthColors[pw] : 'bg-navy-800'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-body ${['','text-red-400','text-orange-400','text-yellow-400','text-green-400'][pw]}`}>{strengthLabels[pw]}</p>
                </div>
              )}
              {errors.password && <p className="text-red-400 text-xs mt-1 font-body">{errors.password}</p>}
            </div>

            <div>
              <label className="text-xs font-body font-medium text-slate-400 uppercase tracking-wider mb-2 block">Confirm Password</label>
              <input name="confirm" type="password" value={form.confirm} onChange={handleChange}
                placeholder="Re-enter password" className={`input-field ${errors.confirm ? 'border-red-500/50' : ''}`} />
              {errors.confirm && <p className="text-red-400 text-xs mt-1 font-body">{errors.confirm}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 mt-2">
              {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm font-body mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-accent hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
