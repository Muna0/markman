import { useState } from 'react'
import { ShieldCheck, ChevronRight, Loader2 } from 'lucide-react'
import { useTheme } from '../store/ThemeContext'
import { api } from '../store/api'
import { localHistory } from '../store/localHistory'
import { ftoSearchQueries } from '../store/ftoQuery'
import ClaudeAnalysis from '../components/ClaudeAnalysis'

export default function FtoAnalysis() {
  const { dark } = useTheme()
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [foundPatents, setFoundPatents] = useState([])
  const [patentContext, setPatentContext] = useState('')
  const [usedQuery, setUsedQuery] = useState('')
  const [searchError, setSearchError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!description.trim()) return
    setSubmittedQuery(description)
    setSearching(true)
    setFoundPatents([])
    setPatentContext('')
    setUsedQuery('')
    setSearchError('')
    setSubmitted(false)

    // Step 1: search USPTO with a few distinctive terms, narrow first, then broader
    const queries = ftoSearchQueries(description)
    let used = ''
    let utilities = []
    let failed = queries.length ? '' : 'The description has no searchable technical terms. Add a few specific technical words.'
    for (const q of queries) {
      used = q
      try {
        const data = await api.searchPatents(q, 20, 0)
        if (data.error) { failed = data.error; break }
        // Utility filings only (no provisionals or PCT records)
        utilities = (data.results || []).filter(r => r.type === 'REGULAR' || !r.type).slice(0, 10)
        if (utilities.length) break
      } catch (err) {
        failed = err.message || 'The USPTO search could not be completed.'
        break
      }
    }
    setUsedQuery(used)
    setSearchError(failed)
    setFoundPatents(utilities)
    setPatentContext(utilities.map(p =>
      `${p.patentNumber ? `U.S. Patent ${p.patentNumber} (App. ${p.applicationNumber})` : `App. ${p.applicationNumber}`}: "${p.title}" | Status: ${p.statusDescription || 'Not listed'} | Filed: ${p.filingDate || 'Not listed'} | Granted: ${p.grantDate || 'Not granted'} | Assignee: ${p.assignee || 'Not listed'}`
    ).join('\n'))

    setSearching(false)
    setSubmitted(true)
    localHistory.logMatter('fto-memo', `FTO: ${description.slice(0, 60)}`, 'Analysis with USPTO search', 'UNKNOWN', description)
  }

  const quoted = usedQuery ? `"${usedQuery}"` : 'this technology'
  const searchSummary = patentContext
    ? `The USPTO search for ${quoted} returned the candidate patents and applications listed below. Only bibliographic data is available; no claim text was provided.

Using only the titles, status, and dates below, rank the candidate patents by apparent relevance, explain what to check in each, and list the claims the attorney must obtain (from Google Patents or the file wrapper) before any element-by-element mapping. Do not state or guess claim language.

${patentContext}

Treat abandoned applications and expired filings as lower priority but say why. Give any overall risk level only as a preliminary screening view pending claim review, and describe design-around directions at the feature level, not against claim language.`
    : searchError
      ? `The USPTO search for ${quoted} could not be completed, so no candidate patents are listed. Do not name or invent patents. Explain what remains to be searched, recommend search strategies (synonyms, CPC classes, assignee searches, Google Patents), and list the steps needed before any FTO conclusion. Do not state or guess claim language.`
      : `The USPTO search for ${quoted} returned no matches. Do not name or invent patents. Explain what a zero-result keyword search does and does not show (U.S. only, keyword-dependent), recommend broader search strategies (synonyms, CPC classes, assignee searches, Google Patents), and list the steps needed before any FTO conclusion. Do not state or guess claim language.`

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-[10px] ${dark ? 'bg-blu-500/15' : 'bg-blu-50'} flex items-center justify-center`}>
            <ShieldCheck className="w-5 h-5 text-blu-500" />
          </div>
          <div>
            <h1 className={`text-[28px] font-bold tracking-[-0.02em] ${dark ? 'text-ink-50' : 'text-ink-950'}`}>FTO Analysis</h1>
            <p className={`text-sm ${dark ? 'text-ink-400' : 'text-ink-500'}`}>Freedom-to-operate risk assessment</p>
          </div>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className={`rounded-[14px] border p-6 mb-6 ${dark ? 'bg-ink-900 border-white/10' : 'bg-white border-ink-200'}`}>
        <label className="block text-sm font-medium mb-2">Describe the technology, product, or feature to clear</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={6}
          placeholder="Example: Our product uses a transformer-based model to extract structured data from unstructured medical records. Key features: fine-tuned on clinical text, outputs FHIR-compliant JSON, runs on-device for HIPAA compliance. Custom tokenizer trained on medical terminology corpus."
          className={`w-full rounded-[8px] border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blu-500/30 focus:border-blu-500 resize-none placeholder:text-ink-400 ${dark ? 'border-ink-700 bg-ink-800' : 'border-ink-200 bg-white'}`}
        />
        <div className={`mt-4 rounded-lg border p-3 ${dark ? 'bg-ink-800 border-ink-700' : 'bg-ink-50 border-ink-200'}`}>
          <p className={`text-xs ${dark ? 'text-ink-400' : 'text-ink-500'}`}>
            <strong>Tip:</strong> Include: (1) what the technology does, (2) how it works technically, (3) key differentiating features, and (4) target market context.
          </p>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={!description.trim() || searching}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[5px] bg-blu-500 text-white btn-shadow text-sm font-medium hover:bg-blu-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            {searching ? 'Analyzing...' : 'Run FTO Analysis'}
          </button>
        </div>
      </form>

      {/* Searching */}
      {searching && (
        <div className={`rounded-[14px] border p-6 flex items-center gap-3 ${dark ? 'bg-ink-900 border-white/10' : 'bg-white border-ink-200'}`}>
          <Loader2 className="w-5 h-5 animate-spin text-blu-400" />
          <span className={`text-[14px] ${dark ? 'text-ink-300' : 'text-ink-600'}`}>Searching USPTO for potentially blocking patents...</span>
        </div>
      )}

      {/* Results */}
      {submitted && (
        <div className="space-y-6">
          {/* Draft Banner */}
          <div className={`rounded-lg px-4 py-2.5 text-[13px] font-semibold text-center tracking-wide uppercase ${dark ? 'bg-ink-100 text-ink-900' : 'bg-ink-900 text-white'}`}>
            Draft for Attorney Review
          </div>

          {usedQuery && (
            <p className={`text-[13px] ${dark ? 'text-ink-400' : 'text-ink-500'}`}>
              USPTO search query used: <span className="mono">{usedQuery}</span>
            </p>
          )}

          {searchError && (
            <div role="alert" className={`px-4 py-3 rounded-[14px] text-[14px] ${dark ? 'bg-red-400/10 border border-red-400/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
              USPTO search failed: {searchError} The draft below will not list candidate patents.
            </div>
          )}

          {!searchError && foundPatents.length === 0 && (
            <div role="status" className={`px-4 py-3 rounded-[14px] text-[14px] ${dark ? 'bg-amb-400/10 border border-amb-400/20 text-amb-400' : 'bg-amb-100 border border-amb-400/40 text-amb-500'}`}>
              No USPTO matches for: {usedQuery}. Try fewer or broader words.
            </div>
          )}

          {/* Real Patents Found */}
          {foundPatents.length > 0 && (
            <div className={`rounded-[14px] border p-6 ${dark ? 'bg-ink-900 border-white/10' : 'bg-white border-ink-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Potentially Relevant Patents from USPTO</h2>
                <span className={`mono text-[12px] px-2 py-0.5 rounded ${dark ? 'bg-grn-400/15 text-grn-400' : 'bg-grn-100 text-grn-500'}`}>
                  {foundPatents.length} found
                </span>
              </div>
              <div className="space-y-2">
                {foundPatents.map((p, i) => (
                  <div key={i} className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${dark ? 'bg-ink-800/50' : 'bg-ink-50'}`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`mono text-[12px] ${dark ? 'text-blu-400' : 'text-blu-500'}`}>{p.applicationNumber}</span>
                        <span className={`text-[13px] font-medium truncate ${dark ? 'text-ink-100' : 'text-ink-800'}`}>{p.title}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`mono text-[11px] ${dark ? 'text-ink-500' : 'text-ink-400'}`}>{p.filingDate}</span>
                        {p.statusDescription && <span className={`text-[11px] ${dark ? 'text-ink-400' : 'text-ink-500'}`}>{p.statusDescription}</span>}
                        {p.assignee && <span className={`text-[11px] ${dark ? 'text-ink-400' : 'text-ink-500'}`}>{p.assignee}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className={`mt-3 text-[12px] ${dark ? 'text-ink-500' : 'text-ink-400'}`}>
                These patents from the USPTO database will be included in the analysis below.
              </p>
            </div>
          )}

          {/* Claude FTO Analysis: with real patent data */}
          <ClaudeAnalysis
            query={`Prepare a draft freedom-to-operate risk screen for this technology: ${submittedQuery}

${searchSummary}

Follow the FTO memo skill structure, adapting the claim analysis section to list the claims to obtain and what to check in each.`}
            skillType="fto"
            context={`Technology description: ${submittedQuery}\nUSPTO search query: ${usedQuery || 'none'}\nUSPTO candidates found: ${foundPatents.length}${searchError ? ' (search failed)' : ''}`}
          />

          {/* Disclaimer */}
          <div className={`rounded-lg border p-4 text-[13px] italic ${dark ? 'bg-ink-800 border-ink-700 text-ink-400' : 'bg-ink-100 border-ink-200 text-ink-500'}`}>
            This is a draft FTO risk assessment for attorney review, not a "freedom to operate" opinion. It covers U.S. patents only, and relevant patents may not have been identified. Markman does not provide legal advice. Output is a draft and must be reviewed by a licensed attorney; verify all patent numbers, claim constructions, and legal conclusions before reliance.
          </div>
        </div>
      )}
    </div>
  )
}
