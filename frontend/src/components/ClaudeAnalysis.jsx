import { useState } from 'react'
import { useTheme } from '../store/ThemeContext'
import { api } from '../store/api'
import { Sparkles, Loader2, Download, FileText, RefreshCw } from 'lucide-react'

/**
 * ClaudeAnalysis — streams a real Claude analysis using Markman skills.
 *
 * Model: Claude Opus 4.6 (claude-sonnet-4-20250514)
 *
 * Props:
 *   query: string — what to analyze
 *   skillType: 'patent' | 'trademark' | 'fto' | 'intake'
 *   context?: string — additional context
 *   onComplete?: (text) => void — callback when done
 */
export default function ClaudeAnalysis({ query, skillType, context, onComplete }) {
  const { dark } = useTheme()
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [exporting, setExporting] = useState(false)

  async function run() {
    setRunning(true)
    setOutput('')
    setError('')
    setDone(false)

    try {
      let fullText = ''
      for await (const chunk of api.analyze(query, skillType, context)) {
        fullText += chunk
        setOutput(fullText)
      }
      setDone(true)
      if (onComplete) onComplete(fullText)
    } catch (err) {
      setError(err.message)
    }
    setRunning(false)
  }

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
      const result = await api.exportMemo(title, output, skillType === 'fto' ? 'FTO' : skillType)
      if (result.downloadUrl) {
        window.open(`http://localhost:3001${result.downloadUrl}`, '_blank')
      } else if (result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    }
    setExporting(false)
  }

  function downloadPDF() {
    // Create a clean document for print-to-PDF
    const content = output.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const privilege = skillType === 'fto' ? '<div style="text-align:center;font-size:10pt;color:#666;border-bottom:1px solid #ccc;padding-bottom:12px;margin-bottom:24px">ATTORNEY WORK PRODUCT / PRIVILEGED AND CONFIDENTIAL</div>' : ''
    const html = `<!DOCTYPE html><html><head><title>Markman ${skillType} Analysis</title><style>body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.6;max-width:8.5in;margin:1in auto;color:#111}pre{white-space:pre-wrap;font-family:'Times New Roman',serif;font-size:12pt}.disclaimer{font-style:italic;color:#666;font-size:9pt;border-top:1px solid #ccc;padding-top:12px;margin-top:36px}</style></head><body>${privilege}<pre>${content}</pre><div class="disclaimer">This analysis was generated with AI assistance (Claude Opus 4.6) and does not constitute legal advice. All citations and conclusions should be verified by licensed counsel.</div></body></html>`
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
      <button onClick={run}
        className={`flex items-center gap-2 px-5 py-3 rounded-lg mono text-[14px] font-bold transition ${
          dark ? 'bg-blu-500/15 text-blu-400 hover:bg-blu-500/25 border border-blu-500/20' : 'bg-blu-50 text-blu-500 hover:bg-blu-100 border border-blu-200'
        }`}>
        <Sparkles className="w-4 h-4" />
        Run Claude Analysis
      </button>
    )
  }

  return (
    <div className={`rounded-xl border overflow-hidden ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-3 border-b ${dark ? 'border-ink-800 bg-ink-800/30' : 'border-ink-200 bg-ink-50'}`}>
        <div className="flex items-center gap-2">
          <Sparkles className={`w-4 h-4 ${running ? 'animate-pulse' : ''} ${dark ? 'text-blu-400' : 'text-blu-500'}`} />
          <span className={`mono text-[13px] font-bold ${dark ? 'text-ink-200' : 'text-ink-700'}`}>
            Claude Opus 4.6 {running ? '— streaming...' : done ? '— complete' : ''}
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
              <button onClick={run}
                className={`flex items-center gap-1 mono text-[11px] px-2.5 py-1.5 rounded transition ${dark ? 'text-ink-400 hover:text-ink-200 hover:bg-ink-700' : 'text-ink-500 hover:text-ink-700 hover:bg-ink-100'}`}>
                <RefreshCw className="w-3 h-3" /> Re-run
              </button>
            </>
          )}
          {running && <Loader2 className="w-3.5 h-3.5 animate-spin text-blu-400" />}
        </div>
      </div>

      {/* Output */}
      <div className="p-5 max-h-[700px] overflow-y-auto">
        {error && (
          <p className="text-red-400 text-[14px] mb-3">Error: {error}</p>
        )}
        <pre className={`text-[15px] leading-[1.8] whitespace-pre-wrap font-sans ${dark ? 'text-ink-200' : 'text-ink-700'}`}>
          {output}
          {running && <span className="inline-block w-2 h-5 bg-blu-400 animate-pulse ml-0.5" />}
        </pre>
      </div>
    </div>
  )
}
