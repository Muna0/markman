import { useTheme } from '../store/ThemeContext'
import { Link } from 'react-router-dom'
import { Search, Home, BookOpen } from 'lucide-react'

export default function TopBar() {
  const { dark } = useTheme()

  return (
    <header className={`sticky top-0 z-30 h-[52px] flex items-center justify-between px-5 border-b ${
      dark ? 'glass-dark border-ink-800/40' : 'glass-light border-ink-200'
    }`}>
      <div className="flex items-center gap-3">
        <Link to="/" className={`flex items-center gap-1.5 mono text-[12px] font-medium transition ${dark ? 'text-ink-400 hover:text-ink-100' : 'text-ink-500 hover:text-ink-700'}`}>
          <Home className="w-3.5 h-3.5" /> Home
        </Link>
        <div className={`w-px h-4 ${dark ? 'bg-ink-700' : 'bg-ink-200'}`} />
        <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 w-48 max-sm:hidden ${dark ? 'bg-ink-800/60' : 'bg-ink-100'}`}>
          <Search className="w-3.5 h-3.5 text-ink-400" />
          <input type="text" placeholder="Search..." className={`bg-transparent text-[13px] w-full focus:outline-none placeholder:text-ink-500 ${dark ? 'text-ink-100' : 'text-ink-700'}`} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link to="/app/docs" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg mono text-[12px] font-medium transition ${dark ? 'text-ink-400 hover:text-ink-100 hover:bg-ink-800' : 'text-ink-500 hover:text-ink-700 hover:bg-ink-100'}`}>
          <BookOpen className="w-3.5 h-3.5" /> Docs
        </Link>
        <Link to="/app/settings" className="px-3 py-1.5 rounded-md mono text-[12px] font-bold bg-blu-500 text-ink-950 btn-shadow hover:bg-blu-400 transition">
          Settings
        </Link>
      </div>
    </header>
  )
}
