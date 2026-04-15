import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-navy-950 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-accent to-navy-700 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="white" strokeWidth="2.5">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7l-9-5z" fill="white"/>
              </svg>
            </div>
            <span className="font-display font-bold text-lg text-white">Insure<span className="text-cyan-accent">Trace</span></span>
          </div>
          <p className="text-slate-400 text-sm font-body leading-relaxed">
            AI-powered insurance claims orchestration. From accident to settlement in hours.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold text-white mb-4">Platform</h4>
          <div className="flex flex-col gap-2">
            {[['/', 'Home'], ['/login', 'Login'], ['/signup', 'Sign Up'], ['/dashboard', 'Dashboard']].map(([to, label]) => (
              <Link key={to} to={to} className="text-slate-400 hover:text-cyan-accent text-sm font-body transition-colors">{label}</Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold text-white mb-4">Built For</h4>
          <div className="glass rounded-xl p-4">
            <p className="text-cyan-accent font-display font-semibold text-sm">Cognizant Technoverse 2026</p>
            <p className="text-slate-400 text-xs font-body mt-1">Team InsureTrace</p>
            <p className="text-slate-500 text-xs font-body mt-3">contact@insuretrace.dev</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 px-6 py-4 text-center text-slate-600 text-xs font-body">
        © 2026 InsureTrace. Built for Cognizant Technoverse 2026.
      </div>
    </footer>
  )
}
