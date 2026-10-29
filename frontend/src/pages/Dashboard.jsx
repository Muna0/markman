import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../store/ThemeContext'
import { api } from '../store/api'
import { localHistory } from '../store/localHistory'
import {
  FileSearch, FlaskConical, Stamp, ShieldCheck,
  ArrowRight, Server, Key, CheckCircle2, AlertTriangle, Clock, Download, Trash2,
} from 'lucide-react'

export default function Dashboard() {
  const { dark } = useTheme()
  const [serverStatus, setServerStatus] = useState(null)
  const [history] = useState(() => localHistory.list())

  useEffect(() => {
    api.status().then(setServerStatus).catch(() => setServerStatus(null))
  }, [])

  const usptoKey = serverStatus?.uspto === 'configured' ? 'yes' : ''
  const wipoKey = serverStatus?.wipo === 'configured' ? 'yes' : ''

  const tools = [
    { to: '/app/intake', label: 'Matter Intake', desc: 'Classify an IP matter, extract facts, flag deadlines', icon: FileSearch },
    { to: '/app/patent', label: 'Patent Analysis', desc: 'Parse claims, map scope, surface prior art risks', icon: FlaskConical },
    { to: '/app/trademark', label: 'TM Clearance', desc: 'Screen marks across jurisdictions with a DuPont factor analysis', icon: Stamp },
    { to: '/app/fto', label: 'FTO Analysis', desc: 'Element-by-element claim mapping, design-arounds', icon: ShieldCheck },
  ]

  const connectionStatus = [
    { name: 'USPTO API', connected: usptoKey.length > 0, tools: 'search_patents, get_patent_details, search_trademarks, check_trademark_status' },
    { name: 'WIPO API', connected: wipoKey.length > 0, tools: 'search_international_patents, get_pct_application' },
  ]

  function clearHistory() {
    localHistory.clear()
    localStorage.removeItem('markman-analyses')
    window.location.reload()
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className={`text-[28px] tracking-[-0.02em] font-bold ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Dashboard</h1>
        <p className={`text-[13px] mt-1 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>Markman plugin status and tools</p>
      </div>

      {/* Connection status */}
      <div className={`rounded-[14px] border p-5 mb-6 ${dark ? 'bg-ink-900 border-white/10' : 'bg-white border-ink-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Server className={`w-4 h-4 ${dark ? 'text-ink-400' : 'text-ink-500'}`} />
            <h2 className={`text-[14px] font-semibold ${dark ? 'text-ink-50' : 'text-ink-950'}`}>{serverStatus?.public ? 'Live data' : 'MCP Server Status'}</h2>
          </div>
          <a href="https://github.com/Muna0/markman#quick-start" target="_blank" rel="noreferrer" className={`flex items-center gap-1 text-[12px] font-medium transition ${dark ? 'text-blu-400 hover:text-blu-300' : 'text-blu-500 hover:text-blu-400'}`}>
            <Download className="w-3 h-3" /> Get the plugin
          </a>
        </div>
        {serverStatus?.public ? (
          <>
            <div className={`rounded-lg px-4 py-3 ${dark ? 'bg-ink-800/50' : 'bg-ink-50'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-[13px] font-semibold ${dark ? 'text-ink-100' : 'text-ink-800'}`}>USPTO patent data</span>
                <span className={`flex items-center gap-1 text-[10px] font-bold mono ${
                  usptoKey
                    ? dark ? 'text-grn-400' : 'text-grn-500'
                    : dark ? 'text-amb-400' : 'text-amb-500'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${usptoKey ? 'bg-grn-400' : 'bg-amb-400'}`} />
                  {usptoKey ? 'Connected' : 'Unavailable'}
                </span>
              </div>
            </div>
            <p className={`mt-3 text-[12px] ${dark ? 'text-ink-400' : 'text-ink-500'}`}>
              International (WIPO) search is not available on the public demo. The plugin includes experimental WIPO support that requires WIPO API credentials.
            </p>
          </>
        ) : (
          <>
        <div className="grid sm:grid-cols-2 gap-3">
          {connectionStatus.map(c => (
            <div key={c.name} className={`rounded-lg px-4 py-3 ${dark ? 'bg-ink-800/50' : 'bg-ink-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Key className={`w-3.5 h-3.5 ${dark ? 'text-ink-400' : 'text-ink-500'}`} />
                  <span className={`text-[13px] font-semibold ${dark ? 'text-ink-100' : 'text-ink-800'}`}>{c.name}</span>
                </div>
                <span className={`flex items-center gap-1 text-[10px] font-bold mono ${
                  c.connected
                    ? dark ? 'text-grn-400' : 'text-grn-500'
                    : dark ? 'text-amb-400' : 'text-amb-500'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${c.connected ? 'bg-grn-400' : 'bg-amb-400'}`} />
                  {c.connected ? 'Connected' : 'Not configured'}
                </span>
              </div>
              <p className="text-[10px] text-ink-500 mono">{c.tools}</p>
            </div>
          ))}
        </div>
        {(!usptoKey && !wipoKey) && (
          <div className={`mt-3 rounded-lg px-4 py-2.5 flex items-center gap-2 ${dark ? 'bg-amb-400/10 border border-amb-400/20' : 'bg-amb-100 border border-amb-500/20'}`}>
            <AlertTriangle className="w-3.5 h-3.5 text-amb-400" />
            <span className={`text-[12px] ${dark ? 'text-amb-400' : 'text-amb-500'}`}>
              Install the <a href="https://github.com/Muna0/markman#quick-start" target="_blank" rel="noreferrer" className="underline font-semibold">plugin</a> and add your USPTO API key to enable live USPTO data.
            </span>
          </div>
        )}
          </>
        )}
      </div>

      {serverStatus?.public && (
        <p className={`text-[12px] mb-6 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>
          Public demo: 3 free analyses per day. Your history stays in this browser. Do not paste confidential client information.
        </p>
      )}

      {/* Tools */}
      <h2 className={`text-[14px] font-semibold mb-3 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Tools</h2>
      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        {tools.map(t => (
          <Link
            key={t.to}
            to={t.to}
            className={`group rounded-[14px] border p-5 transition-all duration-200 hover:-translate-y-0.5 ${
              dark ? 'bg-ink-900 border-white/10 hover:border-blu-500/50' : 'bg-white border-ink-200 hover:border-blu-500 hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-[10px] ${dark ? 'bg-blu-500/15' : 'bg-blu-50'} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <t.icon className="w-4.5 h-4.5 text-blu-500" />
              </div>
              <ArrowRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${dark ? 'text-ink-400' : 'text-ink-500'}`} />
            </div>
            <h3 className={`text-[14px] font-bold mb-1 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>{t.label}</h3>
            <p className={`text-[12px] leading-[1.5] ${dark ? 'text-ink-400' : 'text-ink-500'}`}>{t.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent analyses */}
      <div className={`rounded-[14px] border ${dark ? 'bg-ink-900 border-white/10' : 'bg-white border-ink-200'}`}>
        <div className={`px-5 py-4 border-b flex items-center justify-between ${dark ? 'border-white/10' : 'border-ink-200'}`}>
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${dark ? 'text-ink-400' : 'text-ink-500'}`} />
            <h2 className={`text-[14px] font-semibold ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Recent Analyses</h2>
            <span className={`text-[11px] mono ${dark ? 'text-ink-500' : 'text-ink-400'}`}>{history.length}</span>
          </div>
          {history.length > 0 && (
            <button onClick={clearHistory} className={`flex items-center gap-1 text-[11px] font-medium transition ${dark ? 'text-ink-500 hover:text-red-400' : 'text-ink-400 hover:text-red-500'}`}>
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className={`text-[13px] mb-1 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>No analyses yet</p>
            <p className={`text-[12px] ${dark ? 'text-ink-500' : 'text-ink-400'}`}>Run a tool above to see results here</p>
          </div>
        ) : (
          <div className={`divide-y ${dark ? 'divide-ink-800' : 'divide-ink-100'}`}>
            {history.slice(0, 10).map(a => (
              <div key={a.id} className={`px-5 py-3.5 flex items-center justify-between ${dark ? 'hover:bg-ink-800/30' : 'hover:bg-ink-50'} transition-colors`}>
                <div className="min-w-0">
                  <p className={`text-[13px] font-medium truncate ${dark ? 'text-ink-100' : 'text-ink-800'}`}>{a.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-ink-400">{a.type}</span>
                    <span className="text-ink-600">&middot;</span>
                    <span className="text-[11px] text-ink-500 mono">{new Date(a.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
                {a.risk && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold mono ${
                    a.risk === 'HIGH' ? (dark ? 'bg-red-400/15 text-red-400' : 'bg-red-100 text-red-500')
                    : a.risk === 'MEDIUM' ? (dark ? 'bg-amb-400/15 text-amb-400' : 'bg-amb-100 text-amb-500')
                    : (dark ? 'bg-grn-400/15 text-grn-400' : 'bg-grn-100 text-grn-500')
                  }`}>{a.risk}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
