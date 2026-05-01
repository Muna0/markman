/**
 * API client for the Markman backend server.
 * Backend runs on port 3001, frontend on 5173.
 */

const BASE = 'http://localhost:3001/api'

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

async function del(path) {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE' })
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
  getTrademarkStatus: (serialNumber) => post('/trademarks/status', { serialNumber }),

  // Deadlines
  listDeadlines: () => get('/deadlines'),
  addDeadline: (matter, deadline, date, risk, notes) => post('/deadlines', { matter, deadline, date, risk, notes }),
  removeDeadline: (id) => del(`/deadlines/${id}`),

  // History
  searchHistory: (q, type) => get(`/history?${new URLSearchParams({ ...(q && { q }), ...(type && { type }) })}`),
  logMatter: (type, title, summary, risk, input) => post('/history', { type, title, summary, risk, input }),

  // Export
  exportMemo: (title, content, memoType) => post('/export', { title, content, memoType }),

  // Claude Analysis (streaming)
  // Returns an async generator that yields text chunks
  analyze: async function* (query, skillType, context) {
    const res = await fetch(`${BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, skillType, context }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Analysis failed')
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
            if (data.done) return
          } catch (e) {
            if (e.message !== 'Unexpected end of JSON input') throw e
          }
        }
      }
    }
  },
}
