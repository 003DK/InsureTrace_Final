import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import authService from '../services/authService'
import { LoadingSpinner } from '../components/ProtectedRoute'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '', mode: 'user' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payloadEmail =
        form.mode === 'agent'
          ? 'agent@insuretrace.local'
          : form.email

      const data = await authService.login(payloadEmail, form.password)

      login(data.user, data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center mb-6">Login</h1>

        {error && (
          <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="grid grid-cols-2 rounded-xl border border-white/10 overflow-hidden">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, mode: 'user' }))}
              className={`py-2 text-sm ${
                form.mode === 'user'
                  ? 'bg-cyan-accent text-navy-900'
                  : 'text-slate-300'
              }`}
            >
              User
            </button>

            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, mode: 'agent' }))}
              className={`py-2 text-sm ${
                form.mode === 'agent'
                  ? 'bg-cyan-accent text-navy-900'
                  : 'text-slate-300'
              }`}
            >
              Insurance Agent
            </button>
          </div>

          {form.mode === 'user' && (
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="input-field"
              required
            />
          )}

          {form.mode === 'agent' && (
            <p className="text-xs text-slate-400">
              Agent login uses configured back-office email.
            </p>
          )}

          <div className="relative">
            <input
              name="password"
              type={show ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              placeholder={
                form.mode === 'agent' ? 'Agent password' : 'Password'
              }
              className="input-field pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              👁
            </button>
          </div>

          <button className="btn-primary w-full py-3" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : 'Login'}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          No account?{' '}
          <Link to="/signup" className="text-cyan-accent">
            Signup
          </Link>
        </p>
      </div>
    </div>
  )
}