/**
 * API client for the Markman backend server.
 * Requests go to /api (proxied to the backend in dev).
 */

const BASE = '/api'

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  return res.json()
}

export const api = {
  // Status
  status: () => get('/status'),

  // Patents
  searchPatents: (query, rows = 20, start = 0) => post('/patents/search', { query, rows, start }),
  getPatentDetails: (patentNumber) => post('/patents/details', { patentNumber }),

  // Trademarks
  searchTrademarks: (markText) => post('/trademarks/search', { markText }),

  // Export
  exportMemo: async (title, content, memoType) => {
    const res = await fetch(`${BASE}/export`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content, memoType }) })
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Export failed')
    const name = /filename="([^"]+)"/.exec(res.headers.get('content-disposition') || '')?.[1] || 'markman-memo.docx'
    const url = URL.createObjectURL(await res.blob())
    const a = Object.assign(document.createElement('a'), { href: url, download: name })
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  },

  // Claude Analysis (streaming)
  // Returns an async generator that yields text chunks.
  // Options: signal (AbortSignal to cancel the request), onDone({ stopReason, usage }) called when the stream finishes.
  analyze: async function* (query, skillType, context, { signal, onDone } = {}) {
    const res = await fetch(`${BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, skillType, context }),
      signal,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const e = new Error(err.error || 'Analysis failed')
      e.status = res.status
      e.limit = err.limit
      throw e
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.error) throw new Error(data.error)
            if (data.text) yield data.text
            if (data.done) {
              if (onDone) onDone({ stopReason: data.stop_reason || null, usage: data.usage || null })
              return
            }
          } catch (e) {
            if (e.message !== 'Unexpected end of JSON input') throw e
          }
        }
      }
    }
  },
}
