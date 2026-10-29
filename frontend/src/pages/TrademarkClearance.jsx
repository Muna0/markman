import { useState } from 'react'
import { Stamp, ChevronRight, Loader2, AlertTriangle, CheckCircle2, XCircle, MinusCircle, ExternalLink } from 'lucide-react'
import { useTheme } from '../store/ThemeContext'
import { api } from '../store/api'
import { localHistory } from '../store/localHistory'
import ClaudeAnalysis from '../components/ClaudeAnalysis'

const JURISDICTIONS = ['US', 'EU', 'UK', 'CA', 'AU', 'JP', 'KR', 'IN', 'BR', 'MX']

function RiskIcon({ risk }) {
  if (risk === 'HIGH') return <XCircle className="w-4 h-4 text-red-500" />
  if (risk === 'MEDIUM') return <MinusCircle className="w-4 h-4 text-amb-500" />
  return <CheckCircle2 className="w-4 h-4 text-grn-500" />
}

function JurisdictionStatus({ status, dark }) {
  const styles = {
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
        US: { system: 'First-to-use', office: 'USPTO', searchUrl: `https://tmsearch.uspto.gov/search/search-information` },
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
      if (data.note) setLiveNote({ text: data.note, searchUrl: data.searchUrl })
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
      recommendation: `Preliminary analysis complete for ${markUpper}. Distinctiveness: ${distinctiveness}. ${variants.length} phonetic variants generated. ${selectedJurisdictions.length} jurisdictions selected. To complete clearance, search each jurisdiction database using the links below. In Claude Code, /tm-clearance drafts the likelihood-of-confusion analysis from the marks you find and paste.`,
    }

    // Log to history
    localHistory.logMatter('trademark-screen', `TM Clearance: ${markUpper}`, `${distinctiveness} mark in ${niceClasses.join(', ')}. ${selectedJurisdictions.length} jurisdictions.`, 'UNKNOWN', `${mark} | ${goods} | ${selectedJurisdictions.join(', ')}`)

    setResult(dynamicResult)
    setLoading(false)
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-[10px] ${dark ? 'bg-blu-500/15' : 'bg-blu-50'} flex items-center justify-center`}>
            <Stamp className="w-5 h-5 text-blu-500" />
          </div>
          <div>
            <h1 className={`text-[28px] font-bold tracking-[-0.02em] ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Trademark Clearance</h1>
            <p className={`text-sm ${dark ? 'text-ink-400' : 'text-ink-500'}`}>Screen a mark for conflicts across jurisdictions</p>
          </div>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className={`rounded-[14px] border p-6 mb-6 ${dark ? 'bg-ink-900 border-white/10' : 'bg-white border-ink-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Proposed Mark</label>
            <input
              type="text"
              value={mark}
              onChange={e => setMark(e.target.value)}
              placeholder="e.g., NEXAFLOW"
              className={`w-full rounded-[8px] border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blu-500/30 focus:border-blu-500 placeholder:text-ink-400 ${dark ? 'border-ink-700 bg-ink-800' : 'border-ink-200 bg-white'}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Goods / Services</label>
            <input
              type="text"
              value={goods}
              onChange={e => setGoods(e.target.value)}
              placeholder="e.g., AI-powered workflow automation software"
              className={`w-full rounded-[8px] border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blu-500/30 focus:border-blu-500 placeholder:text-ink-400 ${dark ? 'border-ink-700 bg-ink-800' : 'border-ink-200 bg-white'}`}
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
            className="flex items-center gap-2 px-5 py-2.5 rounded-[5px] bg-blu-500 text-white btn-shadow text-sm font-medium hover:bg-blu-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            <div className={`rounded-[14px] p-4 flex items-start gap-3 ${dark ? 'bg-ink-800/30 border border-ink-700/40' : 'bg-ink-50 border border-ink-200'}`}>
              <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${dark ? 'text-amb-400' : 'text-amb-500'}`} />
              <div className="space-y-2">
                <p className={`text-[13px] ${dark ? 'text-ink-300' : 'text-ink-500'}`}>{liveNote.text}</p>
                {liveNote.searchUrl && (
                  <button type="button"
                    onClick={() => { navigator.clipboard?.writeText(mark.trim()).catch(() => {}); window.open(liveNote.searchUrl, '_blank', 'noopener') }}
                    className={`text-[13px] font-medium underline ${dark ? 'text-ink-100' : 'text-ink-800'}`}>
                    Copy "{mark.trim()}" and open USPTO Trademark Search
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className={`rounded-[14px] p-6 border ${dark ? 'bg-ink-800/30 border-ink-700/40' : 'bg-ink-50 border-ink-200'}`}>
            <p className={`text-[15px] leading-[1.7] ${dark ? 'text-ink-200' : 'text-ink-600'}`}>{result.recommendation}</p>
          </div>

          {/* Mark Assessment */}
          <div className={`rounded-[14px] border p-6 ${dark ? 'bg-ink-900 border-white/10' : 'bg-white border-ink-200'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Mark Assessment</h2>
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

          {/* Phonetic Variants: dynamically generated */}
          <div className={`rounded-[14px] border p-6 ${dark ? 'bg-ink-900 border-white/10' : 'bg-white border-ink-200'}`}>
            <h2 className={`text-lg font-semibold mb-4 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Phonetic Variants to Search</h2>
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

          {/* Jurisdiction Coverage: with live search links */}
          <div className={`rounded-[14px] border p-6 ${dark ? 'bg-ink-900 border-white/10' : 'bg-white border-ink-200'}`}>
            <h2 className={`text-lg font-semibold mb-2 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Jurisdiction Coverage</h2>
            <p className={`text-[13px] mb-5 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>
              Click "Search" to open each trademark office database directly. First-to-file jurisdictions generally require registration for priority. First-to-use jurisdictions recognize rights from commercial use.
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
            query={`Run a full trademark clearance analysis for the mark "${result.mark}" for goods/services: "${result.selectedGoods}". Target jurisdictions: ${selectedJurisdictions.join(', ')}. The mark appears to be ${result.distinctiveness}. Nice classes: ${result.niceClasses.join(', ')}. Provide DuPont factor analysis, likelihood of confusion assessment, and a preliminary conflict risk rating (LOW / MEDIUM / HIGH) per jurisdiction.`}
            skillType="trademark"
            context={`Mark: ${result.mark}\nGoods: ${result.selectedGoods}\nDistinctiveness: ${result.distinctiveness}\nNice Classes: ${result.niceClasses.join(', ')}\nJurisdictions: ${selectedJurisdictions.join(', ')}\nPhonetic variants: ${result.variants.map(v => v.mark).join(', ')}`}
          />

          {/* Disclaimer */}
          <div className={`rounded-lg border p-4 text-[13px] italic ${dark ? 'bg-ink-800 border-ink-700 text-ink-400' : 'bg-ink-100 border-ink-200 text-ink-500'}`}>
            This is a draft preliminary clearance screen for attorney review, not a comprehensive trademark search. Common law marks, state registrations, and domain name conflicts require separate investigation. Markman does not provide legal advice. Output is a draft and must be reviewed by a licensed attorney.
          </div>
        </div>
      )}
    </div>
  )
}
