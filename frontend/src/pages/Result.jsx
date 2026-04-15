import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { mockResult } from '../services/claimService'

function CircleScore({ value, size = 80, color = '#00D4FF', label }) {
  const r = size / 2 - 8
  const circ = 2 * Math.PI * r
  const [progress, setProgress] = useState(0)

  useEffect(() => { setTimeout(() => setProgress(value), 300) }, [value])

  const offset = circ - (progress / 100) * circ
  const textColor = color === '#10B981' ? 'text-green-400' : color === '#F59E0B' ? 'text-orange-400' : 'text-cyan-accent'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{ transition: 'stroke-dashoffset 1s ease' }}/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-display font-bold text-sm ${textColor}`}>{Math.round(value)}%</span>
        </div>
      </div>
      {label && <span className="text-xs text-slate-400 font-body text-center">{label}</span>}
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
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-slate-400 font-body">Fraud Risk Score</span>
        <span className={`font-display font-bold text-sm ${config.textColor}`}>{config.label} ({config.pct}%)</span>
      </div>
      <div className="h-3 bg-navy-800 rounded-full overflow-hidden">
        <div className={`h-full ${config.color} rounded-full transition-all duration-1000`} style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}

const DECISION_CONFIG = {
  APPROVED:     { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: '✅', label: 'CLAIM APPROVED' },
  UNDER_REVIEW: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', icon: '⚠️', label: 'UNDER REVIEW' },
  REJECTED:     { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: '❌', label: 'CLAIM REJECTED' },
}

export default function Result() {
  const navigate = useNavigate()
  const result = mockResult
  const dc = DECISION_CONFIG[result.status] || DECISION_CONFIG.UNDER_REVIEW
  const [toast, setToast] = useState(false)

  const v = result.agents.vision
  const f = result.agents.forensic
  const c = result.agents.compliance

  return (
    <div className="min-h-screen bg-navy-950 page-enter pt-24 pb-16 px-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />

      <div className="relative max-w-5xl mx-auto">
        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 glass border border-cyan-accent/30 bg-cyan-accent/10 text-cyan-accent px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <span className="text-sm font-body font-medium">📄 Report PDF downloaded (mock)</span>
            <button onClick={() => setToast(false)} className="opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-slate-500 font-body text-sm mb-1">Analysis Complete</p>
            <h1 className="font-display text-3xl font-bold text-white">Claim Report</h1>
            <p className="text-slate-400 font-body text-sm mt-1">{result.claim_number}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setToast(true); setTimeout(() => setToast(false), 3000) }}
              className="btn-ghost text-sm py-2.5 px-5 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              Download PDF
            </button>
            <Link to="/dashboard" className="btn-primary text-sm py-2.5 px-5">← Dashboard</Link>
          </div>
        </div>

        {/* Decision Banner */}
        <div className={`${dc.bg} border ${dc.border} rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{dc.icon}</span>
            <div>
              <p className={`font-display text-2xl font-extrabold ${dc.text}`}>{dc.label}</p>
              <p className="text-slate-400 font-body text-sm mt-0.5">Consensus Score: {Math.round(result.consensus_score * 100)}%</p>
            </div>
          </div>
          {result.approved_amount_inr && (
            <div className="text-right">
              <p className="text-slate-400 font-body text-xs uppercase tracking-wider">Approved Amount</p>
              <p className="font-display text-3xl font-extrabold text-green-400">₹{result.approved_amount_inr.toLocaleString('en-IN')}</p>
            </div>
          )}
        </div>

        {/* 3 Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {/* Vision Agent */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-cyan-accent/10 border border-cyan-accent/20 flex items-center justify-center text-xl">👁️</div>
              <div>
                <p className="font-display font-bold text-white text-sm">Vision Agent</p>
                <p className="text-slate-500 text-xs font-body">Damage Analysis</p>
              </div>
            </div>

            <div className="flex justify-center mb-5">
              <CircleScore value={v.authenticity_score * 100} label="Authenticity" />
            </div>

            <div className="space-y-2">
              <div className="glass-light rounded-xl px-3 py-2.5">
                <p className="text-xs text-slate-500 font-body">Damage Severity</p>
                <p className="text-sm text-white font-body font-medium capitalize">{v.damage_severity}</p>
              </div>
              <div className="glass-light rounded-xl px-3 py-2.5">
                <p className="text-xs text-slate-500 font-body">Damage Areas</p>
                <p className="text-sm text-white font-body font-medium capitalize">{v.damage_areas.join(', ')}</p>
              </div>
              <div className="glass-light rounded-xl px-3 py-2.5">
                <p className="text-xs text-slate-500 font-body">Estimated Repair</p>
                <p className="text-sm text-cyan-accent font-display font-bold">₹{v.estimated_repair_cost_inr.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Forensic Agent */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl">🔬</div>
              <div>
                <p className="font-display font-bold text-white text-sm">Forensic Agent</p>
                <p className="text-slate-500 text-xs font-body">Telematics Analysis</p>
              </div>
            </div>

            <div className="flex justify-center mb-5">
              <CircleScore value={f.narrative_consistency_score * 100} color="#60A5FA" label="Consistency" />
            </div>

            <div className="space-y-2">
              <div className="glass-light rounded-xl px-3 py-2.5">
                <p className="text-xs text-slate-500 font-body">Speed at Impact</p>
                <p className="text-sm text-white font-body font-medium">{f.speed_at_impact_kmh} km/h</p>
              </div>
              <div className="glass-light rounded-xl px-3 py-2.5">
                <p className="text-xs text-slate-500 font-body">Airbag Consistent</p>
                <p className={`text-sm font-body font-medium ${f.airbag_deployment_consistent ? 'text-green-400' : 'text-red-400'}`}>
                  {f.airbag_deployment_consistent ? '✓ Yes' : '✗ No'}
                </p>
              </div>
              <div className="glass-light rounded-xl px-3 py-2.5">
                <p className="text-xs text-slate-500 font-body">Verdict</p>
                <p className={`text-sm font-display font-bold capitalize ${f.verdict === 'consistent' ? 'text-green-400' : 'text-red-400'}`}>{f.verdict}</p>
              </div>
            </div>
          </div>

          {/* Compliance Agent */}
          <div className="card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-xl">✅</div>
              <div>
                <p className="font-display font-bold text-white text-sm">Compliance Agent</p>
                <p className="text-slate-500 text-xs font-body">Policy Verification</p>
              </div>
            </div>

            <div className="flex justify-center mb-5">
              <CircleScore value={c.compliance_score * 100} color="#10B981" label="Compliance" />
            </div>

            <div className="space-y-2">
              <div className="glass-light rounded-xl px-3 py-2.5">
                <p className="text-xs text-slate-500 font-body">Policy Status</p>
                <p className={`text-sm font-body font-medium ${c.policy_active ? 'text-green-400' : 'text-red-400'}`}>
                  {c.policy_active ? '✓ Active' : '✗ Inactive'}
                </p>
              </div>
              <div className="glass-light rounded-xl px-3 py-2.5">
                <p className="text-xs text-slate-500 font-body">Days Remaining</p>
                <p className="text-sm text-white font-body font-medium">{c.policy_expiry_days_remaining} days</p>
              </div>
              <div className="glass-light rounded-xl px-3 py-2.5">
                <p className="text-xs text-slate-500 font-body">Challan Risk</p>
                <p className={`text-sm font-display font-bold capitalize ${c.challan_risk === 'none' ? 'text-green-400' : 'text-orange-400'}`}>{c.challan_risk}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Consensus Card */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-accent to-navy-700 flex items-center justify-center text-xl">⚖️</div>
            <div>
              <p className="font-display font-bold text-white">Consensus AI — Final Report</p>
              <p className="text-slate-500 text-xs font-body">Synthesized from all three agent reports</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <FraudBar risk={result.fraud_risk} />
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400 font-body">Overall Consensus</span>
                  <span className="font-display font-bold text-sm text-cyan-accent">{Math.round(result.consensus_score * 100)}%</span>
                </div>
                <div className="h-3 bg-navy-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-accent to-blue-400 rounded-full transition-all duration-1000"
                    style={{ width: `${result.consensus_score * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="glass-light rounded-xl p-4">
              <p className="text-xs text-slate-500 font-body uppercase tracking-wider mb-2">AI Reasoning</p>
              <p className="text-sm text-slate-300 font-body leading-relaxed">{result.reasoning}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-cyan-accent/5 border border-cyan-accent/20 flex items-start gap-3">
            <span className="text-cyan-accent text-lg mt-0.5">→</span>
            <div>
              <p className="text-xs text-slate-400 font-body mb-1">Recommended Action</p>
              <p className="text-cyan-accent font-body font-medium text-sm">{result.recommended_action}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
