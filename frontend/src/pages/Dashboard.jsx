import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { claimService } from '../services/claimService'

const STATUS_CONFIG = {
  approved: { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', dot: 'bg-green-400' },
  under_review: { color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', dot: 'bg-orange-400' },
  rejected: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-400' },
  submitted: { color: 'text-cyan-accent', bg: 'bg-cyan-accent/10 border-cyan-accent/20', dot: 'bg-cyan-accent animate-pulse' },
  draft: { color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', dot: 'bg-slate-400' },
}

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.draft
  return <span className={`inline-flex items-center gap-1.5 border px-3 py-1 rounded-full text-xs font-bold ${c.bg} ${c.color}`}><span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{status.replace('_', ' ')}</span>
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const data = user?.role === 'agent' ? await claimService.getAllClaims() : await claimService.getMyClaims()
        setClaims(data)
      } finally {
        setLoading(false)
      }
    }
    fetchClaims()
  }, [user?.role])

  return (
    <div className="min-h-screen bg-navy-950 page-enter pt-24 pb-16">
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-white font-bold">{user?.role === 'agent' ? 'Agent Review Dashboard' : 'My Claims Dashboard'}</h1>
            <p className="text-slate-400 text-sm">{user?.role === 'agent' ? 'Behind-the-scenes AI reports for all claims.' : user?.email}</p>
          </div>
          {user?.role !== 'agent' && <Link to="/claim" className="btn-primary">New Claim</Link>}
        </div>

        <div className="card">
          {loading ? <p className="text-slate-400">Loading...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-white/5"><th className="text-left py-3">Claim</th><th className="text-left py-3">Description</th><th className="text-left py-3">Status</th><th className="text-left py-3">Amount</th><th /></tr></thead>
                <tbody>
                  {claims.map((claim) => (
                    <tr key={claim.id} className="border-b border-white/5">
                      <td className="py-4">{claim.claim_number}</td>
                      <td className="py-4">{claim.incident_description?.slice(0, 70)}</td>
                      <td className="py-4"><StatusBadge status={claim.status} /></td>
                      <td className="py-4">{claim.approved_amount ? `₹${claim.approved_amount}` : '—'}</td>
                      <td className="py-4"><button className="text-cyan-accent" onClick={() => navigate('/result', { state: { claimId: claim.id } })}>View</button></td>
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