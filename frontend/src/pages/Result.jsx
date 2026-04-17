import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { mockResult } from '../services/claimService'

function CircleScore({ value, size = 80, color = '#00D4FF', label }) {
  const r = size / 2 - 8
  const circ = 2 * Math.PI * r
  const [progress, setProgress] = useState(0)

  useEffect(() => { setTimeout(() => setProgress(value), 300) }, [value])

  const offset = circ - (progress / 100) * circ
  const textColor =
    color === '#10B981' ? 'text-green-400' :
    color === '#F59E0B' ? 'text-orange-400' :
    'text-cyan-accent'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{ transition: 'stroke-dashoffset 1s ease' }}/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-display font-bold text-sm ${textColor}`}>
            {Math.round(value)}%
          </span>
        </div>
      </div>
      {label && <span className="text-xs text-slate-400">{label}</span>}
    </div>
  )
}

function FraudBar({ risk }) {
  const config = {
    low:      { pct: 20, color: 'bg-green-500',  textColor: 'text-green-400',  label: 'Low Risk' },
    medium:   { pct: 55, color: 'bg-orange-500', textColor: 'text-orange-400', label: 'Medium Risk' },
    high:     { pct: 80, color: 'bg-red-500',    textColor: 'text-red-400',    label: 'High Risk' },
    critical: { pct: 96, color: 'bg-red-700',    textColor: 'text-red-300',    label: 'Critical Risk' },
  }[risk] || { pct: 0, color: 'bg-slate-500', textColor: 'text-slate-400', label: 'Unknown' }

  const [width, setWidth] = useState(0)
  useEffect(() => { setTimeout(() => setWidth(config.pct), 400) }, [])

  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm text-slate-400">Fraud Risk Score</span>
        <span className={`font-bold text-sm ${config.textColor}`}>
          {config.label} ({config.pct}%)
        </span>
      </div>
      <div className="h-3 bg-navy-800 rounded-full overflow-hidden">
        <div className={`h-full ${config.color}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}

const DECISION_CONFIG = {
  APPROVED:     { text: 'text-green-400', icon: '✅', label: 'CLAIM APPROVED' },
  UNDER_REVIEW: { text: 'text-orange-400', icon: '⚠️', label: 'UNDER REVIEW' },
  REJECTED:     { text: 'text-red-400', icon: '❌', label: 'CLAIM REJECTED' },
}

export default function Result() {
  const navigate = useNavigate()
  const location = useLocation()

  // ✅ REAL DATA MAPPING
  const claimData = location.state?.claim

  const result = claimData ? {
    claim_number: claimData.claim_number,
    status: claimData.status,
    consensus_score: claimData.consensus_score ?? 0.87,
    fraud_risk: claimData.fraud_risk ?? 'low',
    approved_amount_inr: claimData.approved_amount,
    agents: {
      vision: claimData.vision_agent_report ?? mockResult.agents.vision,
      forensic: claimData.forensic_agent_report ?? mockResult.agents.forensic,
      compliance: claimData.compliance_agent_report ?? mockResult.agents.compliance,
    },
    reasoning: claimData.consensus_report?.reasoning ?? mockResult.reasoning,
    recommended_action: claimData.consensus_report?.recommended_action ?? mockResult.recommended_action,
  } : mockResult

  const dc = DECISION_CONFIG[result.status] || DECISION_CONFIG.UNDER_REVIEW
  const [toast, setToast] = useState(false)

  const v = result.agents.vision
  const f = result.agents.forensic
  const c = result.agents.compliance

  return (
    <div className="min-h-screen bg-navy-950 pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-2xl text-white mb-2">Claim Report</h1>
        <p className="text-slate-400 mb-6">{result.claim_number}</p>

        {/* Decision */}
        <div className="mb-6">
          <h2 className={`text-xl font-bold ${dc.text}`}>
            {dc.icon} {dc.label}
          </h2>
          <p className="text-slate-400">
            Score: {Math.round(result.consensus_score * 100)}%
          </p>
        </div>

        {/* Fraud */}
        <FraudBar risk={result.fraud_risk} />

        {/* Agents */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <CircleScore value={v.authenticity_score * 100} label="Vision" />
          <CircleScore value={f.narrative_consistency_score * 100} label="Forensic" />
          <CircleScore value={c.compliance_score * 100} label="Compliance" />
        </div>

        {/* Reasoning */}
        <div className="mt-6">
          <h3 className="text-white font-bold mb-2">AI Reasoning</h3>
          <p className="text-slate-300">{result.reasoning}</p>
        </div>

        {/* Action */}
        <div className="mt-4 text-cyan-accent">
          {result.recommended_action}
        </div>

        {/* Navigation */}
        <div className="mt-6">
          <Link to="/dashboard" className="text-blue-400">← Back to Dashboard</Link>
        </div>

      </div>
    </div>
  )
}