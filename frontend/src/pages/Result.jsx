import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { claimService } from '../services/claimService'

export default function Result() {
  const location = useLocation()
  const [claim, setClaim] = useState(location.state?.claim || null)
  const [loading, setLoading] = useState(Boolean(location.state?.claimId && !location.state?.claim))

  useEffect(() => {
    const claimId = location.state?.claimId
    if (!claimId || claim) return

    const load = async () => {
      try {
        const data = await claimService.getClaim(claimId)
        setClaim(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [location.state, claim])

  if (loading) return <div className="min-h-screen bg-navy-950 pt-24 px-4 text-slate-300">Loading report...</div>
  if (!claim) return <div className="min-h-screen bg-navy-950 pt-24 px-4 text-red-400">No claim report found.</div>

  const consensus = claim.consensus_report || {}

  return (
    <div className="min-h-screen bg-navy-950 pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl text-white">Claim Report</h1>
        <p className="text-slate-400">{claim.claim_number} · status: <span className="text-cyan-accent">{claim.status}</span></p>

        <div className="card space-y-2">
          <h3 className="text-white font-bold">Consensus Summary</h3>
          <p className="text-slate-300">Fraud risk: {claim.fraud_risk || 'pending'}</p>
          <p className="text-slate-300">Consensus score: {claim.consensus_score ? `${Math.round(claim.consensus_score * 100)}%` : 'Pending'}</p>
          <p className="text-slate-300">Approved amount: {claim.approved_amount ? `₹${claim.approved_amount}` : 'Pending'}</p>
          {consensus.reasoning && <p className="text-slate-300">Reasoning: {consensus.reasoning}</p>}
          {consensus.recommended_action && <p className="text-cyan-accent">Action: {consensus.recommended_action}</p>}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <ReportCard title="Vision Agent" report={claim.vision_agent_report} />
          <ReportCard title="Forensic Agent" report={claim.forensic_agent_report} />
          <ReportCard title="Compliance Agent" report={claim.compliance_agent_report} />
        </div>

        <div className="card">
          <h3 className="text-white font-bold mb-2">Claim Story</h3>
          <p className="text-slate-300 whitespace-pre-line">{claim.incident_description}</p>
          <p className="text-slate-400 text-sm mt-3">Evidence files: {(claim.media_urls || []).join(', ') || 'None'}</p>
        </div>

        <Link to="/dashboard" className="text-cyan-accent">← Back to Dashboard</Link>
      </div>
    </div>
  )
}

function ReportCard({ title, report }) {
  return (
    <div className="card">
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      {report ? (
        <pre className="text-xs text-slate-300 whitespace-pre-wrap">{JSON.stringify(report, null, 2)}</pre>
      ) : (
        <p className="text-slate-500 text-sm">Pending pipeline output...</p>
      )}
    </div>
  )
}