import { useState, useEffect } from 'react'
import { useTheme } from '../store/ThemeContext'
import { Settings as SettingsIcon, Key, Server, BookOpen, Check, AlertTriangle, Eye, EyeOff, Save, RotateCcw } from 'lucide-react'

function Section({ dark, title, desc, children }) {
  return (
    <div className={`rounded-xl border p-6 ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
      <h3 className={`text-[15px] font-bold mb-1 ${dark ? 'text-white' : 'text-ink-950'}`}>{title}</h3>
      <p className={`text-[12px] mb-5 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>{desc}</p>
      {children}
    </div>
  )
}

export default function Settings() {
  const { dark } = useTheme()

  const [usptoKey, setUsptoKey] = useState(() => localStorage.getItem('markman-uspto-key') || '')
  const [wipoKey, setWipoKey] = useState(() => localStorage.getItem('markman-wipo-key') || '')
  const [showUspto, setShowUspto] = useState(false)
  const [showWipo, setShowWipo] = useState(false)
  const [saved, setSaved] = useState(false)

  const [playbook, setPlaybook] = useState(() => {
    const saved = localStorage.getItem('markman-playbook')
    return saved ? JSON.parse(saved) : {
      ftoHighThreshold: 'One or more unexpired patent claims read directly on the technology',
      tmJurisdictions: 'US, EU, UK, CA',
      claimDraftingStyle: 'comprising',
      deadlineAlertDays: '90, 60, 30, 7',
      privilegeMarking: true,
      bluebookCitations: true,
    }
  })

  function saveKeys() {
    localStorage.setItem('markman-uspto-key', usptoKey)
    localStorage.setItem('markman-wipo-key', wipoKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function savePlaybook() {
    localStorage.setItem('markman-playbook', JSON.stringify(playbook))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function resetPlaybook() {
    const defaults = {
      ftoHighThreshold: 'One or more unexpired patent claims read directly on the technology',
      tmJurisdictions: 'US, EU, UK, CA',
      claimDraftingStyle: 'comprising',
      deadlineAlertDays: '90, 60, 30, 7',
      privilegeMarking: true,
      bluebookCitations: true,
    }
    setPlaybook(defaults)
    localStorage.setItem('markman-playbook', JSON.stringify(defaults))
  }

  const usptoStatus = usptoKey.length > 0
  const wipoStatus = wipoKey.length > 0

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${dark ? 'bg-ink-800' : 'bg-ink-100'}`}>
            <SettingsIcon className={`w-5 h-5 ${dark ? 'text-ink-300' : 'text-ink-600'}`} />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-ink-950'}`}>Settings</h1>
            <p className={`text-[13px] ${dark ? 'text-ink-400' : 'text-ink-500'}`}>Configure API keys, MCP servers, and playbook preferences</p>
          </div>
        </div>
      </div>

      {saved && (
        <div className={`mb-4 px-4 py-2.5 rounded-lg flex items-center gap-2 text-[13px] font-medium ${dark ? 'bg-grn-400/10 border border-grn-400/20 text-grn-400' : 'bg-grn-100 border border-grn-500/20 text-grn-500'}`}>
          <Check className="w-4 h-4" /> Settings saved
        </div>
      )}

      <div className="space-y-6">
        {/* API Keys */}
        <Section dark={dark} title="API Keys" desc="Connect to USPTO and WIPO for live patent and trademark data.">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-[13px] font-medium ${dark ? 'text-ink-200' : 'text-ink-700'}`}>USPTO API Key</label>
                <span className={`flex items-center gap-1 text-[11px] font-medium ${usptoStatus ? 'text-grn-400' : 'text-amb-400'}`}>
                  {usptoStatus ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {usptoStatus ? 'Configured' : 'Not set'}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showUspto ? 'text' : 'password'}
                  value={usptoKey}
                  onChange={e => setUsptoKey(e.target.value)}
                  placeholder="Enter your USPTO Open Data Portal API key"
                  className={`w-full rounded-[10px] border px-4 py-2.5 pr-10 text-[13px] mono focus:outline-none focus:ring-2 focus:ring-blu-500/50 focus:border-blu-500 transition placeholder:text-ink-500 ${dark ? 'bg-ink-800 border-ink-700 text-ink-100' : 'bg-ink-50 border-ink-200 text-ink-900'}`}
                />
                <button type="button" onClick={() => setShowUspto(!showUspto)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300">
                  {showUspto ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className={`text-[11px] mt-1 ${dark ? 'text-ink-500' : 'text-ink-400'}`}>
                Get a key at data.uspto.gov/apis/getting-started
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-[13px] font-medium ${dark ? 'text-ink-200' : 'text-ink-700'}`}>WIPO API Key</label>
                <span className={`flex items-center gap-1 text-[11px] font-medium ${wipoStatus ? 'text-grn-400' : 'text-amb-400'}`}>
                  {wipoStatus ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {wipoStatus ? 'Configured' : 'Not set'}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showWipo ? 'text' : 'password'}
                  value={wipoKey}
                  onChange={e => setWipoKey(e.target.value)}
                  placeholder="Enter your WIPO CASE API key"
                  className={`w-full rounded-[10px] border px-4 py-2.5 pr-10 text-[13px] mono focus:outline-none focus:ring-2 focus:ring-blu-500/50 focus:border-blu-500 transition placeholder:text-ink-500 ${dark ? 'bg-ink-800 border-ink-700 text-ink-100' : 'bg-ink-50 border-ink-200 text-ink-900'}`}
                />
                <button type="button" onClick={() => setShowWipo(!showWipo)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300">
                  {showWipo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className={`text-[11px] mt-1 ${dark ? 'text-ink-500' : 'text-ink-400'}`}>
                Apply for access at wipo.int/case/en
              </p>
            </div>

            <button onClick={saveKeys} className="flex items-center gap-2 px-4 py-2 rounded-[10px] bg-blu-500 text-white text-[13px] font-semibold btn-shadow hover:bg-blu-400 transition">
              <Save className="w-3.5 h-3.5" /> Save API Keys
            </button>
          </div>
        </Section>

        {/* MCP Server Status */}
        <Section dark={dark} title="MCP Servers" desc="Status of connected Model Context Protocol servers.">
          <div className="space-y-3">
            {[
              { name: 'uspto-server', desc: 'Patent & trademark search via USPTO Open Data Portal', tools: 4, status: usptoStatus },
              { name: 'wipo-server', desc: 'International patent data via WIPO CASE / PATENTSCOPE', tools: 2, status: wipoStatus },
            ].map(s => (
              <div key={s.name} className={`flex items-center justify-between rounded-lg px-4 py-3 ${dark ? 'bg-ink-800/50' : 'bg-ink-50'}`}>
                <div className="flex items-center gap-3">
                  <Server className={`w-4 h-4 ${dark ? 'text-ink-400' : 'text-ink-500'}`} />
                  <div>
                    <p className={`text-[13px] font-semibold mono ${dark ? 'text-ink-100' : 'text-ink-800'}`}>{s.name}</p>
                    <p className="text-[11px] text-ink-400">{s.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-ink-400 mono">{s.tools} tools</span>
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold mono ${
                    s.status
                      ? dark ? 'bg-grn-400/15 text-grn-400' : 'bg-grn-100 text-grn-500'
                      : dark ? 'bg-ink-700 text-ink-400' : 'bg-ink-200 text-ink-500'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${s.status ? 'bg-grn-400' : 'bg-ink-400'}`} />
                    {s.status ? 'Ready' : 'No key'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Playbook Config */}
        <Section dark={dark} title="Playbook Configuration" desc="Customize risk thresholds, jurisdictions, drafting preferences, and deadline rules.">
          <div className="space-y-4">
            <div>
              <label className={`block text-[12px] font-medium mb-1.5 ${dark ? 'text-ink-200' : 'text-ink-700'}`}>FTO High-Risk Threshold</label>
              <textarea
                value={playbook.ftoHighThreshold}
                onChange={e => setPlaybook(p => ({ ...p, ftoHighThreshold: e.target.value }))}
                rows={2}
                className={`w-full rounded-[10px] border px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blu-500/50 resize-none ${dark ? 'bg-ink-800 border-ink-700 text-ink-100' : 'bg-ink-50 border-ink-200 text-ink-900'}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-[12px] font-medium mb-1.5 ${dark ? 'text-ink-200' : 'text-ink-700'}`}>TM Clearance Jurisdictions</label>
                <input
                  type="text"
                  value={playbook.tmJurisdictions}
                  onChange={e => setPlaybook(p => ({ ...p, tmJurisdictions: e.target.value }))}
                  className={`w-full rounded-[10px] border px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blu-500/50 ${dark ? 'bg-ink-800 border-ink-700 text-ink-100' : 'bg-ink-50 border-ink-200 text-ink-900'}`}
                />
              </div>
              <div>
                <label className={`block text-[12px] font-medium mb-1.5 ${dark ? 'text-ink-200' : 'text-ink-700'}`}>Deadline Alert Days</label>
                <input
                  type="text"
                  value={playbook.deadlineAlertDays}
                  onChange={e => setPlaybook(p => ({ ...p, deadlineAlertDays: e.target.value }))}
                  className={`w-full rounded-[10px] border px-4 py-2.5 text-[13px] mono focus:outline-none focus:ring-2 focus:ring-blu-500/50 ${dark ? 'bg-ink-800 border-ink-700 text-ink-100' : 'bg-ink-50 border-ink-200 text-ink-900'}`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-[12px] font-medium mb-1.5 ${dark ? 'text-ink-200' : 'text-ink-700'}`}>Claim Transitional Phrase</label>
              <select
                value={playbook.claimDraftingStyle}
                onChange={e => setPlaybook(p => ({ ...p, claimDraftingStyle: e.target.value }))}
                className={`w-full rounded-[10px] border px-4 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blu-500/50 ${dark ? 'bg-ink-800 border-ink-700 text-ink-100' : 'bg-ink-50 border-ink-200 text-ink-900'}`}
              >
                <option value="comprising">comprising (open-ended, default)</option>
                <option value="consisting of">consisting of (closed)</option>
                <option value="consisting essentially of">consisting essentially of (semi-closed)</option>
              </select>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={playbook.privilegeMarking}
                  onChange={e => setPlaybook(p => ({ ...p, privilegeMarking: e.target.checked }))}
                  className="rounded border-ink-400 text-blu-500 focus:ring-blu-500/50"
                />
                <span className={`text-[13px] ${dark ? 'text-ink-200' : 'text-ink-700'}`}>Mark FTO memos as privileged</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={playbook.bluebookCitations}
                  onChange={e => setPlaybook(p => ({ ...p, bluebookCitations: e.target.checked }))}
                  className="rounded border-ink-400 text-blu-500 focus:ring-blu-500/50"
                />
                <span className={`text-[13px] ${dark ? 'text-ink-200' : 'text-ink-700'}`}>Bluebook citations</span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button onClick={savePlaybook} className="flex items-center gap-2 px-4 py-2 rounded-[10px] bg-blu-500 text-white text-[13px] font-semibold btn-shadow hover:bg-blu-400 transition">
                <Save className="w-3.5 h-3.5" /> Save Playbook
              </button>
              <button onClick={resetPlaybook} className={`flex items-center gap-2 px-4 py-2 rounded-[10px] border text-[13px] font-medium transition ${dark ? 'border-ink-700 text-ink-300 hover:border-ink-500' : 'border-ink-200 text-ink-600 hover:border-ink-400'}`}>
                <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
              </button>
            </div>
          </div>
        </Section>

        {/* Plugin Info */}
        <Section dark={dark} title="About Markman" desc="Plugin information and version.">
          <div className="space-y-2">
            {[
              { label: 'Version', value: '1.0.0' },
              { label: 'Type', value: 'Claude Code Plugin' },
              { label: 'Skills', value: 'Patent Analysis, FTO Memo, TM Screen, Matter Intake' },
              { label: 'Commands', value: '/review-claims, /fto-analysis, /tm-clearance' },
              { label: 'MCP Servers', value: 'uspto-server, wipo-server' },
              { label: 'License', value: 'Apache-2.0' },
            ].map(row => (
              <div key={row.label} className={`flex items-center justify-between py-2 border-b last:border-0 ${dark ? 'border-ink-800' : 'border-ink-100'}`}>
                <span className={`text-[12px] ${dark ? 'text-ink-400' : 'text-ink-500'}`}>{row.label}</span>
                <span className={`text-[12px] font-medium mono ${dark ? 'text-ink-200' : 'text-ink-700'}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}
