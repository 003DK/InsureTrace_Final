import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoadingSpinner } from '../components/ProtectedRoute'

const DIGI_MOCK = {
  full_name: 'Dhanush Kanth',
  aadhaar: 'XXXX-XXXX-8821',
  vehicle: 'TN-09-BK-4521 (Honda City 2022)',
  policy: 'POL-2024-HC-88921 (Valid till Dec 2025)',
  email: 'dhanush@example.com',
  phone: '8248565019',
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)

  const [digiModal, setDigiModal] = useState(false)
  const [digiState, setDigiState] = useState('idle')

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  // ✅ MOCK LOGIN (NO BACKEND)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // fake delay
    await new Promise(res => setTimeout(res, 800))

    if (form.email && form.password) {
      const user = {
        full_name: "Dhanush Kanth",
        email: form.email
      }

      // simulate auth
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', 'demo-token')

      // optional: context login
      login(user, 'demo-token')

      navigate('/dashboard')
    } else {
      setError('Please enter email and password')
    }

    setLoading(false)
  }

  // DigiLocker mock flow
  const handleDigiLocker = () => {
    setDigiModal(true)
    setDigiState('loading')

    setTimeout(() => {
      setDigiState('done')
    }, 1500)
  }

  const useDigiData = () => {
    setDigiModal(false)

    navigate('/signup', {
      state: {
        prefill: {
          full_name: DIGI_MOCK.full_name,
          email: DIGI_MOCK.email,
          phone: DIGI_MOCK.phone,
        }
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <h1 className="text-3xl font-bold text-white text-center mb-6">Login</h1>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="input-field"
          />

          <div className="relative">
            <input
              name="password"
              type={show ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="input-field pr-10"
            />

            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              👁
            </button>
          </div>

          <button className="btn-primary w-full py-3">
            {loading ? <LoadingSpinner size="sm" /> : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="text-center my-4 text-slate-400 text-sm">or</div>

        {/* DigiLocker */}
        <button
          onClick={handleDigiLocker}
          className="btn-ghost w-full py-3"
        >
          🔐 Login via DigiLocker
        </button>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-6">
          No account?{' '}
          <Link to="/signup" className="text-cyan-accent">
            Signup
          </Link>
        </p>

        {/* DigiLocker Modal */}
        {digiModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70">
            <div className="bg-navy-900 p-6 rounded-xl w-80">

              {digiState === 'loading' ? (
                <p className="text-white text-center">
                  Connecting to DigiLocker...
                </p>
              ) : (
                <div>
                  <p className="text-green-400 mb-4">✓ Documents Fetched</p>

                  <p className="text-white text-sm">
                    Name: {DIGI_MOCK.full_name}
                  </p>
                  <p className="text-white text-sm">
                    Aadhaar: {DIGI_MOCK.aadhaar}
                  </p>
                  <p className="text-white text-sm">
                    Vehicle: {DIGI_MOCK.vehicle}
                  </p>

                  <button
                    onClick={useDigiData}
                    className="btn-primary mt-4 w-full"
                  >
                    Use this data
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  )
}