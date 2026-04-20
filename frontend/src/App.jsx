import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import ClaimUpload from './pages/ClaimUpload'
import Result from './pages/Result'

function AppRoutes() {
  const location = useLocation()

  // Hide navbar on auth pages
  const hideNavbar =
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/signup')

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/claim"
          element={
            <ProtectedRoute>
              <ClaimUpload />
            </ProtectedRoute>
          }
        />

        <Route
          path="/result"
          element={
            <ProtectedRoute>
              <Result />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950">
      <div className="text-center">
        <p className="text-8xl font-extrabold text-cyan-400/20 mb-4">404</p>
        <h1 className="text-2xl font-bold text-white mb-2">
          Page Not Found
        </h1>
        <p className="text-slate-400 mb-6">
          This page doesn't exist.
        </p>

        <Link
          to="/"
          className="px-4 py-2 bg-cyan-500 text-white rounded"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}