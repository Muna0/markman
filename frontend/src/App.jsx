import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useTheme } from './store/ThemeContext'
import { useStore } from './store/useStore'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import IpTriage from './pages/IpTriage'
import PatentAnalysis from './pages/PatentAnalysis'
import TrademarkClearance from './pages/TrademarkClearance'
import FtoAnalysis from './pages/FtoAnalysis'
import Settings from './pages/Settings'
import Files from './pages/Files'
import Docs from './pages/Docs'
import Privacy from './pages/Privacy'

function AppLayout() {
  const { dark } = useTheme()
  return (
    <div className={`flex min-h-screen transition-colors ${dark ? 'bg-ink-950 text-ink-200' : 'bg-ink-25 text-ink-600'}`}>
      <Sidebar />
      <div className="flex-1 ml-[240px] max-lg:ml-0 flex flex-col">
        <TopBar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function App() {
  const store = useStore()

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Dashboard analyses={store.analyses} />} />
        <Route path="intake" element={<IpTriage addMatter={store.addMatter} />} />
        <Route path="patent" element={<PatentAnalysis />} />
        <Route path="trademark" element={<TrademarkClearance />} />
        <Route path="fto" element={<FtoAnalysis />} />
        <Route path="files" element={<Files />} />
        <Route path="docs" element={<Docs />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
