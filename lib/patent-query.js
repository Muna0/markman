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

// The Open Data Portal answers a search with no matches as HTTP 404 ("No matching records
// found"). That is an empty result, not an outage. Any other error status or body is still an error.
export function isNoMatchResponse(status, body) {
  return status === 404 && /no matching records/i.test(String(body || ""));
}

// The earliest priority date the record itself claims, from its continuity chain
// (parent, continuation, provisional) or foreign priority claims. Returns null when the
// record has none. This is the earliest claimed date only; whether a given claim is
// entitled to it (for example, new matter in a continuation-in-part) is not decided here.
function isNationalStage(p) {
  return /^(NST|371)$/i.test(String(p.claimParentageTypeCode || "")) || /national stage|\b371\b/i.test(String(p.claimParentageTypeCodeDescriptionText || ""));
}

export function earliestPriority(parents, foreign) {
  const candidates = [
    // A national-stage (371) entry's PCT parent date is the international filing date, not a
    // priority claim, so it is left out; any earlier priority the PCT claimed appears as foreign priority.
    ...(parents || []).filter((p) => !isNationalStage(p)).map((p) => ({ date: p.parentApplicationFilingDate, source: p.parentApplicationNumberText, basis: p.claimParentageTypeCode })),
    ...(foreign || []).map((f) => ({ date: f.filingDate, source: f.applicationNumberText, basis: f.ipOfficeName ? `Foreign (${f.ipOfficeName})` : "Foreign" })),
  ].filter((c) => /^\d{4}-\d{2}-\d{2}/.test(String(c.date || "")));
  if (!candidates.length) return null;
  candidates.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const { date, source, basis } = candidates[0];
  return { date: String(date).slice(0, 10), source: source || null, basis: basis || null };
}
