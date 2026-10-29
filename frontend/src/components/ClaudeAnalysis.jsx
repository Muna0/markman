import { useState, useRef, useEffect, lazy, Suspense } from 'react'
import { useTheme } from '../store/ThemeContext'
import { api } from '../store/api'
import { Sparkles, Loader2, Download, FileText, RefreshCw } from 'lucide-react'

// Loaded on demand so the Markdown renderer stays out of the main bundle
const MarkdownBody = lazy(() => import('./MarkdownBody'))

/**
 * ClaudeAnalysis: streams a real Claude analysis using Markman skills.
 *
 * Props:
 *   query: string - what to analyze
 *   skillType: 'patent' | 'trademark' | 'fto' | 'intake'
 *   context?: string - additional context
 *   onComplete?: (text) => void - callback when done
 *   disabled?: boolean - disable the Run button (e.g. while inputs are still loading)
 *   disabledLabel?: string - button label while disabled
 */
const STOP_WARNINGS = {
  max_tokens: 'This draft was cut off before it finished; the limitations section may be missing. Try a narrower question.',
  refusal: 'The model declined to complete this request.',
}

export default function ClaudeAnalysis({ query, skillType, context, onComplete, disabled = false, disabledLabel = 'Loading...' }) {
  const { dark } = useTheme()
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [stopReason, setStopReason] = useState(null)
  const controllerRef = useRef(null)
  const bodyRef = useRef(null)

  // Stop any in-flight stream when the component unmounts (e.g. switching patents)
  useEffect(() => () => controllerRef.current?.abort(), [])

  async function run() {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setRunning(true)
    setOutput('')
    setError(null)
    setDone(false)
    setStopReason(null)

    let reason = null
    try {
      let fullText = ''
      for await (const chunk of api.analyze(query, skillType, context, {
        signal: controller.signal,
        onDone: ({ stopReason }) => { reason = stopReason },
      })) {
        fullText += chunk
        setOutput(fullText)
      }
      if (controller.signal.aborted) return
      setStopReason(reason)
      if (reason === 'refusal') {
        setError(new Error(STOP_WARNINGS.refusal))
      } else if (!fullText.trim()) {
        setError(new Error('The analysis returned no text. Please try again.'))
      } else {
        setDone(true)
        if (onComplete) onComplete(fullText)
      }
    } catch (err) {
      if (controller.signal.aborted) return
      setError(err)
    }
    setRunning(false)
  }

  const warning = STOP_WARNINGS[stopReason] && stopReason !== 'refusal' ? STOP_WARNINGS[stopReason] : null

  function downloadMarkdown() {
    const blob = new Blob([output], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `markman-${skillType}-analysis.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function downloadWord() {
    setExporting(true)
    try {
      const title = `Markman ${skillType.charAt(0).toUpperCase() + skillType.slice(1)} Analysis`
      await api.exportMemo(title, output, skillType === 'fto' ? 'FTO' : skillType)
    } catch (err) {
      setError(err)
    }
    setExporting(false)
  }

  function downloadPDF() {
    // Print the formatted draft. The HTML comes from the rendered Markdown above,
    // which React has already escaped; raw HTML in the output is never rendered.
    const content = bodyRef.current?.innerHTML || ''
    const title = `Markman ${skillType} Analysis`.replace(/[<>&"]/g, '')
    const draftLabel = '<div class="draft">DRAFT FOR ATTORNEY REVIEW</div>'
    const css = `body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.55;max-width:7in;margin:0.75in auto;color:#111}
.draft{text-align:center;font-size:10pt;color:#666;border-bottom:1px solid #ccc;padding-bottom:12px;margin-bottom:24px}
h1{font-size:18pt;margin:18pt 0 8pt}h2{font-size:15pt;margin:16pt 0 6pt}h3,h4{font-size:13pt;margin:12pt 0 4pt}
p{margin:0 0 8pt}ul,ol{margin:0 0 8pt;padding-left:24pt}li{margin:2pt 0}
table{border-collapse:collapse;width:100%;margin:8pt 0 12pt;font-size:11pt}th,td{border:1px solid #999;padding:4pt 6pt;text-align:left;vertical-align:top}th{background:#eee}
code{font-family:'Courier New',monospace;font-size:10.5pt}pre{background:#f4f4f4;padding:8pt;white-space:pre-wrap}
blockquote{margin:0 0 8pt;padding-left:12pt;border-left:3px solid #ccc;color:#444}hr{border:0;border-top:1px solid #ccc;margin:12pt 0}
a{color:#111}.disclaimer{font-style:italic;color:#666;font-size:9pt;border-top:1px solid #ccc;padding-top:12px;margin-top:36px}`
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head><body>${draftLabel}${content}<div class="disclaimer">Draft for attorney review. Markman does not provide legal advice. This draft was prepared with AI assistance and must be reviewed by a licensed attorney. Verify all citations and conclusions before reliance.</div></body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const printFrame = document.createElement('iframe')
    printFrame.style.display = 'none'
    printFrame.src = url
    printFrame.onload = () => {
      printFrame.contentWindow.print()
      setTimeout(() => {
        document.body.removeChild(printFrame)
        URL.revokeObjectURL(url)
      }, 1000)
    }
    document.body.appendChild(printFrame)
  }

  if (!output && !running && !error) {
    return (
      <div>
        <button onClick={run} disabled={disabled}
          className={`flex items-center gap-2 px-5 py-3 rounded-lg mono text-[14px] font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${
            dark ? 'bg-blu-500/15 text-blu-400 hover:bg-blu-500/25 border border-blu-500/20' : 'bg-blu-50 text-blu-500 hover:bg-blu-100 border border-blu-200'
          }`}>
          <Sparkles className="w-4 h-4" />
          {disabled ? disabledLabel : 'Run Claude Analysis'}
        </button>
        <p className={`mt-2 text-[12px] ${dark ? 'text-ink-400' : 'text-ink-500'}`}>
          Do not paste confidential client information into the public demo.
        </p>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border overflow-hidden ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-3 border-b ${dark ? 'border-ink-800 bg-ink-800/30' : 'border-ink-200 bg-ink-50'}`}>
        <div className="flex items-center gap-2">
          <Sparkles className={`w-4 h-4 ${running ? 'animate-pulse' : ''} ${dark ? 'text-blu-400' : 'text-blu-500'}`} />
          <span className={`mono text-[13px] font-bold ${dark ? 'text-ink-200' : 'text-ink-700'}`}>
            {running ? 'Streaming...' : warning ? 'Draft incomplete' : done ? 'Draft complete' : ''}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {done && (
            <>
              <button onClick={downloadMarkdown}
                className={`flex items-center gap-1 mono text-[11px] px-2.5 py-1.5 rounded transition ${dark ? 'text-ink-400 hover:text-ink-200 hover:bg-ink-700' : 'text-ink-500 hover:text-ink-700 hover:bg-ink-100'}`}>
                <Download className="w-3 h-3" /> .md
              </button>
              <button onClick={downloadWord} disabled={exporting}
                className={`flex items-center gap-1 mono text-[11px] px-2.5 py-1.5 rounded transition ${dark ? 'text-ink-400 hover:text-ink-200 hover:bg-ink-700' : 'text-ink-500 hover:text-ink-700 hover:bg-ink-100'}`}>
                <FileText className="w-3 h-3" /> {exporting ? '...' : '.docx'}
              </button>
              <button onClick={downloadPDF}
                className={`flex items-center gap-1 mono text-[11px] px-2.5 py-1.5 rounded transition ${dark ? 'text-ink-400 hover:text-ink-200 hover:bg-ink-700' : 'text-ink-500 hover:text-ink-700 hover:bg-ink-100'}`}>
                <Download className="w-3 h-3" /> PDF
              </button>
            </>
          )}
          {!running && (done || error) && (
            <button onClick={run} title="In the public demo, each run counts toward the daily limit."
              className={`flex items-center gap-1 mono text-[11px] px-2.5 py-1.5 rounded transition ${dark ? 'text-ink-400 hover:text-ink-200 hover:bg-ink-700' : 'text-ink-500 hover:text-ink-700 hover:bg-ink-100'}`}>
              <RefreshCw className="w-3 h-3" /> {done ? 'Re-run' : 'Try again'}
            </button>
          )}
          {running && <Loader2 className="w-3.5 h-3.5 animate-spin text-blu-400" />}
        </div>
      </div>

      {/* Output */}
      <div className="p-5 max-h-[700px] overflow-y-auto">
        {warning && (
          <p role="alert" className={`text-[14px] mb-3 font-semibold ${dark ? 'text-amb-400' : 'text-amb-700'}`}>
            {warning}
          </p>
        )}
        {error && (
          <p className="text-red-400 text-[14px] mb-3">
            Error: {error.message}
            {error.limit && (
              <>
                {' '}
                <a href="https://github.com/Muna0/markman#quick-start" target="_blank" rel="noreferrer" className="underline font-semibold">Install the free plugin</a>
              </>
            )}
          </p>
        )}
        <div ref={bodyRef} className={`md-body ${dark ? 'text-ink-200' : 'text-ink-700'}`}>
          <Suspense fallback={<p className="whitespace-pre-wrap">{output}</p>}>
            <MarkdownBody text={output} />
          </Suspense>
        </div>
        {running && <span className="inline-block w-2 h-5 bg-blu-400 animate-pulse ml-0.5 align-middle" />}
        {done && (
          <p className={`mt-4 pt-3 border-t text-[12px] ${dark ? 'border-ink-800 text-ink-400' : 'border-ink-200 text-ink-500'}`}>
            Markman does not provide legal advice. Output is a draft and must be reviewed by a licensed attorney.
          </p>
        )}
      </div>
    </div>
  )
}
