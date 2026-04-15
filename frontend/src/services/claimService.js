import api from './api'

export const claimService = {
  async createClaim(data) {
    const res = await api.post('/claims/', data)
    return res.data
  },
  async getClaim(id) {
    const res = await api.get(`/claims/${id}`)
    return res.data
  },
  async getMyClaims() {
    const res = await api.get('/claims/')
    return res.data
  },
}

// Mock data for demo when backend isn't ready
export const mockClaims = [
  {
    id: 'clm-001', claim_number: 'CLM-2026-X7K9M2',
    status: 'APPROVED', fraud_risk: 'low', consensus_score: 0.87,
    approved_amount: 48500, estimated_damage: 52000,
    incident_description: 'Front-end collision at signal junction',
    incident_location: 'MG Road, Bengaluru', created_at: '2026-04-10T09:23:00',
  },
  {
    id: 'clm-002', claim_number: 'CLM-2026-B3R5T1',
    status: 'UNDER_REVIEW', fraud_risk: 'medium', consensus_score: 0.61,
    approved_amount: null, estimated_damage: 85000,
    incident_description: 'Side impact in parking lot',
    incident_location: 'Phoenix Mall, Chennai', created_at: '2026-04-13T14:05:00',
  },
  {
    id: 'clm-003', claim_number: 'CLM-2026-P9Q2W8',
    status: 'SUBMITTED', fraud_risk: null, consensus_score: null,
    approved_amount: null, estimated_damage: null,
    incident_description: 'Rear-end collision on highway',
    incident_location: 'NH-44, Krishnagiri', created_at: '2026-04-15T08:45:00',
  },
]

export const mockResult = {
  claim_number: 'CLM-2026-X7K9M2',
  status: 'APPROVED',
  consensus_score: 0.87,
  fraud_risk: 'low',
  approved_amount_inr: 48500,
  agents: {
    vision: {
      damage_severity: 'moderate',
      damage_areas: ['front bumper', 'hood'],
      authenticity_score: 0.92,
      estimated_repair_cost_inr: 52000,
      confidence: 0.91,
    },
    forensic: {
      narrative_consistency_score: 0.89,
      speed_at_impact_kmh: 42,
      airbag_deployment_consistent: true,
      brake_usage_detected: true,
      verdict: 'consistent',
      confidence: 0.88,
    },
    compliance: {
      policy_active: true,
      policy_expiry_days_remaining: 245,
      challan_risk: 'none',
      compliance_score: 0.95,
      recommendation: 'proceed',
    },
  },
  reasoning: 'All three agents confirm a legitimate moderate collision. Vision analysis authenticated photos with 92% confidence, telematics data is fully consistent with the narrative, and policy is active with a clean compliance history.',
  recommended_action: 'Approve and trigger garage-linked disbursement of ₹48,500',
}
