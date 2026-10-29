import { useState } from 'react'
import { FileSearch, AlertTriangle, Clock, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react'
import { localHistory } from '../store/localHistory'
import { useTheme } from '../store/ThemeContext'
import { runTriage } from '../store/analyzer'
import { api } from '../store/api'
import ClaudeAnalysis from '../components/ClaudeAnalysis'

const IP_TYPES = ['Patent', 'Trademark', 'Trade Secret', 'Copyright']

export default function IpTriage() {
  const { dark } = useTheme()
  const [description, setDescription] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    if (!description.trim()) return
    setLoading(true)
    setResult(null)

    // Run real analysis
    setTimeout(() => {
      const analysis = runTriage(description)
      setSelectedType(analysis.classification.primary)
      setResult(analysis)
      setLoading(false)

      localHistory.logMatter(
        'intake',
        description.slice(0, 60) + (description.length > 60 ? '...' : ''),
        `Classified as ${analysis.classification.primary}`,
        analysis.risk,
        description,
      )
    }, 800)
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-[10px] ${dark ? 'bg-blu-500/15' : 'bg-blu-50'} flex items-center justify-center`}>
            <FileSearch className="w-5 h-5 text-blu-500" />
          </div>
          <div>
            <h1 className={`text-[28px] font-bold tracking-[-0.02em] ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Matter Intake</h1>
            <p className={`text-sm ${dark ? 'text-ink-400' : 'text-ink-500'}`}>Classify, extract key facts, and flag deadlines for any IP matter</p>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className={`${dark ? 'bg-ink-900' : 'bg-white'} rounded-[14px] border ${dark ? 'border-white/10' : 'border-ink-200'} p-6 mb-6`}>
        <label className="block text-sm font-medium mb-2">Describe the IP matter or question</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={5}
          placeholder="Example: We're developing a new ML-based recommendation algorithm for our SaaS platform. We plan to share technical details with a strategic partner under NDA. Need to assess IP protection options before the meeting next month."
          className={`w-full rounded-[8px] border ${dark ? 'border-ink-700 bg-ink-800' : 'border-ink-200 bg-white'} px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blu-500/30 focus:border-blu-500 resize-none placeholder:text-ink-400`}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`text-xs ${dark ? 'text-ink-400' : 'text-ink-500'} self-center mr-2`}>Quick select:</span>
          {IP_TYPES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setDescription(`New ${t.toLowerCase()} matter: `)
                setSelectedType(t)
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedType === t
                  ? `border-blu-500 ${dark ? 'bg-blu-950 text-blu-300 border-blu-700' : 'bg-blu-50 text-blu-500'}`
                  : `${dark ? 'border-ink-700 hover:border-blu-600' : 'border-ink-300 hover:border-blu-400'}`
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={!description.trim() || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[5px] bg-blu-500 text-white btn-shadow text-sm font-medium hover:bg-blu-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            {loading ? 'Analyzing...' : 'Run Triage'}
          </button>
        </div>
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in">
          {/* Classification */}
          <div className={`${dark ? 'bg-ink-900' : 'bg-white'} rounded-[14px] border ${dark ? 'border-white/10' : 'border-ink-200'} p-6`}>
            <h2 className="text-lg font-semibold mb-4">Classification</h2>
            <div className="flex flex-wrap gap-3">
              <div className={`px-4 py-2 rounded-lg ${dark ? 'bg-blu-950 border-blu-800' : 'bg-blu-50 border-blu-200'} border`}>
                <p className="text-[11px] uppercase tracking-wider text-blu-500 font-semibold">Primary</p>
                <p className={`text-sm font-bold ${dark ? 'text-blu-300' : 'text-blu-500'}`}>{result.classification.primary}</p>
              </div>
              {result.classification.secondary.map(s => (
                <div key={s} className={`px-4 py-2 rounded-lg ${dark ? 'bg-ink-800 border-ink-700' : 'bg-ink-100 border-ink-200'} border`}>
                  <p className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold">Secondary</p>
                  <p className="text-sm font-bold">{s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Facts */}
          <div className={`${dark ? 'bg-ink-900' : 'bg-white'} rounded-[14px] border ${dark ? 'border-white/10' : 'border-ink-200'} p-6`}>
            <h2 className="text-lg font-semibold mb-4">Key Facts</h2>
            <ul className="space-y-2">
              {result.facts.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blu-500 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Deadlines */}
          <div className={`${dark ? 'bg-ink-900' : 'bg-white'} rounded-[14px] border ${dark ? 'border-white/10' : 'border-ink-200'} p-6`}>
            <h2 className="text-lg font-semibold mb-4">Critical Deadlines</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${dark ? 'border-ink-700' : 'border-ink-200'}`}>
                    <th className="text-left py-2 pr-4 font-medium text-ink-500">Deadline</th>
                    <th className="text-left py-2 pr-4 font-medium text-ink-500">Date</th>
                    <th className="text-left py-2 pr-4 font-medium text-ink-500">Remaining</th>
                    <th className="text-left py-2 font-medium text-ink-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.deadlines.map((d, i) => (
                    <tr key={i} className={`border-b ${dark ? 'border-white/10' : 'border-ink-100'} last:border-0`}>
                      <td className="py-3 pr-4 font-medium">{d.name}</td>
                      <td className={`py-3 pr-4 ${dark ? 'text-ink-400' : 'text-ink-600'}`}>{d.date}</td>
                      <td className={`py-3 pr-4 ${dark ? 'text-ink-400' : 'text-ink-600'}`}>{d.remaining}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          d.status === 'URGENT' ? `${dark ? 'bg-red-950 text-red-400' : 'bg-red-100 text-red-700'}` :
                          d.status === 'UPCOMING' ? `${dark ? 'bg-amb-950 text-amb-400' : 'bg-amb-100 text-amb-700'}` :
                          `${dark ? 'bg-grn-950 text-grn-400' : 'bg-grn-100 text-grn-700'}`
                        }`}>
                          {d.status === 'URGENT' && <AlertTriangle className="w-3 h-3" />}
                          {d.status === 'UPCOMING' && <Clock className="w-3 h-3" />}
                          {d.status === 'OK' && <CheckCircle2 className="w-3 h-3" />}
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className={`rounded-[14px] border p-6 ${
            result.risk === 'HIGH' ? `${dark ? 'bg-red-950/30 border-red-900' : 'bg-red-50 border-red-200'}` :
            result.risk === 'MEDIUM' ? `${dark ? 'bg-amb-950/30 border-amb-900' : 'bg-amb-50 border-amb-200'}` :
            `${dark ? 'bg-grn-950/30 border-grn-900' : 'bg-grn-50 border-grn-200'}`
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className={`w-5 h-5 ${
                result.risk === 'HIGH' ? `${dark ? 'text-red-400' : 'text-red-600'}` :
                result.risk === 'MEDIUM' ? `${dark ? 'text-amb-400' : 'text-amb-600'}` :
                `${dark ? 'text-grn-400' : 'text-grn-600'}`
              }`} />
              <h2 className="text-lg font-semibold">Risk Assessment: {result.risk}</h2>
            </div>
            <p className="text-sm">{result.rationale}</p>
          </div>

          {/* Missing Information */}
          <div className={`${dark ? 'bg-ink-900' : 'bg-white'} rounded-[14px] border ${dark ? 'border-white/10' : 'border-ink-200'} p-6`}>
            <h2 className="text-lg font-semibold mb-4">Missing Information</h2>
            <ul className="space-y-2">
              {result.missing.map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className={`w-5 h-5 rounded-full ${dark ? 'bg-amb-950 text-amb-400' : 'bg-amb-100 text-amb-600'} flex items-center justify-center text-xs font-bold shrink-0`}>{i + 1}</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Next Steps */}
          <div className={`${dark ? 'bg-ink-900' : 'bg-white'} rounded-[14px] border ${dark ? 'border-white/10' : 'border-ink-200'} p-6`}>
            <h2 className="text-lg font-semibold mb-4">Recommended Next Steps</h2>
            <ol className="space-y-3">
              {result.nextSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className={`w-6 h-6 rounded-full ${dark ? 'bg-blu-950 text-blu-300' : 'bg-blu-100 text-blu-500'} flex items-center justify-center text-xs font-bold shrink-0`}>{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Deep Analysis with Claude */}
          <ClaudeAnalysis
            query={`Perform a detailed IP matter triage for this situation: ${description}. Classify the IP type (patent, trademark, trade secret, copyright), extract all key facts, identify every relevant deadline with specific dates where possible, assign a risk level (HIGH/MEDIUM/LOW) with rationale, list missing information needed for a complete assessment, and provide specific recommended next steps. Follow the matter intake skill definition exactly.`}
            skillType="intake"
            context={`User description: ${description}\nPreliminary classification: ${result.classification.primary}\nSecondary types: ${result.classification.secondary.join(', ')}\nPreliminary risk: ${result.risk}`}
          />
        </div>
      )}
    </div>
  )
}
