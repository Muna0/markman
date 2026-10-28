import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useTheme } from '../store/ThemeContext'
import {
  LayoutDashboard, FileSearch, FlaskConical, Stamp, ShieldCheck,
  Menu, X, BookOpen,
} from 'lucide-react'
import { MarkmanWordmark } from './Logo'

const tools = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/intake', label: 'Matter Intake', icon: FileSearch },
  { to: '/app/patent', label: 'Patent Analysis', icon: FlaskConical },
  { to: '/app/trademark', label: 'TM Clearance', icon: Stamp },
  { to: '/app/fto', label: 'FTO Analysis', icon: ShieldCheck },
]

export default function Sidebar() {
  const { dark } = useTheme()
  const [open, setOpen] = useState(false)

  const navLink = (to, label, Icon, end) => (
    <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[14px] font-medium transition-colors ${
          isActive
            ? dark ? 'bg-blu-500/15 text-blu-300' : 'bg-blu-50 text-blu-600'
            : dark ? 'text-ink-400 hover:text-ink-100 hover:bg-white/5' : 'text-ink-500 hover:text-ink-800 hover:bg-ink-100'
        }`
      }>
      <Icon className="w-[16px] h-[16px]" />
      {label}
    </NavLink>
  )

  return (
    <>
      <button onClick={() => setOpen(true)} className={`fixed top-3.5 left-4 z-50 lg:hidden p-2 rounded-lg border ${dark ? 'bg-ink-900 border-ink-700' : 'bg-white border-ink-200'} shadow-lg`}>
        <Menu className="w-4.5 h-4.5" />
      </button>

      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed top-0 left-0 z-50 h-screen w-[240px] flex flex-col transition-transform duration-200 border-r ${
        dark ? 'bg-ink-950 border-white/10' : 'bg-white border-ink-200'
      } ${open ? 'translate-x-0' : 'max-lg:-translate-x-full'}`}>
        <div className={`flex items-center px-5 py-4 border-b ${dark ? 'border-white/10' : 'border-ink-200'}`}>
          <MarkmanWordmark size={52} dark={dark} />
          <button onClick={() => setOpen(false)} className="ml-auto lg:hidden p-1 rounded hover:bg-ink-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className={`text-[12px] font-semibold uppercase tracking-[0.08em] px-3 mb-2 text-ink-500`}>Tools</p>
          <div className="space-y-0.5 mb-6">
            {tools.map(t => navLink(t.to, t.label, t.icon, t.end))}
          </div>
          <p className={`text-[12px] font-semibold uppercase tracking-[0.08em] px-3 mb-2 text-ink-500`}>Manage</p>
          <div className="space-y-0.5">
            {navLink('/app/docs', 'Documentation', BookOpen)}
          </div>
        </nav>

        <div className={`px-4 py-3 border-t ${dark ? 'border-white/10' : 'border-ink-200'}`}>
          <p className={`text-[12px] px-1 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>v1.2.0 · Free and open source</p>
          <a href="https://github.com/Muna0/markman" target="_blank" rel="noopener noreferrer"
            className={`inline-block text-[12px] font-medium mt-1 px-1 underline-offset-2 hover:underline ${dark ? 'text-blu-300' : 'text-blu-600'}`}>GitHub</a>
        </div>
      </aside>
    </>
  )
}
