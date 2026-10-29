import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../store/ThemeContext'
import { api } from '../store/api'
import { Sparkles, Loader2, Download, FileText, RefreshCw } from 'lucide-react'

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
    // Create a clean document for print-to-PDF
    const content = output.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const draftLabel = '<div style="text-align:center;font-size:10pt;color:#666;border-bottom:1px solid #ccc;padding-bottom:12px;margin-bottom:24px">DRAFT FOR ATTORNEY REVIEW</div>'
    const html = `<!DOCTYPE html><html><head><title>Markman ${skillType} Analysis</title><style>body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.6;max-width:8.5in;margin:1in auto;color:#111}pre{white-space:pre-wrap;font-family:'Times New Roman',serif;font-size:12pt}.disclaimer{font-style:italic;color:#666;font-size:9pt;border-top:1px solid #ccc;padding-top:12px;margin-top:36px}</style></head><body>${draftLabel}<pre>${content}</pre><div class="disclaimer">Draft for attorney review. Markman does not provide legal advice. This draft was prepared with AI assistance and must be reviewed by a licensed attorney. Verify all citations and conclusions before reliance.</div></body></html>`
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
        <pre className={`text-[15px] leading-[1.8] whitespace-pre-wrap font-sans ${dark ? 'text-ink-200' : 'text-ink-700'}`}>
          {output}
          {running && <span className="inline-block w-2 h-5 bg-blu-400 animate-pulse ml-0.5" />}
        </pre>
        {done && (
          <p className={`mt-4 pt-3 border-t text-[12px] ${dark ? 'border-ink-800 text-ink-400' : 'border-ink-200 text-ink-500'}`}>
            Markman does not provide legal advice. Output is a draft and must be reviewed by a licensed attorney.
          </p>
        )}
      </div>
    </div>
  )
}
