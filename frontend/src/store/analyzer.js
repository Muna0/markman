/**
 * Client-side IP analysis engine.
 * Processes user input with real keyword/pattern matching logic.
 * Not a substitute for Claude + MCP, but produces meaningful
 * dynamic output based on what the user actually typed.
 */

// ─── IP TYPE CLASSIFICATION ───
const IP_KEYWORDS = {
  Patent: ['patent', 'invention', 'claims', 'prior art', 'prosecution', 'provisional', 'pct', 'non-provisional', 'utility', 'design patent', 'continuation', 'divisional', 'cpc', 'ipc', 'examiner', 'office action', 'allowance', 'maintenance fee'],
  Trademark: ['trademark', 'brand', 'mark', 'logo', 'slogan', 'trade dress', 'service mark', 'likelihood of confusion', 'registration', 'tess', 'nice class', 'dupont', 'distinctiveness', 'teas'],
  'Trade Secret': ['trade secret', 'confidential', 'nda', 'non-disclosure', 'misappropriation', 'non-compete', 'proprietary', 'secret', 'dtsa', 'utsa'],
  Copyright: ['copyright', 'authorship', 'dmca', 'fair use', 'license', 'creative commons', 'work for hire', 'reproduction', 'derivative work', 'infringement'],
}

export function classifyIPType(text) {
  const lower = text.toLowerCase()
  const scores = {}
  for (const [type, keywords] of Object.entries(IP_KEYWORDS)) {
    scores[type] = keywords.filter(k => lower.includes(k)).length
  }

  // Also check for technology-related terms that suggest patent
  if (/algorithm|software|machine learning|ai |neural|model|system|method|process|device|apparatus/i.test(text)) {
    scores.Patent = (scores.Patent || 0) + 2
  }
  if (/brand name|product name|company name|naming|rebrand/i.test(text)) {
    scores.Trademark = (scores.Trademark || 0) + 2
  }
  if (/nda|partner|disclose|sharing|confidential/i.test(text)) {
    scores['Trade Secret'] = (scores['Trade Secret'] || 0) + 2
  }
  if (/code|software|content|written|publish/i.test(text)) {
    scores.Copyright = (scores.Copyright || 0) + 1
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]).filter(([, v]) => v > 0)
  if (sorted.length === 0) return { primary: 'Patent', secondary: [] }

  return {
    primary: sorted[0][0],
    secondary: sorted.slice(1).filter(([, v]) => v > 0).map(([k]) => k),
  }
}

// ─── KEY FACT EXTRACTION ───
export function extractFacts(text, ipType) {
  const facts = []
  const lower = text.toLowerCase()

  if (ipType === 'Patent' || ipType === 'Trade Secret') {
    // Try to identify what the technology/invention is
    const techMatch = text.match(/(?:developing|building|created|invented|uses?|using|built)\s+(?:a\s+)?(.{10,80}?)(?:\.|,|that|which|to\s)/i)
    if (techMatch) facts.push(`Technology/Invention: ${techMatch[1].trim()}`)

    if (lower.includes('provisional')) facts.push('Provisional application referenced')
    if (lower.includes('pct')) facts.push('PCT filing mentioned')
    if (!lower.includes('filed') && !lower.includes('application')) facts.push('No existing filing mentioned')
  }

  if (ipType === 'Trademark') {
    const markMatch = text.match(/(?:mark|brand|name|called|named)\s+(?:is\s+)?["']?([A-Z][A-Za-z0-9]+)["']?/i)
    if (markMatch) facts.push(`Proposed mark: ${markMatch[1]}`)
    if (lower.includes('class')) facts.push('Nice Classification referenced')
  }

  if (ipType === 'Trade Secret') {
    if (lower.includes('nda')) facts.push('NDA mentioned')
    if (!lower.includes('signed') && !lower.includes('executed')) facts.push('NDA may not be executed yet')
    if (lower.includes('partner') || lower.includes('third party')) facts.push('Third-party disclosure planned')
    if (lower.includes('employee')) facts.push('Employee access identified')
  }

  if (ipType === 'Copyright') {
    if (lower.includes('open source')) facts.push('Open source components identified')
    if (lower.includes('contractor') || lower.includes('freelance')) facts.push('Contractor work product: verify IP assignment')
    if (!lower.includes('registered')) facts.push('Copyright registration status unknown')
  }

  // Generic facts
  if (lower.includes('deadline') || lower.includes('urgent')) facts.push('Time-sensitive matter flagged')
  if (lower.includes('competitor')) facts.push('Competitive concern identified')
  if (lower.includes('litigation') || lower.includes('lawsuit') || lower.includes('sued')) facts.push('Litigation context detected')

  if (facts.length === 0) {
    facts.push(`Matter involves ${ipType.toLowerCase()} considerations`)
    facts.push('Additional details needed for full assessment')
  }

  return facts
}

// ─── DEADLINE DETECTION ───
export function identifyDeadlines(text, ipType) {
  const deadlines = []
  const lower = text.toLowerCase()

  if (ipType === 'Patent') {
    if (lower.includes('provisional')) {
      deadlines.push({ name: 'Provisional to Non-Provisional', date: '12 months from filing', remaining: 'Calculate from filing date', status: 'UPCOMING' })
    }
    if (lower.includes('pct')) {
      deadlines.push({ name: 'PCT National Phase Entry', date: '30 months from priority', remaining: 'Calculate from priority date', status: 'UPCOMING' })
    }
    if (lower.includes('office action') || lower.includes(' oa ')) {
      deadlines.push({ name: 'Office Action Response', date: '3 months (extendable to 6)', remaining: 'Check OA date', status: 'URGENT' })
    }
    if (lower.includes('disclose') || lower.includes('publish') || lower.includes('present')) {
      deadlines.push({ name: 'File Before Public Disclosure', date: 'Before any disclosure', remaining: 'Immediate', status: 'URGENT' })
    }
  }

  if (ipType === 'Trademark') {
    if (lower.includes('launch') || lower.includes('release')) {
      deadlines.push({ name: 'Complete Clearance Before Launch', date: 'Before product launch', remaining: 'TBD', status: 'UPCOMING' })
    }
  }

  if (ipType === 'Trade Secret') {
    if (lower.includes('meeting') || lower.includes('partner') || lower.includes('disclose')) {
      deadlines.push({ name: 'Execute NDA Before Disclosure', date: 'Before meeting/disclosure', remaining: 'Immediate', status: 'URGENT' })
    }
  }

  if (deadlines.length === 0) {
    deadlines.push({ name: 'No immediate deadlines detected', date: 'Review playbook for standard deadlines', remaining: 'N/A', status: 'OK' })
  }

  return deadlines
}

// ─── RISK ASSESSMENT ───
export function assessRisk(text, ipType, deadlines) {
  const lower = text.toLowerCase()
  let score = 0

  // Urgency signals
  if (deadlines.some(d => d.status === 'URGENT')) score += 3
  if (lower.includes('litigation') || lower.includes('lawsuit') || lower.includes('injunction')) score += 4
  if (lower.includes('urgent') || lower.includes('immediately') || lower.includes('asap')) score += 3
  if (lower.includes('competitor') || lower.includes('infringe')) score += 2
  if (lower.includes('deadline') || lower.includes('expir')) score += 2

  // Complexity signals
  if (lower.includes('international') || lower.includes('foreign')) score += 1
  if (lower.includes('multiple') || lower.includes('several')) score += 1

  // Safety signals (reduce risk)
  if (lower.includes('preliminary') || lower.includes('exploratory')) score -= 1
  if (lower.includes('routine') || lower.includes('maintenance')) score -= 2

  if (score >= 4) return { level: 'HIGH', rationale: 'Immediate action required. Potential loss of rights or active threat detected.' }
  if (score >= 2) return { level: 'MEDIUM', rationale: 'Attention needed. Deadlines or competitive concerns present but manageable with prompt action.' }
  return { level: 'LOW', rationale: 'Standard matter. No immediate deadline pressure or threat. Proceed with normal workflow.' }
}

// ─── NEXT STEPS GENERATOR ───
export function generateNextSteps(ipType, facts, risk) {
  const steps = []

  if (ipType === 'Patent') {
    steps.push('Conduct preliminary prior art search')
    if (facts.some(f => f.includes('No existing filing'))) steps.push('Consider filing a provisional patent application')
    steps.push('Prepare detailed invention disclosure')
    steps.push('Assess patentability under 35 U.S.C. 101, 102, 103')
  }

  if (ipType === 'Trademark') {
    steps.push('Run full trademark clearance search')
    steps.push('Determine appropriate Nice Classification')
    steps.push('Assess distinctiveness on the spectrum')
    steps.push('Evaluate likelihood of confusion with existing marks')
  }

  if (ipType === 'Trade Secret') {
    steps.push('Ensure NDA is executed before any disclosure')
    steps.push('Document all secrecy measures in place')
    steps.push('Identify and restrict access to confidential information')
    steps.push('Review applicable state UTSA and federal DTSA protections')
  }

  if (ipType === 'Copyright') {
    steps.push('Verify ownership chain (work-for-hire vs assignment)')
    steps.push('Audit contractor and employee IP agreements')
    steps.push('Consider copyright registration for key assets')
    steps.push('Review open source license compliance')
  }

  if (risk.level === 'HIGH') {
    steps.unshift('Escalate to senior counsel immediately')
  }

  return steps
}

// ─── FULL TRIAGE ───
export function runTriage(description) {
  const classification = classifyIPType(description)
  const facts = extractFacts(description, classification.primary)
  const deadlines = identifyDeadlines(description, classification.primary)
  const risk = assessRisk(description, classification.primary, deadlines)
  const nextSteps = generateNextSteps(classification.primary, facts, risk)

  const missing = []
  if (classification.primary === 'Patent' && !description.toLowerCase().includes('inventor')) missing.push('Inventor identification')
  if (classification.primary === 'Trademark' && !/[A-Z]{2,}/.test(description)) missing.push('Proposed mark text')
  if (classification.primary === 'Trade Secret' && !description.toLowerCase().includes('measure')) missing.push('Description of secrecy measures')
  missing.push('Relevant dates (filing, disclosure, launch)')
  missing.push('Jurisdiction(s) of interest')

  return {
    classification,
    facts,
    deadlines,
    risk: risk.level,
    rationale: risk.rationale,
    missing,
    nextSteps,
  }
}
