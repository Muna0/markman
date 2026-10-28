import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../store/ThemeContext'
import { MarkmanWordmark } from '../components/Logo'
import {
  Sun, Moon, ArrowRight, FileSearch, ShieldCheck, Stamp, ClipboardList,
  Copy, Check, Menu, X, FileText, Database, FileDown,
} from 'lucide-react'

const PRIMARY_BTN = 'inline-flex items-center justify-center gap-2 rounded-[5px] bg-blu-500 text-white btn-shadow hover:bg-blu-600 font-medium transition'
const INSTALL_CMD = '/plugin install markman --marketplace Muna0/markman'
const GITHUB_URL = 'https://github.com/Muna0/markman'

function GitHubIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  )
}

function Nav() {
  const { dark, toggle } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const linkCls = `block px-3 py-2 rounded-md text-[15px] font-medium transition ${
    dark ? 'text-ink-200 hover:bg-ink-800' : 'text-ink-950 hover:bg-ink-100'
  }`
  const anchors = [
    { label: 'Tools', href: '#tools' },
    { label: 'How it works', href: '#how' },
    { label: 'Install', href: '#install' },
  ]

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        dark ? 'bg-ink-950/80' : 'bg-white/80'
      } backdrop-blur-[14px] backdrop-saturate-[1.6] ${
        scrolled ? (dark ? 'border-ink-800' : 'border-ink-200') : 'border-transparent'
      }`}
    >
      <div className="max-w-[1168px] mx-auto px-6 h-[68px] flex items-center gap-4">
        <Link to="/" aria-label="Markman, home" className="shrink-0">
          <MarkmanWordmark size={40} dark={dark} />
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-0.5 mx-auto">
          {anchors.map(a => (
            <a key={a.href} href={a.href} className={linkCls}>{a.label}</a>
          ))}
          <Link to="/app/docs" className={linkCls}>Docs</Link>
        </nav>

        <div className="flex items-center gap-2 ml-auto md:ml-0">
          <button
            type="button"
            onClick={toggle}
            aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
            className={`hidden sm:grid w-10 h-10 place-items-center rounded-md border transition ${
              dark ? 'border-ink-700 hover:bg-ink-800 text-ink-200' : 'border-ink-200 hover:bg-ink-100 text-ink-500'
            }`}
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link to="/app" className={`${PRIMARY_BTN} text-[14px] px-3.5 py-[9px] whitespace-nowrap`}>
            Try it free
          </Link>
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className={`md:hidden w-10 h-10 grid place-items-center rounded-md border transition ${
              dark ? 'border-ink-700 text-ink-200' : 'border-ink-200 text-ink-950'
            }`}
          >
            {open ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className={`md:hidden border-b px-6 pt-2 pb-4 ${
            dark ? 'bg-ink-950 border-ink-800' : 'bg-white border-ink-200'
          }`}
        >
          {anchors.map(a => (
            <a key={a.href} href={a.href} onClick={() => setOpen(false)} className={linkCls}>{a.label}</a>
          ))}
          <Link to="/app/docs" onClick={() => setOpen(false)} className={linkCls}>Docs</Link>
          <button type="button" onClick={toggle} className={`sm:hidden w-full text-left flex items-center gap-2 ${linkCls}`}>
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {dark ? 'Light theme' : 'Dark theme'}
          </button>
        </nav>
      )}
    </header>
  )
}

function SectionIntro({ eyebrow, title, children }) {
  const { dark } = useTheme()
  return (
    <div className="max-w-[720px] mx-auto text-center mb-12 md:mb-14">
      <span className={`block text-[13px] font-medium mb-3.5 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>{eyebrow}</span>
      <h2 className={`text-[clamp(30px,3.6vw,44px)] font-bold tracking-[-0.03em] leading-[1.08] text-balance ${dark ? 'text-ink-25' : 'text-ink-950'}`}>
        {title}
      </h2>
      {children && (
        <p className={`mt-4 max-w-[600px] mx-auto text-[16px] leading-relaxed ${dark ? 'text-ink-400' : 'text-ink-500'}`}>{children}</p>
      )}
    </div>
  )
}

function Hero() {
  const { dark } = useTheme()
  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="hero-h">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-[120px] h-[900px] -z-10 pointer-events-none"
        style={{
          background: dark
            ? 'radial-gradient(620px 520px at -4% 18%, rgba(47,99,240,.22), transparent 70%), radial-gradient(700px 520px at 104% 0%, rgba(96,140,255,.16), transparent 70%)'
            : 'radial-gradient(620px 520px at -4% 18%, rgba(47,99,240,.13), transparent 70%), radial-gradient(700px 520px at 104% 0%, rgba(96,140,255,.12), transparent 70%)',
        }}
      />
      <div className="max-w-[1168px] mx-auto px-6 pt-[clamp(56px,8vw,104px)] text-center">
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[14px] font-medium ${
            dark ? 'border-ink-700 bg-ink-900/70 text-ink-200' : 'border-ink-200 bg-white text-ink-600'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blu-500" aria-hidden="true" />
          Free and open source · Apache-2.0
        </span>
        <h1
          id="hero-h"
          className={`mt-6 mx-auto max-w-[14ch] text-[clamp(40px,6vw,72px)] font-bold tracking-[-0.03em] leading-[1.04] text-balance ${
            dark ? 'text-ink-25' : 'text-ink-950'
          }`}
        >
          IP research for the rest of the bar.
        </h1>
        <p className={`mt-6 mx-auto max-w-[620px] text-[clamp(16px,1.4vw,18px)] leading-relaxed ${dark ? 'text-ink-400' : 'text-ink-500'}`}>
          Patent search, freedom-to-operate memos, and trademark clearance for solo practitioners and boutique firms. Live USPTO data. No subscription.
        </p>
        <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <Link to="/app" className={`${PRIMARY_BTN} group text-[15px] px-5 py-3`}>
            Try it free
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#install"
            className={`inline-flex items-center justify-center gap-2 rounded-[5px] border text-[15px] font-medium px-5 py-3 transition ${
              dark
                ? 'border-ink-600 bg-transparent text-ink-25 hover:border-ink-300'
                : 'border-ink-300 bg-white text-ink-950 hover:border-ink-950'
            }`}
          >
            Install the plugin
          </a>
        </div>
        <p className={`mt-5 text-[14px] ${dark ? 'text-ink-400' : 'text-ink-500'}`}>
          No account needed. Your work stays in your browser.
        </p>
      </div>
    </section>
  )
}

const TOOLS = [
  {
    title: 'Patent analysis',
    to: '/app/patent',
    icon: FileSearch,
    desc: 'Search USPTO patents and map claim scope, with Alice and KSR flags.',
  },
  {
    title: 'Freedom to operate',
    to: '/app/fto',
    icon: ShieldCheck,
    desc: 'Element-by-element claim mapping, design-arounds, and a risk rating.',
  },
  {
    title: 'Trademark clearance',
    to: '/app/trademark',
    icon: Stamp,
    desc: 'DuPont likelihood-of-confusion analysis with phonetic variants.',
  },
]

function Tools() {
  const { dark } = useTheme()
  return (
    <section id="tools" className="scroll-mt-[84px] pt-24" aria-labelledby="tools-h">
      <div className="max-w-[1168px] mx-auto px-6">
        <SectionIntro eyebrow="Tools" title={<span id="tools-h">Three analyses, one workspace</span>} />
        <div className="grid gap-4 md:grid-cols-3">
          {TOOLS.map(({ title, to, icon: Icon, desc }) => (
            <Link
              key={to}
              to={to}
              className={`group flex flex-col rounded-[14px] border p-6 transition duration-200 hover:-translate-y-1 ${
                dark
                  ? 'border-ink-800 bg-ink-900 hover:border-ink-600 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,.8)]'
                  : 'border-ink-200 bg-white hover:border-ink-300 hover:shadow-[0_18px_40px_-24px_rgba(11,15,25,.35)]'
              }`}
            >
              <span className={`w-10 h-10 grid place-items-center rounded-[10px] ${dark ? 'bg-blu-500/15 text-blu-300' : 'bg-blu-50 text-blu-500'}`}>
                <Icon className="w-5 h-5" />
              </span>
              <h3 className={`mt-5 text-[19px] font-bold tracking-[-0.02em] ${dark ? 'text-ink-25' : 'text-ink-950'}`}>{title}</h3>
              <p className={`mt-2 text-[15px] leading-relaxed flex-1 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>{desc}</p>
              <span className={`mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium ${dark ? 'text-blu-300' : 'text-blu-500'}`}>
                Open
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
        <Link
          to="/app/intake"
          className={`group mt-4 flex items-center gap-3 rounded-[14px] border px-6 py-4 transition ${
            dark ? 'border-ink-800 hover:border-ink-600 hover:bg-ink-900' : 'border-ink-200 hover:border-ink-300 hover:bg-ink-25'
          }`}
        >
          <ClipboardList className={`w-5 h-5 shrink-0 ${dark ? 'text-ink-400' : 'text-ink-500'}`} />
          <span className={`text-[15px] ${dark ? 'text-ink-200' : 'text-ink-900'}`}>
            <span className="font-bold">Matter intake.</span>{' '}
            <span className={dark ? 'text-ink-400' : 'text-ink-500'}>Not sure where to start? Describe the matter and get routed.</span>
          </span>
          <ArrowRight className={`w-4 h-4 ml-auto shrink-0 transition-transform group-hover:translate-x-0.5 ${dark ? 'text-ink-400' : 'text-ink-500'}`} />
        </Link>
      </div>
    </section>
  )
}

const STEPS = [
  { n: '01', title: 'Describe the matter', icon: FileText },
  { n: '02', title: 'Markman pulls live USPTO data', icon: Database },
  { n: '03', title: 'Review the analysis and export to Word', icon: FileDown },
]

function HowItWorks() {
  const { dark } = useTheme()
  return (
    <section id="how" className="scroll-mt-[84px] pt-24" aria-labelledby="how-h">
      <div className="max-w-[1168px] mx-auto px-6">
        <SectionIntro eyebrow="How it works" title={<span id="how-h">From question to memo in three steps</span>} />
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map(({ n, title, icon: Icon }) => (
            <li
              key={n}
              className={`rounded-[14px] border p-6 ${dark ? 'border-ink-800 bg-ink-900/60' : 'border-ink-200 bg-ink-25'}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[13px] font-bold tracking-wide ${dark ? 'text-blu-300' : 'text-blu-500'}`}>{n}</span>
                <Icon className={`w-5 h-5 ${dark ? 'text-ink-400' : 'text-ink-500'}`} />
              </div>
              <p className={`mt-6 text-[18px] font-bold tracking-[-0.02em] leading-snug ${dark ? 'text-ink-25' : 'text-ink-950'}`}>{title}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function CostPanel() {
  return (
    <section className="pt-24" aria-label="Cost comparison">
      <div className="max-w-[1168px] mx-auto px-6">
        <div
          className="relative overflow-hidden rounded-[16px] border border-[#1C2A50] bg-gradient-to-br from-nav-900 to-nav-800 px-6 py-14 md:px-14 md:py-20 text-center text-white"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(520px 360px at 85% -10%, rgba(47,99,240,.42), transparent 70%), radial-gradient(420px 320px at 0% 110%, rgba(30,58,138,.55), transparent 70%)',
            }}
          />
          <p className="relative mx-auto max-w-[760px] text-[clamp(24px,3.2vw,38px)] font-bold tracking-[-0.03em] leading-[1.15] text-balance">
            PatSnap and Derwent run $15,000 to $100,000 a year.{' '}
            <span className="text-blu-300">Markman is free.</span>
          </p>
        </div>
      </div>
    </section>
  )
}

function Install() {
  const { dark } = useTheme()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section id="install" className="scroll-mt-[84px] pt-24" aria-labelledby="install-h">
      <div className="max-w-[1168px] mx-auto px-6">
        <SectionIntro eyebrow="Install" title={<span id="install-h">Run it in your own terminal</span>}>
          Markman is also a Claude Code plugin. One command installs it.
        </SectionIntro>
        <div className="max-w-[760px] mx-auto">
          <div className="flex items-center gap-3 rounded-[14px] border border-ink-800 bg-ink-950 pl-5 pr-2 py-2">
            <code className="flex-1 min-w-0 overflow-x-auto whitespace-nowrap py-2 font-mono [font-variant-ligatures:none] text-[13px] sm:text-[15px] text-ink-25">
              <span className="text-blu-300 select-none">$ </span>{INSTALL_CMD}
            </code>
            <button
              type="button"
              onClick={copy}
              aria-label="Copy install command"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-[5px] border border-ink-700 px-3 py-2 text-[13px] font-medium text-ink-200 hover:bg-ink-800 transition"
            >
              {copied ? <Check className="w-4 h-4 text-grn-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <span className="sr-only" aria-live="polite">{copied ? 'Copied to clipboard' : ''}</span>
          <p className={`mt-5 text-center text-[15px] ${dark ? 'text-ink-400' : 'text-ink-500'}`}>
            Works in Claude Code. Add a free USPTO key for live lookups.
          </p>
          <div className="mt-5 flex justify-center">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 text-[15px] font-medium ${dark ? 'text-blu-300 hover:text-blu-200' : 'text-blu-500 hover:text-blu-600'}`}
            >
              <GitHubIcon />
              View on GitHub
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function DemoNote() {
  const { dark } = useTheme()
  return (
    <section className="pt-24" aria-label="Demo limits">
      <div className="max-w-[1168px] mx-auto px-6">
        <p
          className={`max-w-[760px] mx-auto rounded-[14px] sm:rounded-full border px-5 py-3 text-center text-[14px] leading-relaxed ${
            dark ? 'border-ink-800 bg-ink-900/60 text-ink-400' : 'border-blu-100 bg-blu-50 text-ink-600'
          }`}
        >
          The public demo allows 3 analyses per visitor per day. For unlimited use, install the plugin.
        </p>
      </div>
    </section>
  )
}

function Footer() {
  const { dark } = useTheme()
  const linkCls = `text-[14px] transition ${dark ? 'text-ink-400 hover:text-ink-25' : 'text-ink-500 hover:text-ink-950'}`
  return (
    <footer className={`mt-24 border-t ${dark ? 'border-ink-800' : 'border-ink-200'}`}>
      <div className="max-w-[1168px] mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="max-w-[440px]">
            <MarkmanWordmark size={36} dark={dark} />
            <p className={`mt-4 text-[14px] leading-relaxed ${dark ? 'text-ink-400' : 'text-ink-500'}`}>
              Markman does not provide legal advice. All analysis must be reviewed by a licensed attorney.
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/privacy" className={linkCls}>Privacy</Link>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className={linkCls}>GitHub</a>
            <Link to="/app/docs" className={linkCls}>Docs</Link>
          </nav>
        </div>
        <div className={`mt-10 pt-6 border-t text-[13px] ${dark ? 'border-ink-800 text-ink-500' : 'border-ink-200 text-ink-500'}`}>
          © 2026 Muna Omar
        </div>
      </div>
    </footer>
  )
}

export default function Landing() {
  const { dark } = useTheme()
  return (
    <div className={`min-h-screen overflow-x-clip ${dark ? 'bg-ink-950' : 'bg-white'}`}>
      <Nav />
      <main id="main">
        <Hero />
        <Tools />
        <HowItWorks />
        <CostPanel />
        <Install />
        <DemoNote />
      </main>
      <Footer />
    </div>
  )
}
