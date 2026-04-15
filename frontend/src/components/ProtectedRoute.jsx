import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <FullPageLoader />
  if (!user) return <Navigate to="/login" replace />
  return children
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-cyan-accent/30 border-t-cyan-accent rounded-full animate-spin" />
        <p className="text-slate-400 font-body text-sm">Loading...</p>
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = 'md', label = '' }) {
  const s = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }[size]
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${s} border-2 border-cyan-accent/30 border-t-cyan-accent rounded-full animate-spin`} />
      {label && <p className="text-slate-400 text-sm font-body">{label}</p>}
    </div>
  )
}

export function Toast({ message, type = 'success', onClose }) {
  const colors = {
    success: 'border-green-500/30 bg-green-500/10 text-green-400',
    error: 'border-red-500/30 bg-red-500/10 text-red-400',
    info: 'border-cyan-accent/30 bg-cyan-accent/10 text-cyan-accent',
  }
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 glass border px-5 py-4 rounded-xl shadow-2xl animate-pulse-slow ${colors[type]}`}>
      <span className="text-sm font-body font-medium">{message}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
  )
}
