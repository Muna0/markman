import { useState } from 'react'
import { Stamp, ChevronRight, Loader2, AlertTriangle, CheckCircle2, XCircle, MinusCircle } from 'lucide-react'
import { useTheme } from '../store/ThemeContext'

const JURISDICTIONS = ['US', 'EU', 'UK', 'CA', 'AU', 'JP', 'KR', 'IN', 'BR', 'MX']

const SAMPLE_RESULT = {
  mark: 'NEXAFLOW',
  markType: 'Word Mark (Standard Characters)',
  distinctiveness: 'Suggestive',
  niceClasses: ['042 - Computer Software & SaaS', '009 - Downloadable Software'],
  registrability: 'Likely registrable. "NEXA" is a coined prefix; "FLOW" is suggestive of workflow but not descriptive of software itself.',
  identicalMarks: [
    { mark: 'NEXAFLOW', serial: '98-765-432', owner: 'NexaTech Solutions LLC', status: 'ABANDONED', class: '042', filed: '2023-08-15', risk: 'LOW' },
  ],
  similarMarks: [
    { mark: 'NEXFLOW', serial: '97-234-567', owner: 'NexFlow Technologies Inc.', status: 'REGISTERED', class: '042', filed: '2022-03-10', similarity: 0.85, risk: 'HIGH' },
    { mark: 'NEXA', serial: '88-456-789', owner: 'Nexa Digital Corp.', status: 'REGISTERED', class: '009', filed: '2020-11-22', similarity: 0.6, risk: 'MEDIUM' },
    { mark: 'FLOWLOGIC', serial: '97-890-123', owner: 'FlowLogic Software Inc.', status: 'PENDING', class: '042', filed: '2024-01-05', similarity: 0.35, risk: 'LOW' },
  ],
  dupontFactors: [
    { factor: 'Similarity of Marks (sight, sound, meaning)', score: 'HIGH', detail: 'NEXAFLOW vs NEXFLOW: one letter difference. Nearly identical in sound and appearance.' },
    { factor: 'Similarity of Goods/Services', score: 'HIGH', detail: 'Both Class 042 for software and SaaS. Directly overlapping goods.' },
    { factor: 'Trade Channels', score: 'HIGH', detail: 'Both marketed to enterprise/business users through similar channels.' },
    { factor: 'Conditions of Purchase', score: 'MEDIUM', detail: 'SaaS buyers exercise moderate care (not impulse purchases).' },
    { factor: 'Fame of Prior Mark', score: 'LOW', detail: 'NEXFLOW is not a famous mark. Limited commercial recognition.' },
    { factor: 'Similar Marks in Use', score: 'MEDIUM', detail: 'Several "NEX-" prefix marks exist in tech space, somewhat diluting distinctiveness.' },
    { factor: 'Actual Confusion', score: 'LOW', detail: 'No evidence of actual confusion (mark not yet in use).' },
    { factor: 'Concurrent Use Without Confusion', score: 'N/A', detail: 'Not applicable - proposed mark not yet in use.' },
  ],
  jurisdictions: [
    { code: 'US', status: 'CONFLICT', detail: 'NEXFLOW registered in Class 042' },
    { code: 'EU', status: 'CLEAR', detail: 'No identical or confusingly similar marks found' },
    { code: 'UK', status: 'CLEAR', detail: 'No conflicts identified' },
    { code: 'CA', status: 'CLEAR', detail: 'No conflicts identified' },
  ],
  overall: 'CLEAR WITH RISK',
  recommendation: 'Do not use in the US market without further investigation. NEXFLOW in Class 042 presents significant likelihood of confusion. Consider: (1) design-around to a more distinct mark, (2) coexistence agreement with NexFlow Technologies, or (3) proceeding in non-US markets where clearance is stronger.',
}

function RiskIcon({ risk }) {
  if (risk === 'HIGH') return <XCircle className="w-4 h-4 text-red-500" />
  if (risk === 'MEDIUM') return <MinusCircle className="w-4 h-4 text-amb-500" />
  return <CheckCircle2 className="w-4 h-4 text-grn-500" />
}

function JurisdictionStatus({ status, dark }) {
  const styles = {
    CLEAR: dark ? 'bg-grn-950 text-grn-400' : 'bg-grn-100 text-grn-700',
    CONFLICT: dark ? 'bg-red-950 text-red-400' : 'bg-red-100 text-red-700',
    CAUTION: dark ? 'bg-amb-950 text-amb-400' : 'bg-amb-100 text-amb-700',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}>{status}</span>
}

export default function TrademarkClearance() {
  const { dark } = useTheme()
  const [mark, setMark] = useState('')
  const [goods, setGoods] = useState('')
  const [selectedJurisdictions, setSelectedJurisdictions] = useState(['US', 'EU', 'UK', 'CA'])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  function toggleJurisdiction(code) {
    setSelectedJurisdictions(prev =>
      prev.includes(code) ? prev.filter(j => j !== code) : [...prev, code]
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!mark.trim() || !goods.trim()) return
    setLoading(true)
    setResult(null)
    setTimeout(() => {
      setResult(SAMPLE_RESULT)
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-grn-500 to-grn-600 flex items-center justify-center">
            <Stamp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Trademark Clearance</h1>
            <p className={`text-sm ${dark ? 'text-ink-400' : 'text-ink-500'}`}>Screen a mark for conflicts across jurisdictions</p>
          </div>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className={`rounded-xl border p-6 mb-6 ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Proposed Mark</label>
            <input
              type="text"
              value={mark}
              onChange={e => setMark(e.target.value)}
              placeholder="e.g., NEXAFLOW"
              className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blu-500 focus:border-transparent placeholder:text-ink-400 ${dark ? 'border-ink-700 bg-ink-800' : 'border-ink-300 bg-ink-50'}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Goods / Services</label>
            <input
              type="text"
              value={goods}
              onChange={e => setGoods(e.target.value)}
              placeholder="e.g., AI-powered workflow automation software"
              className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blu-500 focus:border-transparent placeholder:text-ink-400 ${dark ? 'border-ink-700 bg-ink-800' : 'border-ink-300 bg-ink-50'}`}
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium mb-2">Target Jurisdictions</label>
          <div className="flex flex-wrap gap-2">
            {JURISDICTIONS.map(j => (
              <button
                key={j}
                type="button"
                onClick={() => toggleJurisdiction(j)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  selectedJurisdictions.includes(j)
                    ? dark
                      ? 'border-blu-700 bg-blu-950 text-blu-300'
                      : 'border-blu-500 bg-blu-50 text-blu-700'
                    : dark
                      ? 'border-ink-700 text-ink-500 hover:border-blu-600'
                      : 'border-ink-300 text-ink-500 hover:border-blu-400'
                }`}
              >
                {j}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!mark.trim() || !goods.trim() || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blu-600 text-white text-sm font-medium hover:bg-blu-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            {loading ? 'Searching...' : 'Run Clearance Screen'}
          </button>
        </div>
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Overall Assessment Banner */}
          <div className={`rounded-xl p-6 border ${
            result.overall === 'DO NOT USE'
              ? dark ? 'bg-red-950/30 border-red-900' : 'bg-red-50 border-red-200'
              : result.overall === 'CLEAR WITH RISK'
                ? dark ? 'bg-amb-950/30 border-amb-900' : 'bg-amb-50 border-amb-200'
                : dark ? 'bg-grn-950/30 border-grn-900' : 'bg-grn-50 border-grn-200'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              {result.overall === 'DO NOT USE' ? <XCircle className={`w-6 h-6 ${dark ? 'text-red-400' : 'text-red-600'}`} /> :
               result.overall === 'CLEAR WITH RISK' ? <AlertTriangle className={`w-6 h-6 ${dark ? 'text-amb-400' : 'text-amb-600'}`} /> :
               <CheckCircle2 className={`w-6 h-6 ${dark ? 'text-grn-400' : 'text-grn-600'}`} />}
              <h2 className="text-xl font-bold">Overall: {result.overall}</h2>
            </div>
            <p className="text-sm">{result.recommendation}</p>
          </div>

          {/* Mark Assessment */}
          <div className={`rounded-xl border p-6 ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
            <h2 className="text-lg font-semibold mb-4">Mark Assessment</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className={`rounded-lg p-4 ${dark ? 'bg-ink-800' : 'bg-ink-50'}`}>
                <p className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold mb-1">Mark Type</p>
                <p className="text-sm font-medium">{result.markType}</p>
              </div>
              <div className={`rounded-lg p-4 ${dark ? 'bg-ink-800' : 'bg-ink-50'}`}>
                <p className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold mb-1">Distinctiveness</p>
                <p className="text-sm font-medium">{result.distinctiveness}</p>
              </div>
              <div className={`rounded-lg p-4 ${dark ? 'bg-ink-800' : 'bg-ink-50'}`}>
                <p className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold mb-1">Nice Classes</p>
                <p className="text-sm font-medium">{result.niceClasses.length} classes</p>
              </div>
            </div>
            <p className={`text-sm ${dark ? 'text-ink-400' : 'text-ink-600'}`}>{result.registrability}</p>
          </div>

          {/* Identical Marks */}
          <div className={`rounded-xl border p-6 ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
            <h2 className="text-lg font-semibold mb-4">Identical Marks</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${dark ? 'border-ink-700' : 'border-ink-200'}`}>
                    <th className="text-left py-2 pr-4 font-medium text-ink-500">Mark</th>
                    <th className="text-left py-2 pr-4 font-medium text-ink-500">Serial #</th>
                    <th className="text-left py-2 pr-4 font-medium text-ink-500">Owner</th>
                    <th className="text-left py-2 pr-4 font-medium text-ink-500">Status</th>
                    <th className="text-left py-2 pr-4 font-medium text-ink-500">Class</th>
                    <th className="text-left py-2 font-medium text-ink-500">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {result.identicalMarks.map((m, i) => (
                    <tr key={i} className={`border-b last:border-0 ${dark ? 'border-ink-800' : 'border-ink-100'}`}>
                      <td className="py-3 pr-4 font-bold">{m.mark}</td>
                      <td className="py-3 pr-4 font-mono text-xs">{m.serial}</td>
                      <td className="py-3 pr-4">{m.owner}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${dark ? 'bg-ink-800 text-ink-400' : 'bg-ink-100 text-ink-600'}`}>{m.status}</span>
                      </td>
                      <td className="py-3 pr-4">{m.class}</td>
                      <td className="py-3"><RiskIcon risk={m.risk} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Similar Marks */}
          <div className={`rounded-xl border p-6 ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
            <h2 className="text-lg font-semibold mb-4">Similar Marks</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${dark ? 'border-ink-700' : 'border-ink-200'}`}>
                    <th className="text-left py-2 pr-4 font-medium text-ink-500">Mark</th>
                    <th className="text-left py-2 pr-4 font-medium text-ink-500">Serial #</th>
                    <th className="text-left py-2 pr-4 font-medium text-ink-500">Owner</th>
                    <th className="text-left py-2 pr-4 font-medium text-ink-500">Status</th>
                    <th className="text-left py-2 pr-4 font-medium text-ink-500">Similarity</th>
                    <th className="text-left py-2 font-medium text-ink-500">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {result.similarMarks.map((m, i) => (
                    <tr key={i} className={`border-b last:border-0 ${dark ? 'border-ink-800' : 'border-ink-100'}`}>
                      <td className="py-3 pr-4 font-bold">{m.mark}</td>
                      <td className="py-3 pr-4 font-mono text-xs">{m.serial}</td>
                      <td className="py-3 pr-4">{m.owner}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          m.status === 'REGISTERED'
                            ? dark ? 'bg-grn-950 text-grn-400' : 'bg-grn-100 text-grn-700'
                            : dark ? 'bg-blu-950 text-blu-400' : 'bg-blu-100 text-blu-700'
                        }`}>{m.status}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-16 h-2 rounded-full overflow-hidden ${dark ? 'bg-ink-700' : 'bg-ink-200'}`}>
                            <div
                              className={`h-full rounded-full ${
                                m.similarity > 0.7 ? 'bg-red-500' : m.similarity > 0.4 ? 'bg-amb-500' : 'bg-grn-500'
                              }`}
                              style={{ width: `${m.similarity * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono">{Math.round(m.similarity * 100)}%</span>
                        </div>
                      </td>
                      <td className="py-3"><RiskIcon risk={m.risk} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* DuPont Factors */}
          <div className={`rounded-xl border p-6 ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
            <h2 className="text-lg font-semibold mb-4">Likelihood of Confusion (DuPont Factors)</h2>
            <div className="space-y-3">
              {result.dupontFactors.map((f, i) => (
                <div key={i} className={`rounded-lg p-4 border ${dark ? 'bg-ink-800 border-ink-700' : 'bg-ink-50 border-ink-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{f.factor}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      f.score === 'HIGH'
                        ? dark ? 'bg-red-950 text-red-400' : 'bg-red-100 text-red-700'
                        : f.score === 'MEDIUM'
                          ? dark ? 'bg-amb-950 text-amb-400' : 'bg-amb-100 text-amb-700'
                          : f.score === 'LOW'
                            ? dark ? 'bg-grn-950 text-grn-400' : 'bg-grn-100 text-grn-700'
                            : dark ? 'bg-ink-700 text-ink-400' : 'bg-ink-200 text-ink-500'
                    }`}>{f.score}</span>
                  </div>
                  <p className={`text-xs ${dark ? 'text-ink-400' : 'text-ink-500'}`}>{f.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Jurisdiction Map */}
          <div className={`rounded-xl border p-6 ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
            <h2 className="text-lg font-semibold mb-4">Jurisdiction Coverage</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {result.jurisdictions.map(j => (
                <div key={j.code} className={`rounded-lg p-4 border text-center ${
                  j.status === 'CLEAR'
                    ? dark ? 'bg-grn-950/30 border-grn-900' : 'bg-grn-50 border-grn-200'
                    : j.status === 'CONFLICT'
                      ? dark ? 'bg-red-950/30 border-red-900' : 'bg-red-50 border-red-200'
                      : dark ? 'bg-amb-950/30 border-amb-900' : 'bg-amb-50 border-amb-200'
                }`}>
                  <p className="text-2xl font-bold mb-1">{j.code}</p>
                  <JurisdictionStatus status={j.status} dark={dark} />
                  <p className={`text-xs mt-2 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>{j.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className={`rounded-lg border p-4 text-xs italic ${dark ? 'bg-ink-800 border-ink-700 text-ink-400' : 'bg-ink-100 border-ink-200 text-ink-500'}`}>
            This is a preliminary clearance screen, not a comprehensive trademark search. Common law marks, state registrations, and domain name conflicts require separate investigation. This analysis does not constitute legal advice.
          </div>
        </div>
      )}
    </div>
  )
}
