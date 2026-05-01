import { useState, useRef } from 'react'
import { useTheme } from '../store/ThemeContext'
import {
  FolderOpen, Upload, Download, Trash2, FileText, File, FileType, Search,
  ChevronDown, Plus, X, Eye, Clock,
} from 'lucide-react'

function getFileIcon(name) {
  if (name.endsWith('.pdf')) return <FileType className="w-4 h-4 text-red-400" />
  if (name.endsWith('.md')) return <FileText className="w-4 h-4 text-blu-400" />
  if (name.endsWith('.doc') || name.endsWith('.docx')) return <FileText className="w-4 h-4 text-blu-300" />
  return <File className="w-4 h-4 text-ink-400" />
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

export default function Files() {
  const { dark } = useTheme()
  const fileInput = useRef(null)
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem('markman-files')
    return saved ? JSON.parse(saved) : []
  })
  const [search, setSearch] = useState('')
  const [preview, setPreview] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  function saveFiles(next) {
    setFiles(next)
    localStorage.setItem('markman-files', JSON.stringify(next))
  }

  function handleUpload(inputFiles) {
    const fileList = Array.from(inputFiles)
    const allowed = ['.pdf', '.md', '.doc', '.docx', '.txt', '.csv', '.json']

    fileList.forEach(file => {
      const ext = '.' + file.name.split('.').pop().toLowerCase()
      if (!allowed.includes(ext)) return

      const reader = new FileReader()
      reader.onload = (e) => {
        const newFile = {
          id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          size: file.size,
          type: file.type || ext,
          uploadedAt: new Date().toISOString(),
          content: ext === '.md' || ext === '.txt' || ext === '.json' || ext === '.csv'
            ? e.target.result
            : null,
          dataUrl: ext === '.pdf' ? e.target.result : null,
        }
        saveFiles(prev => [newFile, ...prev])
      }
      if (ext === '.md' || ext === '.txt' || ext === '.json' || ext === '.csv') {
        reader.readAsText(file)
      } else {
        reader.readAsDataURL(file)
      }
    })
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files)
  }

  function deleteFile(id) {
    saveFiles(prev => prev.filter(f => f.id !== id))
    if (preview?.id === id) setPreview(null)
  }

  function downloadFile(file) {
    if (file.content) {
      const blob = new Blob([file.content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = file.name; a.click()
      URL.revokeObjectURL(url)
    } else if (file.dataUrl) {
      const a = document.createElement('a')
      a.href = file.dataUrl; a.download = file.name; a.click()
    }
  }

  function exportAnalysis(name, content) {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = name; a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${dark ? 'bg-ink-800' : 'bg-ink-100'}`}>
            <FolderOpen className={`w-5 h-5 ${dark ? 'text-ink-300' : 'text-ink-600'}`} />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-ink-950'}`}>Files</h1>
            <p className={`text-[13px] ${dark ? 'text-ink-400' : 'text-ink-500'}`}>Upload documents for skill context. Download analysis outputs.</p>
          </div>
        </div>
        <button
          onClick={() => fileInput.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-[10px] bg-blu-500 text-white text-[13px] font-semibold btn-shadow hover:bg-blu-400 transition"
        >
          <Plus className="w-3.5 h-3.5" /> Upload
        </button>
        <input
          ref={fileInput}
          type="file"
          multiple
          accept=".pdf,.md,.doc,.docx,.txt,.csv,.json"
          className="hidden"
          onChange={e => { handleUpload(e.target.files); e.target.value = '' }}
        />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-8 text-center mb-6 transition-colors ${
          dragOver
            ? dark ? 'border-blu-400 bg-blu-500/5' : 'border-blu-400 bg-blu-50'
            : dark ? 'border-ink-700 hover:border-ink-600' : 'border-ink-200 hover:border-ink-300'
        }`}
      >
        <Upload className={`w-8 h-8 mx-auto mb-3 ${dragOver ? 'text-blu-400' : 'text-ink-500'}`} />
        <p className={`text-[13px] font-medium mb-1 ${dark ? 'text-ink-200' : 'text-ink-700'}`}>
          Drop files here or click Upload
        </p>
        <p className="text-[11px] text-ink-500">
          Supports .pdf, .md, .doc, .docx, .txt, .csv, .json
        </p>
      </div>

      {/* Search & export */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex-1 flex items-center gap-2 rounded-lg px-3 py-2 ${dark ? 'bg-ink-800/60' : 'bg-ink-100'}`}>
          <Search className="w-3.5 h-3.5 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search files..."
            className={`bg-transparent text-[13px] w-full focus:outline-none placeholder:text-ink-500 ${dark ? 'text-ink-200' : 'text-ink-700'}`}
          />
        </div>
        <button
          onClick={() => exportAnalysis('markman-sample-playbook.md', '# Markman Playbook\n\nCustomize this file with your firm\'s IP practice standards.\n\n## FTO Risk Thresholds\n\n**HIGH RISK**\n- One or more unexpired patent claims read directly on the technology\n\n**MEDIUM RISK**\n- Reasonable non-infringement arguments exist\n\n**LOW RISK**\n- Strong non-infringement arguments\n')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium border transition ${dark ? 'border-ink-700 text-ink-300 hover:border-ink-500' : 'border-ink-200 text-ink-600 hover:border-ink-400'}`}
        >
          <Download className="w-3 h-3" /> Export Sample Playbook
        </button>
      </div>

      {/* File list */}
      <div className={`rounded-xl border ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <FolderOpen className="w-8 h-8 mx-auto mb-3 text-ink-500 opacity-50" />
            <p className={`text-[13px] mb-1 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>
              {files.length === 0 ? 'No files uploaded yet' : 'No files match your search'}
            </p>
            <p className="text-[11px] text-ink-500">
              Upload invention disclosures, claim drafts, NDAs, or playbook files
            </p>
          </div>
        ) : (
          <div className={`divide-y ${dark ? 'divide-ink-800' : 'divide-ink-100'}`}>
            {filtered.map(f => (
              <div key={f.id} className={`px-5 py-3.5 flex items-center justify-between group ${dark ? 'hover:bg-ink-800/30' : 'hover:bg-ink-50'} transition-colors`}>
                <div className="flex items-center gap-3 min-w-0">
                  {getFileIcon(f.name)}
                  <div className="min-w-0">
                    <p className={`text-[13px] font-medium truncate ${dark ? 'text-ink-100' : 'text-ink-800'}`}>{f.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-ink-500 mono">{formatSize(f.size)}</span>
                      <span className="text-ink-600">&middot;</span>
                      <span className="text-[10px] text-ink-500 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(f.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {f.content && (
                    <button onClick={() => setPreview(f)} className={`p-1.5 rounded transition ${dark ? 'hover:bg-ink-700' : 'hover:bg-ink-200'}`} title="Preview">
                      <Eye className="w-3.5 h-3.5 text-ink-400" />
                    </button>
                  )}
                  <button onClick={() => downloadFile(f)} className={`p-1.5 rounded transition ${dark ? 'hover:bg-ink-700' : 'hover:bg-ink-200'}`} title="Download">
                    <Download className="w-3.5 h-3.5 text-ink-400" />
                  </button>
                  <button onClick={() => deleteFile(f.id)} className={`p-1.5 rounded transition ${dark ? 'hover:bg-red-950' : 'hover:bg-red-50'}`} title="Delete">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60" onClick={() => setPreview(null)}>
          <div className={`w-full max-w-2xl max-h-[80vh] rounded-2xl border overflow-hidden ${dark ? 'bg-ink-900 border-ink-700' : 'bg-white border-ink-200'}`} onClick={e => e.stopPropagation()}>
            <div className={`flex items-center justify-between px-5 py-3 border-b ${dark ? 'border-ink-800' : 'border-ink-200'}`}>
              <div className="flex items-center gap-2">
                {getFileIcon(preview.name)}
                <span className={`text-[13px] font-semibold ${dark ? 'text-white' : 'text-ink-950'}`}>{preview.name}</span>
              </div>
              <button onClick={() => setPreview(null)} className={`p-1 rounded transition ${dark ? 'hover:bg-ink-800' : 'hover:bg-ink-100'}`}>
                <X className="w-4 h-4 text-ink-400" />
              </button>
            </div>
            <pre className={`p-5 text-[12px] mono leading-relaxed overflow-auto max-h-[60vh] whitespace-pre-wrap ${dark ? 'text-ink-200' : 'text-ink-700'}`}>
              {preview.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
