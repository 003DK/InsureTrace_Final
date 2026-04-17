import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mockClaims } from '../services/claimService'
import api from '../services/api'

const STATUS_CONFIG = {
  APPROVED:     { color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20',  dot: 'bg-green-400' },
  UNDER_REVIEW: { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', dot: 'bg-orange-400' },
  REJECTED:     { color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20',       dot: 'bg-red-400' },
  SUBMITTED:    { color: 'text-cyan-accent',bg: 'bg-cyan-accent/10 border-cyan-accent/20', dot: 'bg-cyan-accent animate-pulse' },
  DRAFT:        { color: 'text-slate-400',  bg: 'bg-slate-500/10 border-slate-500/20',  dot: 'bg-slate-400' },
}

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT
  return (
    <span className={`inline-flex items-center gap-1.5 border px-3 py-1 rounded-full text-xs font-display font-bold ${c.bg} ${c.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status.replace('_', ' ')}
    </span>
  )
}

function ScoreCircle({ score, label, color = 'text-cyan-accent' }) {
  const pct = Math.round((score || 0) * 100)
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`text-xl font-display font-bold ${color}`}>{pct}%</div>
      <div className="text-xs text-slate-500 font-body">{label}</div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [claims, setClaims] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)

  // ✅ UPDATED useEffect (API Integration)
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await api.get('/claims/')
        setClaims(response.data)
      } catch (err) {
        console.warn('Using mock data:', err.message)
        setClaims(mockClaims)
      } finally {
        setLoading(false)
      }
    }

    fetchClaims()
  }, [])

  const tabs = [
    { id: 'all',     label: 'All Claims',    filter: () => true },
    { id: 'pending', label: 'Pending',        filter: c => c.status === 'UNDER_REVIEW' || c.status === 'SUBMITTED' },
    { id: 'approved',label: 'Approved',       filter: c => c.status === 'APPROVED' },
    { id: 'rejected',label: 'Rejected',       filter: c => c.status === 'REJECTED' },
  ]

  const filtered = claims.filter(tabs.find(t => t.id === activeTab)?.filter || (() => true))

  const stats = [
    { label: 'Total Claims',   value: claims.length, icon: '📋', color: 'text-cyan-accent' },
    { label: 'Approved',       value: claims.filter(c => c.status === 'APPROVED').length, icon: '✅', color: 'text-green-400' },
    { label: 'Under Review',   value: claims.filter(c => ['UNDER_REVIEW','SUBMITTED'].includes(c.status)).length, icon: '⏳', color: 'text-orange-400' },
    { label: 'Fraud Detected', value: claims.filter(c => c.fraud_risk === 'high' || c.fraud_risk === 'critical').length, icon: '🚨', color: 'text-red-400' },
  ]

  return (
    <div className="min-h-screen bg-navy-950 page-enter pt-24 pb-16">
      <div className="absolute inset-0 bg-grid-pattern opacity-50" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <p className="text-slate-500 font-body text-sm mb-1">Welcome back,</p>
            <h1 className="font-display text-3xl font-bold text-white">
              {user?.full_name?.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-400 font-body text-sm mt-1">{user?.email}</p>
          </div>
          <Link to="/claim" className="btn-primary flex items-center gap-2 self-start md:self-auto">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
            </svg>
            New Claim
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map(s => (
            <div key={s.label} className="card">
              <div className="text-2xl mb-3">{s.icon}</div>
              <div className={`font-display text-3xl font-extrabold mb-1 ${s.color}`}>{s.value}</div>
              <div className="text-slate-400 text-sm font-body">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Claims Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="font-display text-xl font-bold text-white">Claims History</h2>
            <div className="flex gap-1 glass-light rounded-xl p-1">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-display font-semibold transition-all ${
                    activeTab === t.id ? 'bg-cyan-accent text-navy-900' : 'text-slate-400 hover:text-white'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-cyan-accent/30 border-t-cyan-accent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📭</div>
              <p className="font-display text-lg font-semibold text-white mb-2">No claims found</p>
              <Link to="/claim" className="btn-primary">File a Claim</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Claim No.', 'Description', 'Location', 'Date', 'Status', 'Amount', ''].map(h => (
                      <th key={h} className="text-left text-xs text-slate-500 pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(claim => (
                    <tr key={claim.id}>
                      <td className="py-4">{claim.claim_number}</td>
                      <td className="py-4">{claim.incident_description}</td>
                      <td className="py-4">{claim.incident_location}</td>
                      <td className="py-4">{new Date(claim.created_at).toLocaleDateString('en-IN')}</td>
                      <td className="py-4"><StatusBadge status={claim.status} /></td>
                      <td className="py-4">
                        {claim.approved_amount ? `₹${claim.approved_amount}` : '—'}
                      </td>
                      <td className="py-4">
                        <button onClick={() => navigate('/result', { state: { claimId: claim.id } })}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}