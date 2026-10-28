const KEY = 'markman-history'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }

export const localHistory = {
  list: read,
  logMatter(type, title, summary = '', risk = 'UNKNOWN', input = '') {
    const entry = { id: `m-${Date.now()}`, type, title, summary, risk, input, timestamp: new Date().toISOString() }
    localStorage.setItem(KEY, JSON.stringify([entry, ...read()].slice(0, 100)))
  },
  clear: () => localStorage.removeItem(KEY),
}
