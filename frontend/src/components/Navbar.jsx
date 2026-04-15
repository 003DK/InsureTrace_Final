import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleLogout = () => { logout(); navigate('/') }
  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass border-b border-cyan-accent/10 py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-accent to-navy-700 flex items-center justify-center shadow-lg shadow-cyan-accent/30 group-hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-navy-900" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z" fill="currentColor" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-display font-bold text-xl text-white">
            Insure<span className="text-cyan-accent">Trace</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {!user ? (
            <>
              <Link to="/" className={`font-body text-sm font-medium transition-colors ${location.pathname==='/' ? 'text-cyan-accent' : 'text-slate-400 hover:text-white'}`}>Home</Link>
              <Link to="/login" className="btn-ghost text-sm py-2 px-5">Login</Link>
              <Link to="/signup" className="btn-primary text-sm py-2 px-5">Get Started</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className={`font-body text-sm font-medium transition-colors ${location.pathname.startsWith('/dashboard') ? 'text-cyan-accent' : 'text-slate-400 hover:text-white'}`}>Dashboard</Link>
              <Link to="/claim" className={`font-body text-sm font-medium transition-colors ${location.pathname==='/claim' ? 'text-cyan-accent' : 'text-slate-400 hover:text-white'}`}>New Claim</Link>
              <div className="relative">
                <button onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 glass-light rounded-xl px-4 py-2 hover:border-cyan-accent/30 transition-all">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-accent to-navy-600 flex items-center justify-center text-xs font-display font-bold text-navy-900">
                    {initials}
                  </div>
                  <span className="text-sm text-white font-body">{user.full_name?.split(' ')[0]}</span>
                  <svg className={`w-4 h-4 text-slate-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                </button>
                {dropOpen && (
                  <div className="absolute right-0 top-12 glass border border-cyan-accent/10 rounded-xl overflow-hidden w-44 shadow-2xl">
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm text-white font-medium truncate">{user.email}</p>
                    </div>
                    <Link to="/dashboard" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
                      Dashboard
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}/>
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-cyan-accent/10 px-6 py-4 flex flex-col gap-3">
          {!user ? (
            <>
              <Link to="/login" className="btn-ghost text-center" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="btn-primary text-center" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="text-slate-300 py-2" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/claim" className="text-slate-300 py-2" onClick={() => setMenuOpen(false)}>New Claim</Link>
              <button onClick={handleLogout} className="text-red-400 text-left py-2">Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
