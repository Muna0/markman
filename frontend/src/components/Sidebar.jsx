import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useTheme } from '../store/ThemeContext'
import {
  LayoutDashboard, FileSearch, FlaskConical, Stamp, ShieldCheck,
  Sun, Moon, Menu, X, Settings, FolderOpen, BookOpen,
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
  const { dark, toggle } = useTheme()
  const [open, setOpen] = useState(false)

  const navLink = (to, label, Icon, end) => (
    <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] font-medium mono transition-colors ${
          isActive
            ? dark ? 'bg-blu-500/10 text-blu-400' : 'bg-blu-50 text-blu-600'
            : dark ? 'text-ink-400 hover:text-ink-100 hover:bg-ink-800/50' : 'text-ink-500 hover:text-ink-800 hover:bg-ink-100'
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
        dark ? 'bg-ink-950 border-ink-800/40' : 'bg-ink-25 border-ink-200'
      } ${open ? 'translate-x-0' : 'max-lg:-translate-x-full'}`}>
        <div className={`flex items-center px-5 py-4 border-b ${dark ? 'border-ink-800/40' : 'border-ink-200'}`}>
          <MarkmanWordmark size={52} dark={dark} />
          <button onClick={() => setOpen(false)} className="ml-auto lg:hidden p-1 rounded hover:bg-ink-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className={`mono text-[10px] font-bold uppercase tracking-[0.15em] px-3 mb-2 ${dark ? 'text-blu-500' : 'text-blu-500'}`}>Tools</p>
          <div className="space-y-0.5 mb-6">
            {tools.map(t => navLink(t.to, t.label, t.icon, t.end))}
          </div>
          <p className={`mono text-[10px] font-bold uppercase tracking-[0.15em] px-3 mb-2 ${dark ? 'text-blu-500' : 'text-blu-500'}`}>Manage</p>
          <div className="space-y-0.5">
            {navLink('/app/files', 'Files', FolderOpen)}
            {navLink('/app/docs', 'Documentation', BookOpen)}
            {navLink('/app/settings', 'Settings', Settings)}
          </div>
        </nav>

        <div className={`px-4 py-3 border-t ${dark ? 'border-ink-800/40' : 'border-ink-200'}`}>
          <div className="flex items-center justify-between px-1">
            <span className={`mono text-[11px] ${dark ? 'text-ink-500' : 'text-ink-400'}`}>{dark ? 'Dark' : 'Light'}</span>
            <button onClick={toggle} className={`p-1.5 rounded-lg transition ${dark ? 'hover:bg-ink-800' : 'hover:bg-ink-100'}`}>
              {dark ? <Sun className="w-3.5 h-3.5 text-amb-400" /> : <Moon className="w-3.5 h-3.5 text-ink-400" />}
            </button>
          </div>
          <p className={`mono text-[10px] mt-2 px-1 ${dark ? 'text-ink-600' : 'text-ink-300'}`}>v1.0.0 · Claude Code Plugin</p>
        </div>
      </aside>
    </>
  )
}
