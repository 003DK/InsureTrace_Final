import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { mockClaims } from '../services/claimService'

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

  useEffect(() => {
    setTimeout(() => { setClaims(mockClaims); setLoading(false) }, 800)
  }, [])

  const tabs = [
    { id: 'all',     label: 'All Claims',    filter: () => true },
    { id: 'pending', label: 'Pending',        filter: c => c.status === 'UNDER_REVIEW' || c.status === 'SUBMITTED' },
    { id: 'approved',label: 'Approved',       filter: c => c.status === 'APPROVED' },
    { id: 'rejected',label: 'Rejected',       filter: c => c.status === 'REJECTED' },
  ]

  const filtered = claims.filter(tabs.find(t => t.id === activeTab)?.filter || (() => true))

  const stats = [
    { label: 'Total Claims',   value: claims.length,                                              icon: '📋', color: 'text-cyan-accent' },
    { label: 'Approved',       value: claims.filter(c => c.status === 'APPROVED').length,          icon: '✅', color: 'text-green-400' },
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
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <button onClick={() => navigate('/claim')}
            className="card group flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-pointer text-left">
            <div className="w-12 h-12 rounded-xl bg-cyan-accent/10 border border-cyan-accent/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📸</div>
            <div>
              <p className="font-display font-semibold text-white">File New Claim</p>
              <p className="text-slate-400 text-xs font-body mt-0.5">Upload media & incident details</p>
            </div>
          </button>
          <div className="card flex items-center gap-4 opacity-60 cursor-not-allowed">
            <div className="w-12 h-12 rounded-xl bg-navy-700/50 flex items-center justify-center text-2xl">📊</div>
            <div>
              <p className="font-display font-semibold text-white">Analytics</p>
              <p className="text-slate-400 text-xs font-body mt-0.5">Coming soon</p>
            </div>
          </div>
          <div className="card flex items-center gap-4 opacity-60 cursor-not-allowed">
            <div className="w-12 h-12 rounded-xl bg-navy-700/50 flex items-center justify-center text-2xl">🏦</div>
            <div>
              <p className="font-display font-semibold text-white">Disbursements</p>
              <p className="text-slate-400 text-xs font-body mt-0.5">Coming soon</p>
            </div>
          </div>
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
                  }`}>{t.label}</button>
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
              <p className="text-slate-400 text-sm font-body mb-6">File your first claim to get started</p>
              <Link to="/claim" className="btn-primary">File a Claim</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Claim No.', 'Description', 'Location', 'Date', 'Status', 'Amount', ''].map(h => (
                      <th key={h} className="text-left text-xs font-body font-medium text-slate-500 uppercase tracking-wider pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map(claim => (
                    <tr key={claim.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-4 pr-4">
                        <span className="font-display text-sm font-semibold text-cyan-accent">{claim.claim_number}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <p className="text-sm text-white font-body truncate max-w-[180px]">{claim.incident_description}</p>
                      </td>
                      <td className="py-4 pr-4">
                        <p className="text-xs text-slate-400 font-body">{claim.incident_location}</p>
                      </td>
                      <td className="py-4 pr-4">
                        <p className="text-xs text-slate-400 font-body">{new Date(claim.created_at).toLocaleDateString('en-IN')}</p>
                      </td>
                      <td className="py-4 pr-4"><StatusBadge status={claim.status} /></td>
                      <td className="py-4 pr-4">
                        {claim.approved_amount
                          ? <span className="text-green-400 font-display font-semibold text-sm">₹{claim.approved_amount.toLocaleString('en-IN')}</span>
                          : <span className="text-slate-500 text-sm">—</span>
                        }
                      </td>
                      <td className="py-4">
                        <button onClick={() => navigate('/result', { state: { claimId: claim.id } })}
                          className="text-xs font-body text-cyan-accent hover:text-white border border-cyan-accent/30 hover:border-white/30 px-3 py-1.5 rounded-lg transition-all">
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
