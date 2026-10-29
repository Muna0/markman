// Spellings of a proposed mark worth typing into each trademark office's search.
// These are search aids only: plain strings, never scored or presented as conflicts.
// The generator is deliberately conservative: spacing and compound forms,
// plural/singular of the last word, and a short list of common sound-alike spellings.

// Whole-word swaps people commonly use in brand names (both directions)
const WORD_SWAPS = [
  ['LIGHT', 'LITE'], ['NIGHT', 'NITE'], ['RIGHT', 'RITE'], ['YOU', 'U'], ['FOR', '4'],
  ['TO', '2'], ['AND', '&'], ['EXPRESS', 'XPRESS'], ['QUICK', 'KWIK'], ['CLEAN', 'KLEEN'],
  ['THRU', 'THROUGH'], ['KRAFT', 'CRAFT'], ['KOOL', 'COOL'],
]

// Letter-level sound-alikes, applied once per word
const LETTER_SWAPS = [
  [/^PH/, 'F'], [/^F(?=[AEIOU])/, 'PH'], [/CK/, 'K'], [/^C(?=[AOU])/, 'K'], [/^K(?=[AOU])/, 'C'],
  [/QU/, 'KW'], [/X$/, 'KS'],
]

function pluralForms(word) {
  if (word.length < 3 || !/^[A-Z]+$/.test(word)) return []
  if (word.endsWith('SS')) return [`${word}ES`]
  if (word.endsWith('S')) return [word.slice(0, -1)]
  return [`${word}S`]
}

function soundAlikes(word) {
  const out = []
  for (const [a, b] of WORD_SWAPS) {
    if (word === a) out.push(b)
    else if (word === b) out.push(a)
  }
  for (const [re, to] of LETTER_SWAPS) {
    if (re.test(word)) out.push(word.replace(re, to))
  }
  return out
}

export function searchVariants(mark, max = 10) {
  const m = String(mark || '').toUpperCase().replace(/\s+/g, ' ').trim()
  if (!m) return []
  const words = m.split(' ')
  const out = []
  const add = (v) => { if (v && v !== m && !out.includes(v)) out.push(v) }

  // Spacing and compound forms
  if (words.length > 1) {
    add(words.join(''))
    add(words.join('-'))
  } else if (m.includes('-')) {
    add(m.replace(/-/g, ''))
    add(m.replace(/-/g, ' '))
  }

  // Plural/singular of the last word
  const last = words.length - 1
  for (const p of pluralForms(words[last])) add([...words.slice(0, last), p].join(' '))

  // Common sound-alike spellings of each word
  words.forEach((w, i) => {
    for (const s of soundAlikes(w)) add([...words.slice(0, i), s, ...words.slice(i + 1)].join(' '))
  })

  return out.slice(0, max)
}
