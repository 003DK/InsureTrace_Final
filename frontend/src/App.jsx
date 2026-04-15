import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import ClaimUpload from './pages/ClaimUpload'
import Result from './pages/Result'

function AppRoutes() {
  const location = useLocation()
  const hideNavbar = ['/login', '/signup'].includes(location.pathname)

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/"          element={<Landing />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/signup"    element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/claim"     element={<ProtectedRoute><ClaimUpload /></ProtectedRoute>} />
        <Route path="/result"    element={<ProtectedRoute><Result /></ProtectedRoute>} />
        <Route path="*"          element={<NotFound />} />
      </Routes>
    </>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950">
      <div className="text-center">
        <p className="font-display text-8xl font-extrabold text-cyan-accent/20 mb-4">404</p>
        <h1 className="font-display text-2xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-slate-400 font-body mb-6">This page doesn't exist.</p>
        <a href="/" className="btn-primary">Go Home</a>
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
