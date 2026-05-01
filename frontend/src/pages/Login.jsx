import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import { useTheme } from '../store/ThemeContext'
import { Scale, Sun, Moon, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!email || !password) { setError('All fields are required'); return }
    setError(''); setLoading(true)
    setTimeout(() => { login({ name: email.split('@')[0], email }); navigate('/app') }, 800)
  }

  return (
    <div className={`min-h-screen flex ${dark ? 'bg-ink-950' : 'bg-ink-25'} transition-colors`}>
      {/* Left — branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-ink-950 relative overflow-hidden flex-col justify-between p-14">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[20%] w-[350px] h-[350px] rounded-full bg-blu-500/[0.08] blur-[100px]" />
          <div className="absolute bottom-[15%] right-[15%] w-[280px] h-[280px] rounded-full bg-vio-500/[0.06] blur-[80px]" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-20">
            <div className="w-8 h-8 rounded-md bg-blu-500 flex items-center justify-center">
              <Scale className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-[17px] font-bold text-white tracking-[-0.02em]">ipsuite</span>
          </div>
          <h2 className="text-[36px] font-bold text-white tracking-[-0.03em] leading-[1.15] mb-5">
            IP intelligence that<br />moves at the speed<br />of your practice.
          </h2>
          <p className="text-[15px] text-ink-400 leading-[1.6] max-w-[380px]">
            Patent analysis, trademark clearance, FTO assessments — connected to live USPTO & WIPO data.
          </p>
        </div>
        <div className="relative flex items-center gap-8">
          {[{ v: '500+', l: 'Matters' }, { v: '50+', l: 'Firms' }, { v: '99.2%', l: 'Deadline rate' }].map(s => (
            <div key={s.l}>
              <p className="text-[20px] font-bold text-white mono">{s.v}</p>
              <p className="text-[11px] text-ink-500">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
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

          <h1 className={`text-[24px] font-bold tracking-[-0.02em] mb-1 ${dark ? 'text-white' : 'text-ink-950'}`}>Welcome back</h1>
          <p className={`text-[14px] mb-8 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>Sign in to your account</p>

          {error && <div className="mb-4 px-4 py-2.5 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-[13px]">{error}</div>}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className={`block text-[13px] font-medium mb-1.5 ${dark ? 'text-ink-200' : 'text-ink-700'}`}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@yourfirm.com"
                className={`w-full rounded-[10px] border px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blu-500/50 focus:border-blu-500 transition placeholder:text-ink-500 ${dark ? 'bg-ink-900 border-ink-700 text-ink-100' : 'bg-white border-ink-200 text-ink-900'}`} />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className={`text-[13px] font-medium ${dark ? 'text-ink-200' : 'text-ink-700'}`}>Password</label>
                <a href="#" className="text-[12px] text-blu-400 hover:text-blu-300">Forgot?</a>
              </div>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password"
                  className={`w-full rounded-[10px] border px-4 py-2.5 pr-10 text-[14px] focus:outline-none focus:ring-2 focus:ring-blu-500/50 focus:border-blu-500 transition placeholder:text-ink-500 ${dark ? 'bg-ink-900 border-ink-700 text-ink-100' : 'bg-white border-ink-200 text-ink-900'}`} />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] bg-blu-500 text-white text-[14px] font-semibold btn-shadow hover:bg-blu-400 disabled:opacity-50 transition">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className={`flex-1 h-px ${dark ? 'bg-ink-800' : 'bg-ink-200'}`} />
            <span className="text-[11px] text-ink-500">or</span>
            <div className={`flex-1 h-px ${dark ? 'bg-ink-800' : 'bg-ink-200'}`} />
          </div>

          <button onClick={() => { login({ name: 'Demo User', email: 'demo@ipsuite.io' }); navigate('/app') }}
            className={`w-full py-2.5 rounded-[10px] text-[13px] font-semibold border transition ${dark ? 'border-ink-700 text-ink-200 hover:border-ink-500 hover:bg-ink-900' : 'border-ink-200 text-ink-700 hover:border-ink-400 hover:bg-ink-50'}`}>
            Continue as Demo User
          </button>

          <p className={`mt-8 text-center text-[13px] ${dark ? 'text-ink-500' : 'text-ink-400'}`}>
            No account? <Link to="/signup" className="text-blu-400 font-semibold hover:text-blu-300">Start free trial</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
