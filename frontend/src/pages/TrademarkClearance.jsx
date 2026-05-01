import { useState } from 'react'
import { Stamp, ChevronRight, Loader2, AlertTriangle, CheckCircle2, XCircle, MinusCircle, ExternalLink } from 'lucide-react'
import { useTheme } from '../store/ThemeContext'
import { api } from '../store/api'
import ClaudeAnalysis from '../components/ClaudeAnalysis'

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

  const [liveNote, setLiveNote] = useState('')

  // Generate phonetic variants of a mark
  function generateVariants(markText) {
    const m = markText.toUpperCase()
    const variants = new Set()
    // Drop vowels
    variants.add(m.replace(/[AEIOU]/g, ''))
    // Double letters
    for (let i = 0; i < m.length; i++) {
      variants.add(m.slice(0, i) + m[i] + m.slice(i))
    }
    // Common substitutions
    const subs = { 'PH': 'F', 'F': 'PH', 'CK': 'K', 'K': 'CK', 'X': 'CKS', 'C': 'K', 'EE': 'EA', 'I': 'Y', 'Y': 'I' }
    for (const [from, to] of Object.entries(subs)) {
      if (m.includes(from)) variants.add(m.replace(from, to))
    }
    // Drop last letter
    variants.add(m.slice(0, -1))
    // Add common suffixes
    variants.add(m + 'LY')
    variants.add(m + 'IO')
    variants.delete(m) // Remove exact match
    return [...variants].slice(0, 6)
  }

  // Calculate string similarity (Levenshtein-based)
  function similarity(a, b) {
    const la = a.length, lb = b.length
    const dp = Array.from({ length: la + 1 }, (_, i) => Array.from({ length: lb + 1 }, (_, j) => i || j))
    for (let i = 1; i <= la; i++)
      for (let j = 1; j <= lb; j++)
        dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + (a[i-1] !== b[j-1] ? 1 : 0))
    return 1 - dp[la][lb] / Math.max(la, lb)
  }

  // Assess jurisdiction (real logic based on trademark registration systems)
  function assessJurisdictions(markText, jurisdictions) {
    return jurisdictions.map(code => {
      const info = {
        US: { system: 'First-to-use', office: 'USPTO', searchUrl: `https://tmsearch.uspto.gov/search/search-results?query=${encodeURIComponent(markText)}&section=default` },
        EU: { system: 'First-to-file', office: 'EUIPO', searchUrl: `https://euipo.europa.eu/eSearch/#basic/${encodeURIComponent(markText)}` },
        UK: { system: 'First-to-file', office: 'UKIPO', searchUrl: `https://www.gov.uk/search-for-trademark` },
        CA: { system: 'First-to-file (since 2019)', office: 'CIPO', searchUrl: `https://ised-isde.canada.ca/cipo/trade-marks/search?searchType=basic&keyword=${encodeURIComponent(markText)}` },
        AU: { system: 'First-to-use', office: 'IP Australia', searchUrl: `https://search.ipaustralia.gov.au/trademarks/search/quick/result?q=${encodeURIComponent(markText)}` },
        JP: { system: 'First-to-file', office: 'JPO', searchUrl: `https://www.j-platpat.inpit.go.jp/` },
        KR: { system: 'First-to-file', office: 'KIPO', searchUrl: `https://engdtj.kipris.or.kr/engdtj/grrt1000a.do?method=basicSearch` },
        IN: { system: 'First-to-use', office: 'Indian TM Registry', searchUrl: `https://iprsearch.ipindia.gov.in/TMRPublicSearch/tmsearch` },
        BR: { system: 'First-to-file', office: 'INPI Brazil', searchUrl: `https://busca.inpi.gov.br/pePI/servlet/MarcaServletController` },
        MX: { system: 'First-to-file', office: 'IMPI Mexico', searchUrl: `https://marcanet.impi.gob.mx/marcanet/vistas/common/datos/bsqMarcas.pgi` },
      }
      return { code, ...info[code], status: 'SEARCH REQUIRED', note: `Search ${info[code]?.office || code} database directly` }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!mark.trim() || !goods.trim()) return
    setLoading(true)
    setResult(null)
    setLiveNote('')

    // Generate real analysis
    const variants = generateVariants(mark.trim())
    const jurisdictionResults = assessJurisdictions(mark.trim(), selectedJurisdictions)

    // Try live TSDR search
    try {
      const data = await api.searchTrademarks(mark.trim())
      if (data.note) setLiveNote(data.note)
    } catch {}

    // Build dynamic result
    const markUpper = mark.trim().toUpperCase()
    const distinctiveness = /^[A-Z]+$/.test(markUpper) && markUpper.length <= 4 ? 'Arbitrary/Fanciful'
      : markUpper.includes(' ') ? 'Descriptive (assess further)'
      : 'Suggestive'

    // Determine Nice classes from goods description
    const goodsLower = goods.toLowerCase()
    const niceClasses = []
    if (goodsLower.includes('software') || goodsLower.includes('app') || goodsLower.includes('download')) niceClasses.push('009')
    if (goodsLower.includes('saas') || goodsLower.includes('cloud') || goodsLower.includes('platform')) niceClasses.push('042')
    if (goodsLower.includes('education') || goodsLower.includes('training')) niceClasses.push('041')
    if (goodsLower.includes('financial') || goodsLower.includes('insurance')) niceClasses.push('036')
    if (goodsLower.includes('medical') || goodsLower.includes('health')) niceClasses.push('044')
    if (niceClasses.length === 0) niceClasses.push('042') // default

    const dynamicResult = {
      mark: markUpper,
      markType: markUpper.includes(' ') ? 'Word Mark (multiple words)' : 'Word Mark (Standard Characters)',
      distinctiveness,
      niceClasses: niceClasses.map(c => `Class ${c}`),
      registrability: distinctiveness === 'Arbitrary/Fanciful'
        ? `${markUpper} appears to be a coined or arbitrary term. Strong inherent distinctiveness. Likely registrable.`
        : distinctiveness === 'Suggestive'
        ? `${markUpper} may be suggestive of the goods/services. Generally registrable without showing acquired distinctiveness.`
        : `${markUpper} may be descriptive. May require evidence of acquired distinctiveness (Section 2(f)) for registration.`,
      variants: variants.map(v => ({ mark: v, similarity: Math.round(similarity(markUpper, v) * 100) })),
      jurisdictions: jurisdictionResults,
      selectedGoods: goods,
      overall: 'SEARCH REQUIRED',
      recommendation: `Preliminary analysis complete for ${markUpper}. Distinctiveness: ${distinctiveness}. ${variants.length} phonetic variants generated. ${selectedJurisdictions.length} jurisdictions selected. To complete clearance, search each jurisdiction database using the links below. For automated search, run /tm-clearance ${markUpper} | ${goods} | ${selectedJurisdictions.join(', ')} in Claude Code with Markman installed.`,
    }

    // Log to history
    api.logMatter('trademark-screen', `TM Clearance: ${markUpper}`, `${distinctiveness} mark in ${niceClasses.join(', ')}. ${selectedJurisdictions.length} jurisdictions.`, 'UNKNOWN', `${mark} | ${goods} | ${selectedJurisdictions.join(', ')}`)

    setResult(dynamicResult)
    setLoading(false)
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
          {/* Live API note */}
          {liveNote && (
            <div className={`rounded-xl p-4 flex items-start gap-3 ${dark ? 'bg-ink-800/30 border border-ink-700/40' : 'bg-ink-50 border border-ink-200'}`}>
              <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${dark ? 'text-amb-400' : 'text-amb-500'}`} />
              <p className={`text-[13px] ${dark ? 'text-ink-300' : 'text-ink-500'}`}>{liveNote}</p>
            </div>
          )}

          {/* Summary */}
          <div className={`rounded-xl p-6 border ${dark ? 'bg-ink-800/30 border-ink-700/40' : 'bg-ink-50 border-ink-200'}`}>
            <p className={`text-[15px] leading-[1.7] ${dark ? 'text-ink-200' : 'text-ink-600'}`}>{result.recommendation}</p>
          </div>

          {/* Mark Assessment */}
          <div className={`rounded-xl border p-6 ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${dark ? 'text-white' : 'text-ink-950'}`}>Mark Assessment</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className={`rounded-lg p-4 ${dark ? 'bg-ink-800' : 'bg-ink-50'}`}>
                <p className={`mono text-[11px] uppercase tracking-wider font-semibold mb-1 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>Mark Type</p>
                <p className={`text-[14px] font-medium ${dark ? 'text-ink-100' : 'text-ink-800'}`}>{result.markType}</p>
              </div>
              <div className={`rounded-lg p-4 ${dark ? 'bg-ink-800' : 'bg-ink-50'}`}>
                <p className={`mono text-[11px] uppercase tracking-wider font-semibold mb-1 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>Distinctiveness</p>
                <p className={`text-[14px] font-medium ${dark ? 'text-ink-100' : 'text-ink-800'}`}>{result.distinctiveness}</p>
              </div>
              <div className={`rounded-lg p-4 ${dark ? 'bg-ink-800' : 'bg-ink-50'}`}>
                <p className={`mono text-[11px] uppercase tracking-wider font-semibold mb-1 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>Nice Classes</p>
                <p className={`text-[14px] font-medium ${dark ? 'text-ink-100' : 'text-ink-800'}`}>{result.niceClasses.join(', ')}</p>
              </div>
            </div>
            <p className={`text-[14px] leading-[1.6] ${dark ? 'text-ink-300' : 'text-ink-600'}`}>{result.registrability}</p>
          </div>

          {/* Phonetic Variants — dynamically generated */}
          <div className={`rounded-xl border p-6 ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${dark ? 'text-white' : 'text-ink-950'}`}>Phonetic Variants to Search</h2>
            <p className={`text-[13px] mb-4 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>
              These are automatically generated variants that should be searched for conflicts (sound-alikes, misspellings, common substitutions):
            </p>
            <div className="space-y-2">
              {result.variants.map((v, i) => (
                <div key={i} className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${dark ? 'bg-ink-800/50' : 'bg-ink-50'}`}>
                  <span className={`mono text-[14px] font-medium ${dark ? 'text-ink-100' : 'text-ink-800'}`}>{v.mark}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 w-28">
                      <div className={`flex-1 h-2 rounded-full overflow-hidden ${dark ? 'bg-ink-700' : 'bg-ink-200'}`}>
                        <div className={`h-full rounded-full ${v.similarity > 80 ? 'bg-red-400' : v.similarity > 60 ? 'bg-amb-400' : 'bg-grn-400'}`} style={{ width: `${v.similarity}%` }} />
                      </div>
                      <span className={`mono text-[11px] ${dark ? 'text-ink-400' : 'text-ink-500'}`}>{v.similarity}%</span>
                    </div>
                    <span className={`mono text-[10px] px-2 py-0.5 rounded font-bold ${
                      v.similarity > 80 ? (dark ? 'bg-red-400/15 text-red-400' : 'bg-red-100 text-red-500')
                      : v.similarity > 60 ? (dark ? 'bg-amb-400/15 text-amb-400' : 'bg-amb-100 text-amb-500')
                      : (dark ? 'bg-grn-400/15 text-grn-400' : 'bg-grn-100 text-grn-500')
                    }`}>{v.similarity > 80 ? 'HIGH' : v.similarity > 60 ? 'MEDIUM' : 'LOW'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Jurisdiction Coverage — with live search links */}
          <div className={`rounded-xl border p-6 ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
            <h2 className={`text-lg font-semibold mb-2 ${dark ? 'text-white' : 'text-ink-950'}`}>Jurisdiction Coverage</h2>
            <p className={`text-[13px] mb-5 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>
              Click "Search" to open each trademark office database directly. First-to-file jurisdictions require registration for priority. First-to-use jurisdictions recognize rights from commercial use.
            </p>
            <div className="space-y-2">
              {result.jurisdictions.map(j => (
                <div key={j.code} className={`flex items-center justify-between rounded-lg px-4 py-3 ${dark ? 'bg-ink-800/50' : 'bg-ink-50'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`mono text-[14px] font-bold w-8 ${dark ? 'text-ink-100' : 'text-ink-800'}`}>{j.code}</span>
                    <div>
                      <span className={`text-[13px] ${dark ? 'text-ink-200' : 'text-ink-700'}`}>{j.office}</span>
                      <span className={`text-[12px] ml-2 ${dark ? 'text-ink-500' : 'text-ink-400'}`}>({j.system})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`mono text-[10px] px-2 py-0.5 rounded font-bold ${dark ? 'bg-amb-400/15 text-amb-400' : 'bg-amb-100 text-amb-500'}`}>
                      SEARCH REQUIRED
                    </span>
                    {j.searchUrl && (
                      <a href={j.searchUrl} target="_blank" rel="noopener noreferrer"
                        className={`mono text-[11px] font-medium px-2.5 py-1 rounded flex items-center gap-1 transition ${dark ? 'bg-blu-500/15 text-blu-400 hover:bg-blu-500/25' : 'bg-blu-50 text-blu-500 hover:bg-blu-100'}`}>
                        Search <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Claude Full Analysis */}
          <ClaudeAnalysis
            query={`Run a full trademark clearance analysis for the mark "${result.mark}" for goods/services: "${result.selectedGoods}". Target jurisdictions: ${selectedJurisdictions.join(', ')}. The mark appears to be ${result.distinctiveness}. Nice classes: ${result.niceClasses.join(', ')}. Provide DuPont factor analysis, likelihood of confusion assessment, and a CLEAR / CLEAR WITH RISK / DO NOT USE recommendation per jurisdiction.`}
            skillType="trademark"
            context={`Mark: ${result.mark}\nGoods: ${result.selectedGoods}\nDistinctiveness: ${result.distinctiveness}\nNice Classes: ${result.niceClasses.join(', ')}\nJurisdictions: ${selectedJurisdictions.join(', ')}\nPhonetic variants: ${result.variants.map(v => v.mark).join(', ')}`}
          />

          {/* Disclaimer */}
          <div className={`rounded-lg border p-4 text-[13px] italic ${dark ? 'bg-ink-800 border-ink-700 text-ink-400' : 'bg-ink-100 border-ink-200 text-ink-500'}`}>
            This is a preliminary clearance screen, not a comprehensive trademark search. Common law marks, state registrations, and domain name conflicts require separate investigation. This analysis does not constitute legal advice.
          </div>
        </div>
      )}
    </div>
  )
}
