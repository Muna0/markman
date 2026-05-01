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
  searchPatents: (query, rows = 20) => post('/patents/search', { query, rows }),
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
}
