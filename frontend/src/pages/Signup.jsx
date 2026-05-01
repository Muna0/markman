import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import { useTheme } from '../store/ThemeContext'
import { Scale, Sun, Moon, Eye, EyeOff, Loader2, ArrowLeft, Check } from 'lucide-react'

export default function Signup() {
  const { login } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', firm: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const u = field => e => setForm(p => ({ ...p, [field]: e.target.value }))
  const checks = [
    { l: '8+ characters', ok: form.password.length >= 8 },
    { l: 'One uppercase', ok: /[A-Z]/.test(form.password) },
    { l: 'One number', ok: /\d/.test(form.password) },
  ]

  function submit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { setError('Required fields missing'); return }
    if (form.password.length < 8) { setError('Password too short'); return }
    setError(''); setLoading(true)
    setTimeout(() => { login({ name: form.name, email: form.email }); navigate('/app') }, 1000)
  }

  return (
    <div className={`min-h-screen flex ${dark ? 'bg-ink-950' : 'bg-ink-25'} transition-colors`}>
      {/* Left */}
      <div className="hidden lg:flex lg:w-[45%] bg-ink-950 relative overflow-hidden flex-col justify-between p-14">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] right-[20%] w-[350px] h-[350px] rounded-full bg-vio-500/[0.07] blur-[100px]" />
          <div className="absolute bottom-[20%] left-[15%] w-[280px] h-[280px] rounded-full bg-blu-500/[0.06] blur-[80px]" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-20">
            <div className="w-8 h-8 rounded-md bg-blu-500 flex items-center justify-center">
              <Scale className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-[17px] font-bold text-white tracking-[-0.02em]">ipsuite</span>
          </div>
          <h2 className="text-[36px] font-bold text-white tracking-[-0.03em] leading-[1.15] mb-5">
            Request early<br />access to the beta.
          </h2>
          <p className="text-[15px] text-ink-400 leading-[1.6] max-w-[360px] mb-10">
            Limited spots. Full access to all tools. Shape the product with us.
          </p>
          <div className="space-y-3">
            {['All 4 IP analysis tools', 'Live USPTO & WIPO API access', 'Unlimited matters during beta', 'Priority onboarding support'].map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-4.5 h-4.5 rounded-full bg-white/10 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-grn-400" /></div>
                <span className="text-[13px] text-ink-300">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div />
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[380px]">
          <div className="flex items-center justify-between mb-10">
            <Link to="/" className="flex items-center gap-1.5 text-[13px] font-medium text-ink-400 hover:text-ink-200 transition">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Link>
            <button onClick={toggle} className={`p-2 rounded-lg transition ${dark ? 'hover:bg-ink-800' : 'hover:bg-ink-100'}`}>
              {dark ? <Sun className="w-4 h-4 text-amb-400" /> : <Moon className="w-4 h-4 text-ink-400" />}
            </button>
          </div>

          <h1 className={`text-[24px] font-bold tracking-[-0.02em] mb-1 ${dark ? 'text-white' : 'text-ink-950'}`}>Create your account</h1>
          <p className={`text-[14px] mb-8 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>Get started in under 2 minutes</p>

          {error && <div className="mb-4 px-4 py-2.5 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-[13px]">{error}</div>}

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-[13px] font-medium mb-1.5 ${dark ? 'text-ink-200' : 'text-ink-700'}`}>Name *</label>
                <input type="text" value={form.name} onChange={u('name')} placeholder="Jane Smith"
                  className={`w-full rounded-[10px] border px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blu-500/50 focus:border-blu-500 transition placeholder:text-ink-500 ${dark ? 'bg-ink-900 border-ink-700 text-ink-100' : 'bg-white border-ink-200 text-ink-900'}`} />
              </div>
              <div>
                <label className={`block text-[13px] font-medium mb-1.5 ${dark ? 'text-ink-200' : 'text-ink-700'}`}>Firm</label>
                <input type="text" value={form.firm} onChange={u('firm')} placeholder="Optional"
                  className={`w-full rounded-[10px] border px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blu-500/50 focus:border-blu-500 transition placeholder:text-ink-500 ${dark ? 'bg-ink-900 border-ink-700 text-ink-100' : 'bg-white border-ink-200 text-ink-900'}`} />
              </div>
            </div>
            <div>
              <label className={`block text-[13px] font-medium mb-1.5 ${dark ? 'text-ink-200' : 'text-ink-700'}`}>Work Email *</label>
              <input type="email" value={form.email} onChange={u('email')} placeholder="jane@smithlaw.com"
                className={`w-full rounded-[10px] border px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blu-500/50 focus:border-blu-500 transition placeholder:text-ink-500 ${dark ? 'bg-ink-900 border-ink-700 text-ink-100' : 'bg-white border-ink-200 text-ink-900'}`} />
            </div>
            <div>
              <label className={`block text-[13px] font-medium mb-1.5 ${dark ? 'text-ink-200' : 'text-ink-700'}`}>Password *</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={form.password} onChange={u('password')} placeholder="Create a strong password"
                  className={`w-full rounded-[10px] border px-4 py-2.5 pr-10 text-[14px] focus:outline-none focus:ring-2 focus:ring-blu-500/50 focus:border-blu-500 transition placeholder:text-ink-500 ${dark ? 'bg-ink-900 border-ink-700 text-ink-100' : 'bg-white border-ink-200 text-ink-900'}`} />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex gap-3">
                  {checks.map(c => (
                    <span key={c.l} className={`flex items-center gap-1 text-[11px] ${c.ok ? 'text-grn-400' : 'text-ink-500'}`}>
                      <Check className={`w-3 h-3 ${c.ok ? '' : 'opacity-30'}`} />{c.l}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] bg-blu-500 text-white text-[14px] font-semibold btn-shadow hover:bg-blu-400 disabled:opacity-50 transition mt-1">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Requesting access...' : 'Request Access'}
            </button>
          </form>

          <p className={`mt-3 text-[11px] text-center ${dark ? 'text-ink-500' : 'text-ink-400'}`}>
            By signing up you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>.
          </p>
          <p className={`mt-6 text-center text-[13px] ${dark ? 'text-ink-500' : 'text-ink-400'}`}>
            Have an account? <Link to="/login" className="text-blu-400 font-semibold hover:text-blu-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
