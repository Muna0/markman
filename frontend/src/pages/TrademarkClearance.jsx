import { useState } from 'react'
import { Stamp, ChevronRight, Loader2, AlertTriangle, ExternalLink } from 'lucide-react'
import { useTheme } from '../store/ThemeContext'
import { api } from '../store/api'
import { localHistory } from '../store/localHistory'
import ClaudeAnalysis from '../components/ClaudeAnalysis'
import { searchVariants } from '../store/searchVariants'

const JURISDICTIONS = ['US', 'EU', 'UK', 'CA', 'AU', 'JP', 'KR', 'IN', 'BR', 'MX']

// Office name and search link for each jurisdiction. A note appears only where it is
// short and verifiable; regime labels like "first-to-file" are left to the draft and counsel.
function jurisdictionInfo(code, markText) {
  const q = encodeURIComponent(markText)
  const info = {
    US: { name: 'United States', office: 'USPTO', searchUrl: 'https://tmsearch.uspto.gov/search/search-information', note: 'Rights arise from use; filings may be use-based or intent-to-use' },
    EU: { name: 'European Union', office: 'EUIPO', searchUrl: `https://euipo.europa.eu/eSearch/#basic/${q}` },
    UK: { name: 'United Kingdom', office: 'UKIPO', searchUrl: 'https://www.gov.uk/search-for-trademark' },
    CA: { name: 'Canada', office: 'CIPO', searchUrl: `https://ised-isde.canada.ca/cipo/trade-marks/search?searchType=basic&keyword=${q}`, note: 'Use not required to register (since June 2019)' },
    AU: { name: 'Australia', office: 'IP Australia', searchUrl: `https://search.ipaustralia.gov.au/trademarks/search/quick/result?q=${q}` },
    JP: { name: 'Japan', office: 'JPO', searchUrl: 'https://www.j-platpat.inpit.go.jp/' },
    KR: { name: 'South Korea', office: 'KIPO', searchUrl: 'https://engdtj.kipris.or.kr/engdtj/grrt1000a.do?method=basicSearch' },
    IN: { name: 'India', office: 'Indian Trade Marks Registry', searchUrl: 'https://iprsearch.ipindia.gov.in/TMRPublicSearch/tmsearch' },
    BR: { name: 'Brazil', office: 'INPI Brazil', searchUrl: 'https://busca.inpi.gov.br/pePI/servlet/MarcaServletController' },
    MX: { name: 'Mexico', office: 'IMPI Mexico', searchUrl: 'https://marcanet.impi.gob.mx/marcanet/vistas/common/datos/bsqMarcas.pgi' },
  }
  return { code, ...info[code] }
}

// The request sent for the draft: only what the user entered. No guessed classes or distinctiveness.
function buildQuery({ mark, goods, jurisdictions, pastedMarks }) {
  const names = jurisdictions.map(c => jurisdictionInfo(c, mark).name || c).join(', ')
  return [
    `Draft a preliminary trademark clearance screen for the proposed mark "${mark}" for these goods/services: "${goods}".`,
    `Target jurisdictions: ${names}.`,
    pastedMarks
      ? `Marks the user found in trademark office searches (as pasted by the user):\n${pastedMarks}`
      : 'The user has not pasted any search results. No trademark register was searched for this draft; do not assume or invent any existing marks.',
    'Propose the likely Nice classes for these goods/services and give a view on where the mark falls on the distinctiveness spectrum. Label both clearly as preliminary.',
    pastedMarks
      ? 'For each pasted mark, assess likelihood of confusion (DuPont factors for the US) and give a preliminary conflict risk rating.'
      : 'Without search results, do not rate conflict risk; explain which searches should be run and what to look for.',
  ].join('\n\n')
}

function buildContext({ mark, goods, jurisdictions, pastedMarks }) {
  return [
    `Mark: ${mark}`,
    `Goods/services: ${goods}`,
    `Jurisdictions: ${jurisdictions.map(c => jurisdictionInfo(c, mark).name || c).join(', ')}`,
    pastedMarks ? `Marks pasted by the user:\n${pastedMarks}` : 'Marks pasted by the user: none',
  ].join('\n')
}

export default function TrademarkClearance() {
  const { dark } = useTheme()
  const [mark, setMark] = useState('')
  const [goods, setGoods] = useState('')
  const [pastedMarks, setPastedMarks] = useState('')
  const [selectedJurisdictions, setSelectedJurisdictions] = useState(['US', 'EU', 'UK', 'CA'])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  function toggleJurisdiction(code) {
    setSelectedJurisdictions(prev =>
      prev.includes(code) ? prev.filter(j => j !== code) : [...prev, code]
    )
  }

  const [liveNote, setLiveNote] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!mark.trim() || !goods.trim()) return
    setLoading(true)
    setResult(null)
    setLiveNote('')

    const markText = mark.trim()
    const markUpper = markText.toUpperCase()

    // Try live TSDR search
    try {
      const data = await api.searchTrademarks(markText)
      if (data.note) setLiveNote({ text: data.note, searchUrl: data.searchUrl })
    } catch {}

    const input = { mark: markUpper, goods: goods.trim(), jurisdictions: [...selectedJurisdictions] }
    const dynamicResult = {
      ...input,
      variants: searchVariants(markText),
      jurisdictionRows: selectedJurisdictions.map(code => jurisdictionInfo(code, markText)),
    }

    localHistory.logMatter('trademark-screen', `TM Clearance: ${markUpper}`, `${selectedJurisdictions.length} jurisdictions selected.`, 'UNKNOWN', `${mark} | ${goods} | ${selectedJurisdictions.join(', ')}`)

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

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="tm-pasted">Marks you found <span className={`font-normal ${dark ? 'text-ink-400' : 'text-ink-500'}`}>(optional)</span></label>
          <textarea
            id="tm-pasted"
            value={pastedMarks}
            onChange={e => setPastedMarks(e.target.value)}
            rows={3}
            placeholder="Paste marks from your office searches, one per line (mark, owner, serial or registration number, class, status)"
            className={`w-full rounded-[8px] border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blu-500/30 focus:border-blu-500 resize-y placeholder:text-ink-400 ${dark ? 'border-ink-700 bg-ink-800' : 'border-ink-200 bg-white'}`}
          />
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
            <p className={`text-[15px] leading-[1.7] ${dark ? 'text-ink-200' : 'text-ink-600'}`}>
              Search {result.mark} and the variants below in each office's database. Paste any marks you find into "Marks you found" above, then run the draft. The draft proposes likely Nice classes and a preliminary distinctiveness view; nothing on this page is a search result or a conflict rating.
            </p>
          </div>

          {/* Variants to search: plain, unscored */}
          <div className={`rounded-[14px] border p-6 ${dark ? 'bg-ink-900 border-white/10' : 'bg-white border-ink-200'}`}>
            <h2 className={`text-lg font-semibold mb-2 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Variants to search</h2>
            <p className={`text-[13px] mb-4 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>
              Spellings worth entering in each office search alongside the mark itself. These are search terms, not conflicts.
            </p>
            {result.variants.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {result.variants.map(v => (
                  <li key={v} className={`mono text-[13px] px-3 py-1.5 rounded-lg ${dark ? 'bg-ink-800/50 text-ink-100' : 'bg-ink-50 text-ink-800'}`}>{v}</li>
                ))}
              </ul>
            ) : (
              <p className={`text-[13px] ${dark ? 'text-ink-400' : 'text-ink-500'}`}>No extra spellings suggested for this mark. Search the mark as entered.</p>
            )}
          </div>

          {/* Jurisdictions with office search links */}
          <div className={`rounded-[14px] border p-6 ${dark ? 'bg-ink-900 border-white/10' : 'bg-white border-ink-200'}`}>
            <h2 className={`text-lg font-semibold mb-2 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Office searches</h2>
            <p className={`text-[13px] mb-5 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>
              Open each trademark office's database directly.
            </p>
            <div className="space-y-2">
              {result.jurisdictionRows.map(j => (
                <div key={j.code} className={`flex items-center justify-between rounded-lg px-4 py-3 ${dark ? 'bg-ink-800/50' : 'bg-ink-50'}`}>
                  <div>
                    <span className={`text-[14px] font-medium ${dark ? 'text-ink-100' : 'text-ink-800'}`}>{j.name}</span>
                    <span className={`text-[13px] ml-2 ${dark ? 'text-ink-300' : 'text-ink-600'}`}>{j.office}</span>
                    {j.note && <span className={`text-[12px] ml-2 ${dark ? 'text-ink-500' : 'text-ink-400'}`}>{j.note}</span>}
                  </div>
                  {j.searchUrl && (
                    <a href={j.searchUrl} target="_blank" rel="noopener noreferrer"
                      className={`mono text-[11px] font-medium px-2.5 py-1 rounded flex items-center gap-1 transition ${dark ? 'bg-blu-500/15 text-blu-400 hover:bg-blu-500/25' : 'bg-blu-50 text-blu-500 hover:bg-blu-100'}`}>
                      Search <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Draft analysis: sends only what the user entered */}
          <ClaudeAnalysis
            key={result.mark}
            query={buildQuery({ ...result, pastedMarks: pastedMarks.trim() })}
            skillType="trademark"
            context={buildContext({ ...result, pastedMarks: pastedMarks.trim() })}
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
