import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LoadingSpinner({ size = 'md' }) {
  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full border-4 border-cyan-400 border-t-transparent ${size === 'sm' ? 'w-5 h-5' : 'w-8 h-8'}`} />
    </div>
  )
}

export default function ProtectedRoute({ children }) {
  const { token } = useAuth()

  if (!token) return <Navigate to="/login" />

  return children
}