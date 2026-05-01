import { useState } from 'react'
import { FlaskConical, ChevronRight, Loader2, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { useTheme } from '../store/ThemeContext'
import { api } from '../store/api'
import ClaudeAnalysis from '../components/ClaudeAnalysis'

const SAMPLE_RESULT = {
  patent: 'US 11,987,654',
  title: 'System and Method for Context-Aware Content Recommendation Using Multi-Modal Neural Embeddings',
  filingDate: '2024-03-15',
  priorityDate: '2024-03-15',
  claims: [
    { num: 1, type: 'Method', indDep: 'Independent', dependsOn: '-', category: 'Process' },
    { num: 2, type: 'Method', indDep: 'Dependent', dependsOn: '1', category: 'Process' },
    { num: 3, type: 'Method', indDep: 'Dependent', dependsOn: '1', category: 'Process' },
    { num: 4, type: 'Method', indDep: 'Dependent', dependsOn: '1', category: 'Process' },
    { num: 5, type: 'System', indDep: 'Independent', dependsOn: '-', category: 'Machine' },
    { num: 6, type: 'CRM', indDep: 'Independent', dependsOn: '-', category: 'Manufacture' },
  ],
  scope: [
    {
      claim: 1,
      limitations: [
        { element: 'Receiving user interaction signal from client device', breadth: 'Broad', flag: 'Generic - nearly any user input qualifies. Extensive prior art.' },
        { element: 'Generating multi-modal embedding vector via trained neural network', breadth: 'Medium', flag: '"Multi-modal" narrows scope. Close to functional claiming at point of novelty.' },
        { element: 'Comparing embedding to content vectors in vector database', breadth: 'Medium', flag: 'Vector similarity search (ANN, cosine) is well-known since 2019+.' },
        { element: 'Identifying candidates by similarity score exceeding threshold', breadth: 'Narrow', flag: '"Predetermined threshold" excludes top-k and dynamic cutoffs. Recommend broadening.' },
        { element: 'Transmitting candidate content items for display', breadth: 'Broad', flag: 'Standard output step. Low novelty.' },
      ],
    },
    {
      claim: 5,
      limitations: [
        { element: 'System claim referencing method of Claim 1', breadth: 'Dependent', flag: 'Not standalone. If Claim 1 invalidated, Claim 5 falls. Rewrite as fully recited independent claim.' },
      ],
    },
    {
      claim: 6,
      limitations: [
        { element: 'CRM claim referencing method of Claim 1', breadth: 'Dependent', flag: 'Same issue as Claim 5. Rewrite independently.' },
      ],
    },
  ],
  priorArt: [
    { issue: 'Alice/Mayo 101', severity: 'HIGH', detail: 'Directed to abstract idea of "recommending content based on user preferences." Generic ML/neural network references may be insufficient for Step 2A Prong 2.' },
    { issue: 'KSR Obviousness 103', severity: 'HIGH', detail: 'Each element is well-known: user signals (Google Analytics), neural embeddings (Word2Vec/BERT), vector search (Faiss), threshold filtering (standard IR).' },
    { issue: 'Indefiniteness 112(b)', severity: 'LOW', detail: '"Multi-modal" may need spec support. "Predetermined threshold" is adequately definite.' },
  ],
  recommendations: [
    'Amend Claim 1 to recite specific technical improvement (e.g., cross-attention fusion architecture)',
    'Replace "predetermined threshold" with "similarity metric" to cover top-k and dynamic approaches',
    'Rewrite Claims 5 and 6 as standalone independent claims with full limitations',
    'Add dependent claims for specific architectures, privacy techniques, and processing modes',
    'Prepare prior art distinction charts vs. YouTube rec system, two-tower models, and CLIP',
    'Consider provisional filing if none exists to preserve priority',
  ],
}

function SeverityBadge({ severity, dark }) {
  const styles = {
    HIGH: dark ? 'bg-red-950 text-red-400' : 'bg-red-100 text-red-700',
    MEDIUM: dark ? 'bg-amb-950 text-amb-400' : 'bg-amb-100 text-amb-700',
    LOW: dark ? 'bg-grn-950 text-grn-400' : 'bg-grn-100 text-grn-700',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[severity]}`}>{severity}</span>
}

function BreadthBadge({ breadth, dark }) {
  const styles = {
    Broad: dark ? 'bg-blu-950 text-blu-400' : 'bg-blu-100 text-blu-700',
    Medium: dark ? 'bg-vio-950 text-vio-400' : 'bg-vio-100 text-vio-700',
    Narrow: dark ? 'bg-amb-950 text-amb-400' : 'bg-amb-100 text-amb-700',
    Dependent: dark ? 'bg-red-950 text-red-400' : 'bg-red-100 text-red-700',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[breadth]}`}>{breadth}</span>
}

export default function PatentAnalysis() {
  const { dark } = useTheme()
  const [input, setInput] = useState('')
  const [inputType, setInputType] = useState('number')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [selectedPatent, setSelectedPatent] = useState(null)
  const [claims, setClaims] = useState([])

  const [liveResults, setLiveResults] = useState(null)
  const [apiError, setApiError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!input.trim()) return
    setLoading(true)
    setResult(null)
    setLiveResults(null)
    setSelectedPatent(null)
    setClaims([])
    setApiError('')

    try {
      if (inputType === 'number') {
        const data = await api.searchPatents(input.trim(), 15)
        if (data.error) throw new Error(data.error)
        if (data.results && data.results.length > 0) {
          setLiveResults(data)
          api.logMatter('patent-analysis', `Patent Search: ${input.trim()}`, `${data.totalResults} results found`, 'UNKNOWN', input.trim())
        } else {
          setApiError('No results found. Try different keywords.')
        }
      } else {
        // Pasted claims mode — show analysis template
        setResult(SAMPLE_RESULT)
      }
    } catch (err) {
      setApiError(err.message)
      // Fall back to sample if API fails
      setResult(SAMPLE_RESULT)
    }

    setLoading(false)
  }

  function selectPatent(patent) {
    setSelectedPatent(patent)
    setResult(null)
    // Initialize editable claims workspace
    setClaims([
      { num: 1, type: 'Method', indDep: 'Independent', dependsOn: '', category: 'Process', notes: '' },
    ])
  }

  function addClaim() {
    const num = claims.length + 1
    setClaims([...claims, { num, type: 'Method', indDep: 'Dependent', dependsOn: String(num - 1), category: 'Process', notes: '' }])
  }

  function updateClaim(index, field, value) {
    const next = [...claims]
    next[index] = { ...next[index], [field]: value }
    setClaims(next)
  }

  function removeClaim(index) {
    setClaims(claims.filter((_, i) => i !== index))
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-vio-500 to-vio-600 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Patent Analysis</h1>
            <p className={`text-sm ${dark ? 'text-ink-400' : 'text-ink-500'}`}>Analyze claims, scope, and prior art risks</p>
          </div>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className={`rounded-xl border p-6 mb-6 ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
        <div className="flex gap-2 mb-4">
          {['number', 'claims'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setInputType(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                inputType === t
                  ? dark ? 'bg-blu-950 text-blu-300' : 'bg-blu-100 text-blu-700'
                  : dark ? 'bg-ink-800 text-ink-400 hover:bg-ink-700' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
              }`}
            >
              {t === 'number' ? 'Patent Number' : 'Paste Claims'}
            </button>
          ))}
        </div>

        {inputType === 'number' ? (
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="e.g., US11,234,567 or PCT/US2024/012345"
            className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blu-500 focus:border-transparent placeholder:text-ink-400 ${dark ? 'border-ink-700 bg-ink-800' : 'border-ink-300 bg-ink-50'}`}
          />
        ) : (
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={8}
            placeholder="Paste patent claims here..."
            className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blu-500 focus:border-transparent resize-none placeholder:text-ink-400 font-mono ${dark ? 'border-ink-700 bg-ink-800' : 'border-ink-300 bg-ink-50'}`}
          />
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blu-500 text-white text-sm font-medium hover:bg-blu-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            {loading ? 'Analyzing...' : 'Analyze Patent'}
          </button>
        </div>
      </form>

      {/* Results */}
      {/* Live USPTO Results */}
      {apiError && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-[14px] ${dark ? 'bg-red-400/10 border border-red-400/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
          API Error: {apiError}. Showing sample analysis below.
        </div>
      )}

      {liveResults && liveResults.results && liveResults.results.length > 0 && (
        <div className={`rounded-xl border p-6 mb-6 ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${dark ? 'text-white' : 'text-ink-950'}`}>Live USPTO Results</h2>
            <span className={`mono text-[12px] px-2 py-0.5 rounded ${dark ? 'bg-grn-400/15 text-grn-400' : 'bg-grn-100 text-grn-500'}`}>
              {liveResults.totalResults.toLocaleString()} total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className={`border-b ${dark ? 'border-ink-700' : 'border-ink-200'}`}>
                  <th className={`text-left py-2 pr-4 font-medium ${dark ? 'text-ink-400' : 'text-ink-500'}`}>App #</th>
                  <th className={`text-left py-2 pr-4 font-medium ${dark ? 'text-ink-400' : 'text-ink-500'}`}>Title</th>
                  <th className={`text-left py-2 pr-4 font-medium ${dark ? 'text-ink-400' : 'text-ink-500'}`}>Filed</th>
                  <th className={`text-left py-2 pr-4 font-medium ${dark ? 'text-ink-400' : 'text-ink-500'}`}>Inventor</th>
                  <th className={`text-left py-2 font-medium ${dark ? 'text-ink-400' : 'text-ink-500'}`}></th>
                </tr>
              </thead>
              <tbody>
                {liveResults.results.slice(0, 10).map((p, i) => (
                  <tr key={i} className={`border-b last:border-0 ${dark ? 'border-ink-800 hover:bg-ink-800/50' : 'border-ink-100 hover:bg-ink-50'} transition-colors cursor-pointer`} onClick={() => selectPatent(p)}>
                    <td className="py-2.5 pr-4">
                      <a href={`https://patentcenter.uspto.gov/applications/${p.applicationNumber}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                        className={`mono text-[12px] underline decoration-dotted underline-offset-2 transition ${dark ? 'text-blu-400 hover:text-blu-300' : 'text-blu-500 hover:text-blu-400'}`}>
                        {p.applicationNumber}
                      </a>
                    </td>
                    <td className={`py-2.5 pr-4 font-medium truncate max-w-[250px] ${dark ? 'text-ink-100' : 'text-ink-800'}`}>{p.title}</td>
                    <td className={`py-2.5 pr-4 mono text-[12px] ${dark ? 'text-ink-400' : 'text-ink-500'}`}>{p.filingDate}</td>
                    <td className={`py-2.5 pr-4 ${dark ? 'text-ink-300' : 'text-ink-600'}`}>{p.firstInventor}</td>
                    <td className="py-2.5">
                      <button onClick={(e) => { e.stopPropagation(); selectPatent(p) }}
                        className={`mono text-[11px] font-medium px-2.5 py-1 rounded transition ${dark ? 'bg-blu-500/15 text-blu-400 hover:bg-blu-500/25' : 'bg-blu-50 text-blu-500 hover:bg-blu-100'}`}>
                        Analyze
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Patent — Dynamic Analysis Workspace */}
      {selectedPatent && (
        <div className="space-y-6 mb-6">
          {/* Patent Header — real data */}
          <div className={`rounded-xl border p-6 ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className={`text-lg font-semibold ${dark ? 'text-white' : 'text-ink-950'}`}>{selectedPatent.applicationNumber}</h2>
                <p className={`text-[14px] mt-1 ${dark ? 'text-ink-300' : 'text-ink-600'}`}>{selectedPatent.title}</p>
              </div>
              <a href={`https://patentcenter.uspto.gov/applications/${selectedPatent.applicationNumber}`}
                target="_blank" rel="noopener noreferrer"
                className={`mono text-[11px] px-3 py-1.5 rounded border transition ${dark ? 'border-ink-700 text-blu-400 hover:border-blu-500' : 'border-ink-200 text-blu-500 hover:border-blu-400'}`}>
                View on USPTO →
              </a>
            </div>
            <div className="flex flex-wrap gap-6 text-[14px]">
              <div><span className={dark ? 'text-ink-400' : 'text-ink-500'}>Filing Date:</span> <span className={`font-medium mono ${dark ? 'text-ink-100' : 'text-ink-800'}`}>{selectedPatent.filingDate || 'Not available'}</span></div>
              <div><span className={dark ? 'text-ink-400' : 'text-ink-500'}>Type:</span> <span className={`font-medium ${dark ? 'text-ink-100' : 'text-ink-800'}`}>{selectedPatent.type || 'Utility'}</span></div>
              <div><span className={dark ? 'text-ink-400' : 'text-ink-500'}>Class:</span> <span className={`font-medium mono ${dark ? 'text-ink-100' : 'text-ink-800'}`}>{selectedPatent.class || 'N/A'}</span></div>
              <div><span className={dark ? 'text-ink-400' : 'text-ink-500'}>Inventor:</span> <span className={`font-medium ${dark ? 'text-ink-100' : 'text-ink-800'}`}>{selectedPatent.firstInventor || 'N/A'}</span></div>
              {selectedPatent.assignee && <div><span className={dark ? 'text-ink-400' : 'text-ink-500'}>Assignee:</span> <span className={`font-medium ${dark ? 'text-ink-100' : 'text-ink-800'}`}>{selectedPatent.assignee}</span></div>}
            </div>
          </div>

          {/* Editable Claim Map */}
          <div className={`rounded-xl border p-6 ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold ${dark ? 'text-white' : 'text-ink-950'}`}>Claim Map</h2>
              <button onClick={addClaim}
                className={`mono text-[12px] font-medium px-3 py-1.5 rounded transition ${dark ? 'bg-blu-500/15 text-blu-400 hover:bg-blu-500/25' : 'bg-blu-50 text-blu-500 hover:bg-blu-100'}`}>
                + Add Claim
              </button>
            </div>
            <div className="space-y-2">
              {claims.map((c, i) => (
                <div key={i} className={`rounded-lg p-3 flex items-center gap-3 flex-wrap ${dark ? 'bg-ink-800/50' : 'bg-ink-50'}`}>
                  <span className={`mono text-[12px] font-bold w-6 ${dark ? 'text-ink-300' : 'text-ink-600'}`}>{c.num}</span>
                  <select value={c.indDep} onChange={e => updateClaim(i, 'indDep', e.target.value)}
                    className={`rounded px-2 py-1 text-[12px] border ${dark ? 'bg-ink-800 border-ink-700 text-ink-200' : 'bg-white border-ink-200 text-ink-800'}`}>
                    <option value="Independent">Independent</option>
                    <option value="Dependent">Dependent</option>
                  </select>
                  <select value={c.type} onChange={e => updateClaim(i, 'type', e.target.value)}
                    className={`rounded px-2 py-1 text-[12px] border ${dark ? 'bg-ink-800 border-ink-700 text-ink-200' : 'bg-white border-ink-200 text-ink-800'}`}>
                    <option value="Method">Method</option>
                    <option value="System">System</option>
                    <option value="Apparatus">Apparatus</option>
                    <option value="CRM">CRM</option>
                    <option value="Composition">Composition</option>
                  </select>
                  {c.indDep === 'Dependent' && (
                    <input type="text" value={c.dependsOn} onChange={e => updateClaim(i, 'dependsOn', e.target.value)}
                      placeholder="Depends on #"
                      className={`rounded px-2 py-1 text-[12px] border w-20 mono ${dark ? 'bg-ink-800 border-ink-700 text-ink-200' : 'bg-white border-ink-200 text-ink-800'}`} />
                  )}
                  <input type="text" value={c.notes} onChange={e => updateClaim(i, 'notes', e.target.value)}
                    placeholder="Notes (scope, flags, breadth...)"
                    className={`rounded px-2 py-1 text-[12px] border flex-1 min-w-[150px] ${dark ? 'bg-ink-800 border-ink-700 text-ink-200 placeholder:text-ink-600' : 'bg-white border-ink-200 text-ink-800 placeholder:text-ink-400'}`} />
                  <button onClick={() => removeClaim(i)} className={`text-[11px] px-2 py-1 rounded transition ${dark ? 'text-red-400 hover:bg-red-400/10' : 'text-red-500 hover:bg-red-50'}`}>✕</button>
                </div>
              ))}
            </div>
            {claims.length === 0 && (
              <p className={`text-[13px] text-center py-6 ${dark ? 'text-ink-500' : 'text-ink-400'}`}>
                Click "+ Add Claim" to start building the claim map, or use <span className="mono">claude /review-claims {selectedPatent.applicationNumber}</span> for automated analysis.
              </p>
            )}
          </div>

          {/* Claude Analysis */}
          <ClaudeAnalysis
            query={`Analyze patent application ${selectedPatent.applicationNumber}: "${selectedPatent.title}". Filed ${selectedPatent.filingDate}. Type: ${selectedPatent.type}. Class: ${selectedPatent.class}. Inventor: ${selectedPatent.firstInventor}. Assignee: ${selectedPatent.assignee}. Provide a full patent analysis including claim scope assessment, prior art red flags, and recommendations.`}
            skillType="patent"
            context={`Patent: ${selectedPatent.applicationNumber}\nTitle: ${selectedPatent.title}\nFiling Date: ${selectedPatent.filingDate}\nType: ${selectedPatent.type}\nClass: ${selectedPatent.class}\nInventor: ${selectedPatent.firstInventor}\nAssignee: ${selectedPatent.assignee}`}
          />
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Header */}
          <div className={`rounded-xl border p-6 ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
            <h2 className="text-lg font-semibold mb-1">{result.patent}</h2>
            <p className={`text-sm mb-3 ${dark ? 'text-ink-400' : 'text-ink-600'}`}>{result.title}</p>
            <div className="flex gap-6 text-sm">
              <div><span className="text-ink-500">Filing Date:</span> <span className="font-medium">{result.filingDate}</span></div>
              <div><span className="text-ink-500">Priority Date:</span> <span className="font-medium">{result.priorityDate}</span></div>
            </div>
          </div>

          {/* Claim Map */}
          <div className={`rounded-xl border p-6 ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
            <h2 className="text-lg font-semibold mb-4">Claim Map</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${dark ? 'border-ink-700' : 'border-ink-200'}`}>
                    <th className="text-left py-2 pr-4 font-medium text-ink-500">Claim #</th>
                    <th className="text-left py-2 pr-4 font-medium text-ink-500">Type</th>
                    <th className="text-left py-2 pr-4 font-medium text-ink-500">Ind/Dep</th>
                    <th className="text-left py-2 pr-4 font-medium text-ink-500">Depends On</th>
                    <th className="text-left py-2 font-medium text-ink-500">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {result.claims.map(c => (
                    <tr key={c.num} className={`border-b last:border-0 ${dark ? 'border-ink-800' : 'border-ink-100'}`}>
                      <td className="py-3 pr-4 font-bold">{c.num}</td>
                      <td className="py-3 pr-4">{c.type}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          c.indDep === 'Independent'
                            ? dark ? 'bg-blu-950 text-blu-400' : 'bg-blu-100 text-blu-700'
                            : dark ? 'bg-ink-800 text-ink-400' : 'bg-ink-100 text-ink-600'
                        }`}>{c.indDep}</span>
                      </td>
                      <td className="py-3 pr-4 text-ink-500">{c.dependsOn}</td>
                      <td className={`py-3 ${dark ? 'text-ink-400' : 'text-ink-600'}`}>{c.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scope Assessment */}
          <div className={`rounded-xl border p-6 ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
            <h2 className="text-lg font-semibold mb-4">Scope Assessment</h2>
            <div className="space-y-6">
              {result.scope.map(s => (
                <div key={s.claim}>
                  <h3 className={`font-semibold text-sm mb-3 ${dark ? 'text-blu-400' : 'text-blu-700'}`}>
                    Claim {s.claim} {s.claim <= 1 ? '(Independent - Method)' : s.claim === 5 ? '(Independent - System)' : '(Independent - CRM)'}
                  </h3>
                  <div className="space-y-2">
                    {s.limitations.map((l, i) => (
                      <div key={i} className={`rounded-lg p-4 border ${dark ? 'bg-ink-800 border-ink-700' : 'bg-ink-50 border-ink-200'}`}>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <span className="text-sm font-medium">{l.element}</span>
                          <BreadthBadge breadth={l.breadth} dark={dark} />
                        </div>
                        <p className={`text-xs flex items-start gap-1.5 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>
                          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          {l.flag}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prior Art Red Flags */}
          <div className={`rounded-xl border p-6 ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
            <h2 className="text-lg font-semibold mb-4">Prior Art Red Flags</h2>
            <div className="space-y-3">
              {result.priorArt.map((p, i) => (
                <div key={i} className={`rounded-lg p-4 border ${
                  p.severity === 'HIGH' ? dark ? 'bg-red-950/30 border-red-900' : 'bg-red-50 border-red-200' :
                  p.severity === 'MEDIUM' ? dark ? 'bg-amb-950/30 border-amb-900' : 'bg-amb-50 border-amb-200' :
                  dark ? 'bg-grn-950/30 border-grn-900' : 'bg-grn-50 border-grn-200'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className={`w-4 h-4 ${
                      p.severity === 'HIGH' ? dark ? 'text-red-400' : 'text-red-600' :
                      p.severity === 'MEDIUM' ? dark ? 'text-amb-400' : 'text-amb-600' :
                      dark ? 'text-grn-400' : 'text-grn-600'
                    }`} />
                    <span className="text-sm font-semibold">{p.issue}</span>
                    <SeverityBadge severity={p.severity} dark={dark} />
                  </div>
                  <p className="text-sm ml-7">{p.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className={`rounded-xl border p-6 ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
            <h2 className="text-lg font-semibold mb-4">Recommendations</h2>
            <ol className="space-y-3">
              {result.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${dark ? 'bg-blu-950 text-blu-300' : 'bg-blu-100 text-blu-700'}`}>{i + 1}</span>
                  <span>{r}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Disclaimer */}
          <div className={`rounded-lg border p-4 text-xs italic ${dark ? 'bg-ink-800 border-ink-700 text-ink-400' : 'bg-ink-100 border-ink-200 text-ink-500'}`}>
            This analysis assists patent counsel and does not constitute legal advice. All patent numbers, prior art references, and claim constructions should be verified against the full specification and prosecution history by licensed counsel.
          </div>
        </div>
      )}
    </div>
  )
}
