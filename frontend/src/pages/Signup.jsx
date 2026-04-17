import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'

// Password strength
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
    phone: prefill.phone || '',
    password: '',
    confirm: '',
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errs = {}

    if (!form.full_name.trim()) errs.full_name = 'Name is required'
    if (!form.email.includes('@')) errs.email = 'Valid email required'
    if (!/^\+?[0-9]{10,13}$/.test(form.phone)) errs.phone = 'Valid phone required'
    if (form.password.length < 8) errs.password = 'Min 8 characters'
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match'

    return errs
  }

  // ✅ MOCK SIGNUP (NO BACKEND)
  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validate()
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)

    // Fake API delay
    await new Promise(res => setTimeout(res, 1200))

    setLoading(false)
    setSuccess('Account created successfully!')

    // Redirect after delay
    setTimeout(() => {
      navigate('/login')
    }, 1200)
  }

  const pwStrength = strength(form.password)
  const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 text-sm mt-2">
            Join InsureTrace — file claims in minutes
          </p>
        </div>

        {/* DigiLocker Banner */}
        {prefill.full_name && (
          <div className="mb-4 p-3 rounded-xl bg-cyan-accent/10 border border-cyan-accent/20 text-cyan-accent text-sm flex items-center gap-2">
            ✓ Pre-filled from DigiLocker
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Full Name"
              className={`input-field ${errors.full_name ? 'border-red-500/50' : ''}`}
            />
            {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>}
          </div>

          {/* Email */}
          <div>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className={`input-field ${errors.email ? 'border-red-500/50' : ''}`}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className={`input-field ${errors.phone ? 'border-red-500/50' : ''}`}
            />
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Password */}
          <div>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className={`input-field ${errors.password ? 'border-red-500/50' : ''}`}
            />

            {/* Strength Meter */}
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4].map(i => (
                    <div
                      key={i}
                      className={`flex-1 h-1 rounded-full ${
                        i <= pwStrength ? strengthColors[pwStrength] : 'bg-navy-800'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-400">
                  {strengthLabels[pwStrength]}
                </p>
              </div>
            )}

            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <input
              name="confirm"
              type="password"
              value={form.confirm}
              onChange={handleChange}
              placeholder="Confirm Password"
              className={`input-field ${errors.confirm ? 'border-red-500/50' : ''}`}
            />
            {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 transition-all"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

        </form>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-accent hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}