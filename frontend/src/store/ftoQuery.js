// Builds USPTO search queries for a freedom-to-operate search from a plain-English
// technology description. Picks 2 to 4 distinctive terms, then offers a ladder of
// queries from narrow to broad: all terms AND-joined, the terms in two OR groups,
// and finally any of the terms.

const STOP = new Set(`
a an and are as at be been being but by can could do does for from had has have how if in into is it its
of on or our over per so such than that the their them then there these they this those through to under
up upon via was we were what when where which while who will with within without would your you
about above after also among across along any based both each either every few more most much other
same some very just only well
app apps application applications mobile device devices system systems method methods apparatus
product products platform platforms service services tool tools solution solutions software user users
using use uses used utilize utilizes utilizing make makes making provide provides providing allow allows
allowing enable enables enabling include includes including configured feature features thing things
recommend recommends recommending recommended generate generates generating create creates creating
help helps helping support supports supporting process processes processing manage manages managing
offer offers offering run runs running work works working new novel improved custom key
`.split(/\s+/).filter(Boolean))

function singular(w) {
  if (/ies$/.test(w) && w.length > 4) return w.slice(0, -3) + 'y'
  if (/(ss|us|is|ous)$/.test(w)) return w
  if (/s$/.test(w) && w.length > 4) return w.slice(0, -1)
  return w
}

export function ftoKeyTerms(description, max = 4) {
  const seen = new Set()
  const terms = []
  for (const raw of String(description || '').toLowerCase().split(/[^a-z0-9]+/)) {
    if (raw.length < 4 || /^\d+$/.test(raw) || STOP.has(raw)) continue
    const w = singular(raw)
    if (STOP.has(w) || seen.has(w)) continue
    seen.add(w)
    terms.push(w)
    if (terms.length === max) break
  }
  return terms
}

export function ftoSearchQueries(description) {
  const t = ftoKeyTerms(description)
  if (t.length === 0) return []
  if (t.length === 1) return [t[0]]
  const and = t.join(' AND ')
  const or = t.join(' OR ')
  if (t.length === 2) return [and, or]
  const grouped = t.length === 3
    ? `(${t[0]} OR ${t[1]}) AND ${t[2]}`
    : `(${t[0]} OR ${t[1]}) AND (${t[2]} OR ${t[3]})`
  return [and, grouped, or]
}
