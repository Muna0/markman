// Builds an Open Data Portal search query from user input.
// A single patent or application number ("US11,234,567", "17/988,084", "US11234567B2")
// matches only as bare digits, so it is reduced to its digits (kind code dropped).
// Plain multi-word queries match ANY word by default, so words are joined with AND
// unless the user wrote their own query syntax.
export function toPatentQuery(query) {
  const q = String(query).trim();
  const num = /^(?:US\s*)?(\d[\d,\/]*)(?:[A-Z]\d?)?$/i.exec(q);
  if (num) {
    const digits = num[1].replace(/\D/g, "");
    if (digits.length >= 6) return digits;
  }
  if (/["():]|\b(AND|OR|NOT)\b/.test(q)) return q;
  return q.split(/\s+/).join(" AND ");
}
