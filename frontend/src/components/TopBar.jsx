import { useTheme } from '../store/ThemeContext'
import { Link } from 'react-router-dom'
import { Home, BookOpen, Sun, Moon } from 'lucide-react'

export default function TopBar() {
  const { dark, toggle } = useTheme()
  const ghost = `flex items-center gap-1.5 px-3 py-2 rounded-[6px] text-[14px] font-medium transition ${
    dark ? 'text-ink-300 hover:text-white hover:bg-white/5' : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100'
  }`

  return (
    <header className={`sticky top-0 z-30 h-[68px] flex items-center justify-between pl-16 pr-5 lg:px-6 border-b ${
      dark ? 'glass-dark border-white/10' : 'glass-light border-ink-200'
    }`}>
      <Link to="/" aria-label="Home" className={ghost}>
        <Home className="w-4 h-4" /> <span className="hidden sm:inline">Home</span>
      </Link>
      <div className="flex items-center gap-2">
        <Link to="/app/docs" aria-label="Docs" className={ghost}>
          <BookOpen className="w-4 h-4" /> <span className="hidden sm:inline">Docs</span>
        </Link>
        <button onClick={toggle} aria-label="Toggle theme" className={`p-2 rounded-[6px] transition ${dark ? 'text-ink-300 hover:bg-white/5' : 'text-ink-500 hover:bg-ink-100'}`}>
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <a href="https://github.com/Muna0/markman#quick-start" target="_blank" rel="noopener noreferrer"
          className="whitespace-nowrap px-3 sm:px-4 py-2 rounded-[5px] text-[14px] font-bold bg-blu-500 text-white btn-shadow hover:bg-blu-600 transition">
          <span className="sm:hidden">Plugin</span><span className="hidden sm:inline">Get the plugin</span>
        </a>
      </div>
    </header>
  )
}
