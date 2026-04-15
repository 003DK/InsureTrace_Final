import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

const features = [
  { icon: '👁️', title: 'Vision Agent', desc: 'Analyzes damage photos for authenticity, severity, and estimated repair cost using computer vision.' },
  { icon: '🔬', title: 'Forensic Agent', desc: 'Cross-checks OBD-II telematics data against your incident narrative for story consistency.' },
  { icon: '✅', title: 'Compliance Agent', desc: 'Verifies policy validity, challan history, and driving records automatically.' },
  { icon: '⚖️', title: 'Consensus AI', desc: 'Synthesizes all three agent reports into a single transparent, auditable decision.' },
]

const steps = [
  { num: '01', title: 'Report Incident', desc: 'Upload photos, GPS-stamped media, dashcam footage, and OBD-II telematics data.' },
  { num: '02', title: 'Swarm Analysis', desc: 'Three specialized AI agents independently analyze every dimension of your claim.' },
  { num: '03', title: 'Instant Decision', desc: 'Consensus AI delivers a transparent verdict with instant garage-linked disbursement.' },
]

const techStack = ['FastAPI', 'SQLAlchemy', 'Claude AI', 'DigiLocker', 'ImageKit', 'Python 3.13', 'React', 'Tailwind']

export default function Landing() {
  return (
    <div className="min-h-screen bg-navy-950 page-enter">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* BG Effects */}
        <div className="absolute inset-0 bg-grid-pattern" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-navy-700/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 glass border border-cyan-accent/20 rounded-full px-4 py-2 mb-8">
              <div className="w-2 h-2 rounded-full bg-cyan-accent animate-pulse" />
              <span className="text-cyan-accent text-xs font-body font-medium tracking-wide">Cognizant Technoverse 2026 — Finalist</span>
            </div>

            <h1 className="font-display text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              AI-Powered<br />
              <span className="text-cyan-accent glow-text">Insurance Claim</span><br />
              Automation
            </h1>
            <p className="text-slate-400 text-lg font-body leading-relaxed mb-10 max-w-lg">
              From accident to settlement in hours — powered by Swarm Intelligence with 3 specialized AI agents and a Consensus engine.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/signup" className="btn-primary text-base px-8 py-4">
                File a Claim →
              </Link>
              <a href="#how-it-works" className="btn-ghost text-base px-8 py-4">
                See How It Works
              </a>
            </div>

            <div className="mt-12 flex gap-8">
              {[['98%', 'Accuracy'], ['< 2hrs', 'Settlement'], ['3', 'AI Agents']].map(([val, label]) => (
                <div key={label}>
                  <p className="font-display text-2xl font-bold text-cyan-accent">{val}</p>
                  <p className="text-slate-500 text-xs font-body">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mock result card */}
          <div className="hidden lg:block animate-float">
            <div className="glass gradient-border rounded-2xl p-6 shadow-2xl max-w-sm ml-auto">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-slate-400 font-body">Claim #CLM-2026-X7K9M2</p>
                  <p className="font-display font-bold text-white">Swarm Analysis</p>
                </div>
                <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-display font-bold px-3 py-1 rounded-full">APPROVED</span>
              </div>
              {[
                { label: 'Vision Agent', score: 92, color: 'bg-cyan-accent' },
                { label: 'Forensic Agent', score: 89, color: 'bg-blue-400' },
                { label: 'Compliance Agent', score: 95, color: 'bg-green-400' },
              ].map(a => (
                <div key={a.label} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400 font-body">{a.label}</span>
                    <span className="text-white font-display font-semibold">{a.score}%</span>
                  </div>
                  <div className="h-1.5 bg-navy-800 rounded-full overflow-hidden">
                    <div className={`h-full ${a.color} rounded-full`} style={{ width: `${a.score}%` }} />
                  </div>
                </div>
              ))}
              <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400 font-body">Approved Amount</p>
                  <p className="font-display font-bold text-xl text-green-400">₹48,500</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-body">Consensus Score</p>
                  <p className="font-display font-bold text-xl text-cyan-accent">87%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-cyan-accent text-sm font-body font-medium tracking-widest uppercase mb-3">Process</p>
          <h2 className="font-display text-4xl font-bold text-white">How InsureTrace Works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.num} className="card relative group">
              <div className="text-6xl font-display font-extrabold text-cyan-accent/10 mb-4 group-hover:text-cyan-accent/20 transition-colors">{s.num}</div>
              <h3 className="font-display text-xl font-bold text-white mb-3">{s.title}</h3>
              <p className="text-slate-400 font-body text-sm leading-relaxed">{s.desc}</p>
              {i < 2 && <div className="hidden md:block absolute top-12 -right-4 text-cyan-accent/30 text-2xl z-10">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <p className="text-cyan-accent text-sm font-body font-medium tracking-widest uppercase mb-3">Swarm Intelligence</p>
          <h2 className="font-display text-4xl font-bold text-white">Four Layers of Intelligence</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(f => (
            <div key={f.title} className="card group hover:scale-105 transition-transform duration-300 cursor-default">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-display text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 font-body text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-slate-400 text-sm font-body mb-6 tracking-widest uppercase">Built With</p>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map(t => (
              <span key={t} className="glass-light border border-white/5 px-4 py-2 rounded-lg text-sm font-body text-slate-300 hover:text-cyan-accent hover:border-cyan-accent/30 transition-colors">{t}</span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
