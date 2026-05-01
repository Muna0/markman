import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../store/ThemeContext'
import { MarkmanWordmark } from '../components/Logo'
import {
  Sun, Moon, ArrowRight, FileSearch, FlaskConical, Stamp, ShieldCheck,
  Terminal, Copy,
} from 'lucide-react'

function TermLine({ children, color = 'text-ink-400' }) {
  return <div className={`${color}`}>{children}</div>
}

function Nav() {
  const { dark, toggle } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
      scrolled ? (dark ? 'glass-dark border-ink-800/40' : 'glass-light border-ink-200') : 'border-transparent'
    }`}>
      <div className="max-w-[1120px] mx-auto px-6 h-[56px] flex items-center justify-between">
        <MarkmanWordmark size={48} dark={dark} />
        <div className="hidden md:flex items-center gap-7">
          {['What it does', 'Tools', 'Install'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
              className={`mono text-[15px] font-medium relative transition after:absolute after:left-0 after:bottom-[-4px] after:w-0 after:h-[1.5px] after:bg-blu-500 after:transition-all hover:after:w-full ${dark ? 'text-ink-400 hover:text-ink-100' : 'text-ink-500 hover:text-ink-950'}`}>{l}</a>
          ))}
          <Link to="/app/docs" className={`mono text-[14px] font-medium transition ${dark ? 'text-ink-400 hover:text-ink-100' : 'text-ink-500 hover:text-ink-950'}`}>Docs</Link>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggle} className={`p-2 rounded-lg transition ${dark ? 'hover:bg-ink-800' : 'hover:bg-ink-100'}`}>
            {dark ? <Sun className="w-4 h-4 text-amb-400" /> : <Moon className="w-4 h-4 text-ink-400" />}
          </button>
          <Link to="/app" className="mono text-[14px] font-bold px-4 py-2 rounded-md bg-blu-500 text-ink-950 btn-shadow hover:bg-blu-400 transition">
            Open App →
          </Link>
        </div>
      </div>
    </nav>
  )
}

function Hero() {
  const { dark } = useTheme()
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText('claude plugin install markman')
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-[80px] pb-16 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="claimPat" x="0" y="0" width="120" height="80" patternUnits="userSpaceOnUse">
            <line x1="20" y1="10" x2="100" y2="10" stroke="#E8E4D8" strokeWidth="0.5"/>
            <line x1="30" y1="25" x2="90" y2="25" stroke="#E8E4D8" strokeWidth="0.3"/>
            <line x1="30" y1="35" x2="80" y2="35" stroke="#E8E4D8" strokeWidth="0.3"/>
            <line x1="16" y1="8" x2="16" y2="40" stroke="#E8E4D8" strokeWidth="0.3"/>
            <line x1="16" y1="8" x2="20" y2="8" stroke="#E8E4D8" strokeWidth="0.3"/>
            <line x1="16" y1="40" x2="20" y2="40" stroke="#E8E4D8" strokeWidth="0.3"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#claimPat)"/>
        </svg>
      </div>
      <div className="max-w-[1120px] mx-auto px-6 relative">
        <p className="anim-reveal mono text-[13px] tracking-[0.15em] uppercase text-blu-500 mb-6">&gt;_ Claude Code Plugin for IP Law</p>
        <h1 className={`anim-reveal d1 serif text-[clamp(40px,7vw,80px)] font-bold tracking-[-0.03em] leading-[1.08] mb-6 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>
          Patent analysis &amp;<br/>trademark clearance,<br/><em className="text-blu-500">at the command line.</em>
        </h1>
        <p className={`anim-reveal d2 text-[20px] leading-[1.7] max-w-[540px] mb-4 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>
          Built for solo IP practitioners and boutique firms who need patent claim analysis, trademark clearance, and FTO memos without the $50,000 platform. Connects to live USPTO and WIPO data through Claude Code.
        </p>

        {/* Cost + outcome proof */}
        <div className={`anim-reveal d2 flex items-center gap-5 mb-9 flex-wrap ${dark ? 'text-ink-300' : 'text-ink-600'}`}>
          <span className="flex items-center gap-2 text-[15px]">
            <span className="text-grn-400 font-bold">✓</span> Free and open source
          </span>
          <span className={`${dark ? 'text-ink-600' : 'text-ink-300'}`}>|</span>
          <span className="flex items-center gap-2 text-[15px]">
            <span className="text-grn-400 font-bold">✓</span> 47-claim patent analyzed in 90 seconds
          </span>
          <span className={`${dark ? 'text-ink-600' : 'text-ink-300'}`}>|</span>
          <span className="flex items-center gap-2 text-[15px]">
            <span className="text-grn-400 font-bold">✓</span> No subscription
          </span>
        </div>

        <div className="anim-reveal d3 flex items-center gap-3 mb-8 flex-wrap">
          <Link to="/app" className="group flex items-center gap-2 px-6 py-3 rounded-md mono text-[15px] font-bold bg-blu-500 text-ink-950 btn-shadow hover:bg-blu-400 transition">
            Open the App <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a href="#install" className={`flex items-center gap-2 px-6 py-3 rounded-md mono text-[15px] font-medium border transition ${dark ? 'border-ink-700 text-ink-300 hover:border-blu-500 hover:text-blu-400' : 'border-ink-300 text-ink-600 hover:border-blu-500'}`}>
            <Terminal className="w-3.5 h-3.5" /> Install in 5 Minutes
          </a>
        </div>
        <button onClick={copy} className={`anim-reveal d4 inline-flex items-center gap-3 px-5 py-2.5 rounded-full border transition mb-12 ${dark ? 'bg-ink-900 border-ink-700 hover:border-blu-500' : 'bg-ink-25 border-ink-200 hover:border-blu-500'}`}>
          <code className={`mono text-[14px] ${dark ? 'text-ink-300' : 'text-ink-600'}`}><span className="text-ink-500">$</span> claude plugin install markman</code>
          {copied
            ? <span className="mono text-[13px] text-grn-400">✓ Copied</span>
            : <Copy className="w-3.5 h-3.5 text-ink-500" />
          }
        </button>
        <div className={`anim-reveal d5 w-full h-px mb-6 ${dark ? 'bg-blu-500/30' : 'bg-blu-500/20'}`} />
        <div className="anim-reveal d6 flex gap-10 flex-wrap">
          {[['6', 'Components'], ['7', 'Connectors'], ['5', 'Commands'], ['4', 'Claim Types']].map(([v, l]) => (
            <div key={l} className="mono text-[14px] text-ink-400">
              <strong className={`font-bold mr-1 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>{v}</strong>{l}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhatItDoes() {
  const { dark } = useTheme()
  return (
    <section id="what-it-does" className={`py-24 scroll-mt-14 ${dark ? 'bg-ink-900/50' : 'bg-ink-25'}`}>
      <div className="max-w-[1120px] mx-auto px-6">
        <p className="mono text-[11px] tracking-[0.15em] uppercase text-blu-500 mb-3">What it does</p>
        <div className="grid lg:grid-cols-2 gap-14">
          <div>
            <h2 className={`serif text-[clamp(28px,4vw,44px)] font-bold tracking-[-0.02em] leading-[1.12] mb-5 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>
              Four IP analysis tools.<br/>Two live API connections.
            </h2>
            <p className={`text-[18px] leading-[1.7] mb-8 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>
              Markman is a Claude Code plugin that gives you structured IP analysis skills backed by real-time patent and trademark data from the USPTO and WIPO.
            </p>
            <ul className="space-y-3">
              {[
                'Skills fire automatically when you discuss IP matters',
                'Slash commands for on-demand analysis (/review-claims, /tm-clearance, /fto-analysis)',
                'MCP servers handle rate limiting, retries, and data normalization',
                'Playbook is fully editable — match your firm\'s standards',
              ].map(t => (
                <li key={t} className="flex items-start gap-2.5 text-[14px]">
                  <span className="text-grn-400 font-bold text-[16px] mt-0.5 shrink-0">✓</span>
                  <span className={dark ? 'text-ink-300' : 'text-ink-600'}>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={`rounded-xl border p-6 ${dark ? 'bg-ink-800/40 border-ink-700/40' : 'bg-ink-25 border-ink-200'}`}>
            <p className="mono text-[10px] tracking-[0.12em] uppercase text-ink-400 mb-4">Plugin Architecture</p>
            {[
              { cat: 'Skills', color: 'text-blu-500', items: ['patent-analysis', 'fto-memo', 'trademark-screen', 'matter-intake'] },
              { cat: 'Commands', color: 'text-vio-400', items: ['/review-claims', '/fto-analysis', '/tm-clearance'] },
              { cat: 'MCP Servers', color: 'text-grn-400', items: ['uspto-server (4 tools)', 'wipo-server (2 tools)'] },
              { cat: 'Playbook', color: 'text-amb-400', items: ['FTO thresholds', 'TM jurisdictions', 'Claim drafting', 'Deadlines'] },
            ].map(g => (
              <div key={g.cat} className={`py-3.5 border-b last:border-0 ${dark ? 'border-ink-700/30' : 'border-ink-200'}`}>
                <p className={`mono text-[10px] font-bold uppercase tracking-[0.1em] mb-2 ${g.color}`}>{g.cat}</p>
                <div className="flex flex-wrap gap-1.5">
                  {g.items.map(i => (
                    <span key={i} className={`mono text-[11px] px-2 py-0.5 rounded ${dark ? 'bg-ink-800 text-ink-300' : 'bg-ink-100 text-ink-600'}`}>{i}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function TerminalMockup({ title, lines }) {
  const { dark } = useTheme()
  return (
    <div className="bg-[#080E09] flex flex-col rounded-br-xl overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-amb-400/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-grn-400/60" />
        <span className="mono text-[10px] text-ink-500 ml-2">{title}</span>
      </div>
      <div className="mono text-[13px] leading-[1.8] p-5 flex-1">
        {lines.map((line, i) => (
          <TermLine key={i} color={line.color}>{line.text}</TermLine>
        ))}
      </div>
    </div>
  )
}

function Tools() {
  const { dark } = useTheme()
  const [tab, setTab] = useState(0)
  const tools = [
    { id: 'patent', label: 'Patent Analysis', icon: FlaskConical,
      title: 'Parse claims. Map scope. Surface risks.',
      desc: 'Drop in a patent number — Markman maps the full dependency tree, assesses breadth per limitation, and flags Alice/KSR issues.',
      lines: [
        { text: '> /review-claims US11,234,567', color: 'text-blu-500' },
        { text: '', color: '' },
        { text: 'Retrieving patent from USPTO...', color: 'text-ink-500' },
        { text: '', color: '' },
        { text: 'PATENT ANALYSIS — US 11,987,654', color: 'text-grn-400' },
        { text: 'Filing: 2024-03-15', color: 'text-ink-400' },
        { text: '', color: '' },
        { text: 'CLAIM MAP', color: 'text-ink-300' },
        { text: '  Claim 1 (Independent, Method)  Alice 101 risk', color: 'text-red-400' },
        { text: '  Claim 2 (Dependent → 1)        Medium breadth', color: 'text-ink-400' },
        { text: '  Claim 5 (Independent, System)  Rewrite standalone', color: 'text-amb-400' },
      ],
    },
    { id: 'tm', label: 'TM Clearance', icon: Stamp,
      title: 'Screen marks across jurisdictions.',
      desc: 'Enter a mark and goods. Markman scores all 8 DuPont factors and delivers CLEAR / RISK / BLOCK per jurisdiction.',
      lines: [
        { text: '> /tm-clearance NEXAFLOW | SaaS workflow | US, EU, UK', color: 'text-blu-500' },
        { text: '', color: '' },
        { text: 'Searching USPTO...', color: 'text-ink-500' },
        { text: '', color: '' },
        { text: 'TRADEMARK CLEARANCE — NEXAFLOW', color: 'text-grn-400' },
        { text: '  US — NEXFLOW (Cls 042)  CONFLICT  85%', color: 'text-red-400' },
        { text: '  EU — No conflicts        CLEAR', color: 'text-grn-400' },
        { text: '  UK — No conflicts        CLEAR', color: 'text-grn-400' },
        { text: '', color: '' },
        { text: 'Overall: CLEAR WITH RISK', color: 'text-amb-400' },
      ],
    },
    { id: 'fto', label: 'FTO Assessment', icon: ShieldCheck,
      title: 'Claim-by-claim mapping with design-arounds.',
      desc: 'Describe your technology. Markman maps each limitation and rates non-infringement arguments.',
      lines: [
        { text: '> /fto-analysis Transformer medical NER', color: 'text-blu-500' },
        { text: '', color: '' },
        { text: 'PRIVILEGED — ATTORNEY WORK PRODUCT', color: 'text-ink-500' },
        { text: '', color: '' },
        { text: 'FTO — Transformer Medical NER', color: 'text-grn-400' },
        { text: 'Risk: MEDIUM', color: 'text-amb-400' },
        { text: '', color: '' },
        { text: '  "recurrent NN" →  DOES NOT MEET (transformer)', color: 'text-grn-400' },
        { text: '  "remote server" → DOES NOT MEET (on-device)', color: 'text-grn-400' },
        { text: '', color: '' },
        { text: '  Non-infringement: STRONG', color: 'text-grn-400' },
      ],
    },
    { id: 'intake', label: 'Matter Intake', icon: FileSearch,
      title: 'Classify, extract facts, flag deadlines.',
      desc: 'Describe any IP matter. Markman classifies the type, extracts key facts, and assigns risk.',
      lines: [
        { text: '> NDA for algorithm disclosure to partner', color: 'text-blu-500' },
        { text: '', color: '' },
        { text: 'MATTER INTAKE', color: 'text-grn-400' },
        { text: '  Primary:   Trade Secret', color: 'text-ink-300' },
        { text: '  Secondary: Patent (no provisional)', color: 'text-ink-400' },
        { text: '', color: '' },
        { text: '  DEADLINE', color: 'text-ink-300' },
        { text: '    Execute NDA before disclosure  URGENT', color: 'text-red-400' },
        { text: '', color: '' },
        { text: '  Risk: MEDIUM — NDA not yet signed.', color: 'text-amb-400' },
      ],
    },
  ]
  const t = tools[tab]

  return (
    <section id="tools" className="py-24 scroll-mt-14">
      <div className="max-w-[1120px] mx-auto px-6">
        <p className="mono text-[11px] tracking-[0.15em] uppercase text-blu-500 mb-3">Tools</p>
        <h2 className={`serif text-[clamp(28px,4vw,44px)] font-bold tracking-[-0.02em] mb-8 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>
          See what each tool produces.
        </h2>
        <div className={`flex border-b mb-0 overflow-x-auto ${dark ? 'border-ink-700/40' : 'border-ink-200'}`}>
          {tools.map((tool, i) => (
            <button key={tool.id} onClick={() => setTab(i)}
              className={`mono text-[14px] px-5 py-3 border-b-2 transition whitespace-nowrap ${
                i === tab
                  ? `border-blu-500 ${dark ? 'text-ink-50' : 'text-ink-950'}`
                  : `border-transparent ${dark ? 'text-ink-400 hover:text-ink-200' : 'text-ink-500 hover:text-ink-700'}`
              }`}>{tool.label}</button>
          ))}
        </div>
        <div className={`grid lg:grid-cols-2 rounded-b-xl border border-t-0 overflow-hidden min-h-[340px] ${dark ? 'bg-ink-800/30 border-ink-700/40' : 'bg-ink-25 border-ink-200'}`} key={t.id}>
          <div className="p-10 flex flex-col justify-center">
            <h3 className={`serif text-[22px] font-bold mb-3 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>{t.title}</h3>
            <p className={`text-[17px] leading-[1.7] mb-5 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>{t.desc}</p>
            <Link to="/app" className="mono text-[14px] font-medium text-blu-500 inline-flex items-center gap-1 hover:gap-2 transition-all">
              Try it now →
            </Link>
          </div>
          <TerminalMockup title="claude" lines={t.lines} />
        </div>
      </div>
    </section>
  )
}

function Install() {
  const { dark } = useTheme()
  return (
    <section id="install" className={`py-24 scroll-mt-14 ${dark ? 'bg-ink-900/50' : 'bg-ink-25'}`}>
      <div className="max-w-[1120px] mx-auto px-6">
        <p className="mono text-[11px] tracking-[0.15em] uppercase text-blu-500 mb-3">Install</p>
        <h2 className={`serif text-[clamp(28px,4vw,44px)] font-bold tracking-[-0.02em] mb-4 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Up and running in 5 minutes.</h2>
        <p className={`text-[15px] mb-10 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>Requires Node.js 18+ and Claude Code. API keys from USPTO and WIPO are free.</p>
        <div className="grid sm:grid-cols-3 gap-5 mb-10">
          {[
            { n: '01', t: 'Get the tools', d: 'Install Node.js 18+ and Claude Code. Get free API keys from data.uspto.gov and wipo.int/case.' },
            { n: '02', t: 'Install the plugin', d: 'Run claude plugin install markman in your terminal. Configure your API keys.' },
            { n: '03', t: 'Start analyzing', d: 'Open Claude Code and type /review-claims with any patent number.' },
          ].map(s => (
            <div key={s.n} className={`rounded-xl border p-7 ${dark ? 'bg-ink-800/40 border-ink-700/40' : 'bg-ink-25 border-ink-200'}`}>
              <p className="mono text-[11px] text-blu-500 tracking-[0.1em] mb-3">{s.n}</p>
              <h4 className={`serif text-[18px] font-bold mb-2 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>{s.t}</h4>
              <p className={`text-[13px] leading-[1.6] ${dark ? 'text-ink-400' : 'text-ink-500'}`}>{s.d}</p>
            </div>
          ))}
        </div>
        <TerminalMockup title="terminal" lines={[
          { text: '# Clone and install', color: 'text-ink-500' },
          { text: '$ git clone https://github.com/markman-ip/markman.git', color: 'text-blu-500' },
          { text: '$ cd markman && npm install', color: 'text-blu-500' },
          { text: 'added 91 packages in 3s', color: 'text-grn-400' },
          { text: '', color: '' },
          { text: '# Configure API keys', color: 'text-ink-500' },
          { text: '$ echo "USPTO_API_KEY=your_key" > .env', color: 'text-blu-500' },
          { text: '$ echo "WIPO_API_KEY=your_key" >> .env', color: 'text-blu-500' },
          { text: '', color: '' },
          { text: '# Install plugin', color: 'text-ink-500' },
          { text: '$ claude plugin install ./', color: 'text-blu-500' },
          { text: '✓ Plugin "markman" installed successfully', color: 'text-grn-400' },
          { text: '  4 skills · 3 commands · 2 MCP servers', color: 'text-grn-400' },
        ]} />
      </div>
    </section>
  )
}

function Footer() {
  const { dark } = useTheme()
  return (
    <footer className={`py-10 border-t ${dark ? 'border-ink-800/40' : 'border-ink-200'}`}>
      <div className="max-w-[1120px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <MarkmanWordmark size={44} dark={dark} />
        <div className="flex items-center gap-5">
          {['What it does', 'Tools', 'Install'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`} className="mono text-[13px] text-ink-400 hover:text-blu-500 transition">{l}</a>
          ))}
        </div>
        <p className="mono text-[11px] text-ink-500">§ Built on Claude Code · MCP Standard</p>
      </div>
      <div className={`max-w-[1120px] mx-auto px-6 mt-6 pt-5 border-t ${dark ? 'border-blu-500/10' : 'border-ink-200'}`}>
        <p className="mono text-[11px] text-ink-500 opacity-60">© 2026 Markman. Apache-2.0 License.</p>
      </div>
    </footer>
  )
}

export default function Landing() {
  const { dark } = useTheme()
  return (
    <div className={`${dark ? 'bg-ink-950 text-ink-400' : 'bg-ink-25 text-ink-500'} transition-colors`}>
      <Nav />
      <Hero />
      <WhatItDoes />
      <Tools />
      <Install />
      <Footer />
    </div>
  )
}
