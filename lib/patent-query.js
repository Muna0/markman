// A single patent or application number ("US11,234,567", "17/988,084", "US11234567B2")
// reduced to its digits (kind code dropped), or null if the query is anything else.
export function numberQueryDigits(query) {
  const num = /^(?:US\s*)?(\d[\d,\/]*)(?:[A-Z]\d?)?$/i.exec(String(query).trim());
  if (!num) return null;
  const digits = num[1].replace(/\D/g, "");
  return digits.length >= 6 ? digits : null;
}

// Builds an Open Data Portal search query from user input.
// A single patent or application number matches only as bare digits.
// Plain multi-word queries match ANY word by default, so words are joined with AND
// unless the user wrote their own query syntax.
export function toPatentQuery(query) {
  const q = String(query).trim();
  const digits = numberQueryDigits(q);
  if (digits) return digits;
  if (/["():]|\b(AND|OR|NOT)\b/.test(q)) return q;
  return q.split(/\s+/).join(" AND ");
}

// For a number-only search, keep only results whose patent or application number is
// an exact match, when at least one is. Otherwise return the results unchanged.
export function exactNumberMatches(results, digits) {
  if (!digits) return results;
  const bare = (v) => String(v || "").replace(/\D/g, "");
  const exact = results.filter((r) => bare(r.patentNumber) === digits || bare(r.applicationNumber) === digits);
  return exact.length ? exact : results;
}
