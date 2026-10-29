import { useState } from 'react'
import { useTheme } from '../store/ThemeContext'
import {
  BookOpen, Terminal, Server, Layers, ArrowUpRight,
  FlaskConical, Stamp, ShieldCheck, FileSearch, Zap, Clock, Shield,
} from 'lucide-react'

const sections = [
  { id: 'why', label: 'Why Markman' },
  { id: 'how-claude', label: 'How It Works with Claude' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'skills', label: 'Skills (4)' },
  { id: 'commands', label: 'Commands (6)' },
  { id: 'mcp-tools', label: 'MCP Tools (12)' },
  { id: 'playbook', label: 'Playbook Config' },
  { id: 'apis', label: 'APIs & Testing' },
  { id: 'install', label: 'Installation' },
  { id: 'glossary', label: 'IP Glossary' },
]

function Code({ children, dark }) {
  return <code className={`px-2 py-0.5 rounded text-[14px] mono ${dark ? 'bg-ink-800 text-ink-200' : 'bg-ink-100 text-ink-700'}`}>{children}</code>
}

function Block({ dark, children }) {
  return <pre className={`rounded-[14px] p-5 text-[14px] mono leading-[1.8] overflow-x-auto bg-ink-950 text-ink-300 border border-white/10`}>{children}</pre>
}

function H2({ dark, id, children }) {
  return <h2 id={id} className={`text-[30px] font-bold tracking-[-0.02em] mb-5 mt-16 first:mt-0 scroll-mt-20 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>{children}</h2>
}

function H3({ dark, children }) {
  return <h3 className={`text-[22px] font-bold mt-10 mb-4 ${dark ? 'text-ink-100' : 'text-ink-800'}`}>{children}</h3>
}

function P({ dark, children }) {
  return <p className={`text-[16px] leading-[1.8] mb-5 ${dark ? 'text-ink-300' : 'text-ink-500'}`}>{children}</p>
}

function Table({ dark, headers, rows }) {
  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full text-[14px]">
        <thead><tr className={`border-b ${dark ? 'border-ink-700' : 'border-ink-200'}`}>
          {headers.map(h => <th key={h} className={`text-left py-3 pr-4 font-semibold ${dark ? 'text-ink-300' : 'text-ink-600'}`}>{h}</th>)}
        </tr></thead>
        <tbody>{rows.map((row, i) => (
          <tr key={i} className={`border-b last:border-0 ${dark ? 'border-white/10' : 'border-ink-100'}`}>
            {row.map((cell, j) => <td key={j} className={`py-3 pr-4 ${j === 0 ? 'font-semibold mono' : ''} ${dark ? 'text-ink-200' : 'text-ink-700'}`}>{cell}</td>)}
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}

export default function Docs() {
  const { dark } = useTheme()
  const [activeSection, setActiveSection] = useState('why')

  return (
    <div className="flex">
      {/* Sidebar TOC */}
      <aside className={`hidden lg:block w-[200px] shrink-0 sticky top-[52px] h-[calc(100vh-52px)] overflow-y-auto p-4 border-r ${dark ? 'border-white/10' : 'border-ink-200'}`}>
        <p className={`text-[15px] font-semibold uppercase tracking-[0.12em] px-2 mb-2 ${dark ? 'text-ink-500' : 'text-ink-400'}`}>Documentation</p>
        <nav className="space-y-0.5">
          {sections.map(s => (
            <a key={s.id} href={`#${s.id}`} onClick={() => setActiveSection(s.id)}
              className={`block px-2 py-1.5 rounded-lg text-[14px] font-medium transition ${
                activeSection === s.id
                  ? dark ? 'bg-blu-500/10 text-blu-400' : 'bg-blu-50 text-blu-600'
                  : dark ? 'text-ink-400 hover:text-ink-200' : 'text-ink-500 hover:text-ink-800'
              }`}>{s.label}</a>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0 p-6 lg:p-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${dark ? 'bg-ink-800' : 'bg-ink-100'}`}>
            <BookOpen className={`w-5 h-5 ${dark ? 'text-ink-300' : 'text-ink-600'}`} />
          </div>
          <div>
            <h1 className={`text-[28px] tracking-[-0.02em] font-bold ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Documentation</h1>
            <p className={`text-[15px] ${dark ? 'text-ink-400' : 'text-ink-500'}`}>Why Markman exists, how it works, and how to use it</p>
          </div>
        </div>

        {/* ── WHY MARKMAN ── */}
        <H2 dark={dark} id="why">Why Markman Exists</H2>
        <P dark={dark}>
          Much of IP research follows the same steps: searching USPTO Trademark Search for conflicting marks, parsing patent claims into a dependency tree, mapping claim limitations against a product for FTO, and classifying incoming matters by type and deadline. That work is often spread across browser tabs, Word documents, and spreadsheets, separate from the data sources.
        </P>
        <P dark={dark}>
          Markman is a free, open-source <strong>Claude Code plugin</strong> that brings structured IP workflows into the terminal or editor. You describe what you need in natural language and Markman drafts structured analysis for attorney review, using USPTO patent data through MCP servers (WIPO support is experimental and requires WIPO API credentials). Markman does not provide legal advice. Output is a draft and must be reviewed by a licensed attorney.
        </P>

        <div className={`rounded-[14px] border p-6 mb-6 ${dark ? 'bg-ink-800/30 border-ink-700/40' : 'bg-ink-50 border-ink-200'}`}>
          <p className={`text-[17px] font-semibold mb-4 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>What Markman offers:</p>
          <div className="space-y-3">
            {[
              'Runs inside Claude Code, with no separate login',
              'Skills can activate automatically when you discuss IP matters in conversation',
              'Uses the USPTO API for patent data; WIPO support is experimental, requires WIPO API credentials, and is not available on the public demo',
              'Drafts are structured for attorney review, with citations to check and a limitations section',
              'Fully configurable playbook to match your firm\'s specific thresholds and standards',
              'Open source (Apache 2.0) so you can inspect every line, self host, and modify freely',
              'The USPTO API key is free',
            ].map(item => (
              <div key={item} className="flex items-start gap-3">
                <Zap className={`w-4 h-4 mt-1 shrink-0 ${dark ? 'text-grn-400' : 'text-grn-500'}`} />
                <span className={`text-[16px] leading-[1.6] ${dark ? 'text-ink-200' : 'text-ink-600'}`}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS WITH CLAUDE ── */}
        <H2 dark={dark} id="how-claude">How It Works with Claude</H2>
        <P dark={dark}>
          Markman is a <strong>Claude Code plugin</strong>. It does not run as a standalone app. It extends Claude Code with IP-specific capabilities. Here is the flow from your prompt to a structured draft:
        </P>

        <H3 dark={dark}>Step 1: You talk to Claude normally</H3>
        <P dark={dark}>
          Open Claude Code in your terminal or IDE. Start a conversation about any IP topic: a patent you need to analyze, a trademark you want to clear, a technology you need FTO on. You do not need to use any special syntax.
        </P>
        <Block dark={dark}>{`$ claude

You: I need to check if our new ML recommendation engine
infringes any existing patents. It uses a transformer model
with multi-modal embeddings and a vector database for
similarity search.`}</Block>

        <H3 dark={dark}>Step 2: Skills can activate automatically</H3>
        <P dark={dark}>
          Claude Code can match your message to a skill based on the skill's description. Here, an FTO question can activate the <Code dark={dark}>fto-memo</Code> skill. You can also ask for a skill by name or run <Code dark={dark}>/fto-analysis</Code>. The skill's definition file tells Claude how to structure its analysis: what steps to follow, what format to output, what risk thresholds to use.
        </P>
        <div className={`rounded-[14px] border p-4 mb-4 ${dark ? 'bg-ink-800/30 border-ink-700/40' : 'bg-ink-50 border-ink-200'}`}>
          <p className={`text-[15px] font-semibold uppercase tracking-wider mb-2 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>What happens behind the scenes</p>
          <div className="space-y-2">
            {[
              'Claude reads the fto-memo skill definition (skills/fto-memo/SKILL.md)',
              'Claude reads the playbook (playbooks/ip-playbook.md) for your firm\'s risk thresholds',
              'Claude calls the USPTO MCP server → search_patents tool to find candidate patents',
              'If WIPO credentials are configured, Claude may also call the experimental WIPO server → search_international_patents',
              'Claude asks you to paste the claims of the patents worth mapping (the USPTO API does not return claim text)',
              'Claude maps each claim limitation against your technology description',
              'Claude drafts a structured FTO analysis for attorney review, with a preliminary risk rating, possible non-infringement positions, and design-around ideas',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`text-[15px] font-bold mono w-4 shrink-0 mt-0.5 ${dark ? 'text-blu-400' : 'text-blu-500'}`}>{i + 1}.</span>
                <span className={`text-[14px] ${dark ? 'text-ink-200' : 'text-ink-600'}`}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        <H3 dark={dark}>Step 3: MCP servers fetch patent data</H3>
        <P dark={dark}>
          When Claude needs patent data or a trademark status record, it calls the MCP servers. These are Node.js processes that run locally on your machine and connect to the USPTO API (and WIPO, if you have WIPO credentials) with the keys in your shell environment. Claude does not make the API calls directly. The MCP protocol handles this separation.
        </P>
        <Block dark={dark}>{`Claude ──► MCP server (local) ──► USPTO
              • client-side request limit     api.uspto.gov (Open Data Portal)
              • retry with backoff            tsdrapi.uspto.gov (TSDR)
              • response parsing
Claude ◄── structured JSON ◄──────┘`}</Block>

        <H3 dark={dark}>Step 4: You review a structured draft</H3>
        <P dark={dark}>
          Claude responds with a structured draft that follows your playbook settings: risk thresholds, citation format, and deadline rules. The draft is a starting point for attorney review, not a finished opinion. You decide how to label and protect your own work product.
        </P>
        <Block dark={dark}>{`Claude: Here is a draft FTO analysis for your review:

DRAFT FOR ATTORNEY REVIEW

EXECUTIVE SUMMARY
Overall Risk: MEDIUM
Two patents identified with claims potentially reading
on the technology...

RELEVANT PATENTS
┌──────────────────┬───────────┬────────┬──────────┐
│ Patent           │ Assignee  │ Risk   │ Expires  │
├──────────────────┼───────────┼────────┼──────────┤
│ US X,XXX,XXX     │ Company A │ MEDIUM │ 20XX-XX  │
│ US Y,YYY,YYY     │ Company B │ LOW    │ 20XX-XX  │
└──────────────────┴───────────┴────────┴──────────┘

CLAIM-BY-CLAIM ANALYSIS
US X,XXX,XXX Claim 1:
  "recurrent neural network" → DOES NOT MEET
    (Our system uses transformer, not RNN)
  "remote server" → DOES NOT MEET
    (Our system runs on-device)
...`}</Block>

        <H3 dark={dark}>Or use slash commands directly</H3>
        <P dark={dark}>
          If you know exactly what you want, skip the natural language and use a slash command. These are explicit invocations that run a specific workflow:
        </P>
        <Block dark={dark}>{`You: /review-claims US X,XXX,XXX

Claude: Retrieving the USPTO record...
[calls get_patent_details via MCP]
Found US X,XXX,XXX (application XX/XXX,XXX), filed 20XX-XX-XX.
The USPTO API does not return claim text. Please paste the claims.

You: [pastes claims]

PATENT ANALYSIS: US X,XXX,XXX
Filing Date: 20XX-XX-XX

CLAIM MAP
Claim 1 (Independent, Method)    Process
Claim 2 (Dependent → 1)         Process
Claim 5 (Independent, System)   Machine
...

You: /tm-clearance NEXAFLOW | AI workflow software | US, EU, UK

Claude: USPTO has no trademark text search API.
Search NEXAFLOW at tmsearch.uspto.gov and paste any
similar marks you find. Drafting the screen now...

DRAFT TRADEMARK SCREEN: NEXAFLOW
Distinctiveness: likely suggestive
Phonetic variants to search: NEXFLOW, NEXA FLOW, NEKSAFLOW
Relevant DuPont factors: assessed against marks you provide
...`}</Block>

        <H3 dark={dark}>How the pieces fit</H3>
        <P dark={dark}>
          The skills are structured prompts. The MCP servers are data pipes. The playbook is configuration. Claude does the drafting, Markman provides the structure and the data, and the attorney reviews and decides. That is why it is a plugin, not a separate product.
        </P>

        {/* ── ARCHITECTURE ── */}
        <H2 dark={dark} id="architecture">Architecture</H2>
        <P dark={dark}>
          Markman is a Claude Code plugin with three layers: skills (can activate automatically), commands (on demand), and MCP servers (data access and local storage). The playbook configures how skills and commands behave.
        </P>
        <Block dark={dark}>{`Claude Code
├── Skills (4)      skills/<name>/SKILL.md     can activate automatically
├── Commands (6)    commands/*.md              /command invocation
├── Playbook        playbooks/ip-playbook.md   thresholds and standards
└── MCP servers (3, run locally from mcp/dist/)
    ├── uspto           4 tools ──► api.uspto.gov (Open Data Portal)
    │                           ──► tsdrapi.uspto.gov (TSDR)
    ├── wipo            2 tools ──► wipocase.wipo.int, patentscope.wipo.int
    │                               (experimental; WIPO credentials required)
    └── markman-store   6 tools ──► ~/.markman/data/ (local files)`}</Block>

        <Table dark={dark}
          headers={['Layer', 'Files', 'Trigger']}
          rows={[
            ['Skills (4)', 'skills/<name>/SKILL.md', 'Can activate automatically when a request matches the skill description'],
            ['Commands (6)', 'commands/*.md', 'Run when the user types /command'],
            ['MCP Servers (3)', 'mcp/*.js, bundled in mcp/dist/', 'Called by Claude when live data, deadlines, history, or export are needed'],
            ['Playbook (1)', 'playbooks/ip-playbook.md', 'Referenced by all skills for thresholds and standards'],
          ]}
        />

        {/* ── SKILLS ── */}
        <H2 dark={dark} id="skills">Skills Reference</H2>
        <P dark={dark}>Skills can activate automatically when Claude matches your request to a skill's description. Each follows a structured multi-step workflow.</P>

        {[
          { name: 'patent-analysis', trigger: 'Patent review, claim comparison, patentability', steps: ['Parse claims → classify independent/dependent → map dependency chain', 'Assess scope per limitation → flag breadth issues, means-plus-function, §112(b)', 'Compare across patents → element mapping, double patenting risk', 'Surface prior art red flags → KSR obviousness, Alice/Mayo §101', 'Output: claim map, scope assessment, risks, recommendations'] },
          { name: 'trademark-screen', trigger: 'Trademark search, clearance, brand naming', steps: ['Characterize mark type and distinctiveness → identify Nice classes', 'Point to USPTO Trademark Search for the knockout search → flag same-class conflicts in marks you provide', 'Generate phonetic variants to search → compare appearance, sound, connotation, and commercial impression', 'Assess the relevant DuPont factors per conflict (not every factor applies in every case) → LOW / MEDIUM / HIGH', 'Map jurisdiction coverage → flag first-to-file vs first-to-use gaps', 'Output: draft screen with a preliminary conflict risk rating (LOW / MEDIUM / HIGH) per jurisdiction, for attorney review'] },
          { name: 'fto-memo', trigger: 'FTO, freedom to operate, infringement risk', steps: ['Summarize technology under analysis → identify key elements', 'Search USPTO for candidate patents → ask you to paste the claims to map', 'Map each claim limitation element-by-element → doctrine of equivalents', 'Rate possible non-infringement positions STRONG / MODERATE / WEAK', 'Propose design-arounds for HIGH/MEDIUM risk claims', 'Output: draft FTO analysis for attorney review, with a preliminary risk rating and suggested next steps'] },
          { name: 'ip-triage (matter intake)', trigger: 'New matter intake, IP question classification', steps: ['Classify as Patent / Trademark / Trade Secret / Copyright', 'Extract type-specific key facts (invention details, mark/goods, secrecy measures, or authorship)', 'Identify deadlines from playbook → status OVERDUE / URGENT (7 days or fewer) / UPCOMING (8 to 30) / APPROACHING (31 to 60) / OK', 'Assign risk: HIGH (deadline within 30 days, active litigation) / MEDIUM (deadline within 30 to 90 days) / LOW', 'Output: classification, facts, deadline table, risk, next steps, routing'] },
        ].map(skill => (
          <div key={skill.name} className="mb-8">
            <H3 dark={dark}>{skill.name}</H3>
            <P dark={dark}>Activates for: {skill.trigger}</P>
            <ol className="space-y-1.5 mb-4">
              {skill.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={`text-[15px] font-bold mono mt-0.5 w-4 shrink-0 ${dark ? 'text-ink-500' : 'text-ink-400'}`}>{i + 1}.</span>
                  <span className={`text-[14px] leading-[1.6] ${dark ? 'text-ink-200' : 'text-ink-600'}`}>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}

        {/* ── COMMANDS ── */}
        <H2 dark={dark} id="commands">Slash Commands</H2>
        <P dark={dark}>Commands are invoked explicitly. They combine skill logic with MCP tool calls for live data.</P>

        <H3 dark={dark}>/review-claims</H3>
        <Block dark={dark}>{`/review-claims US X,XXX,XXX
/review-claims 17/123,456
/review-claims [paste claim text]`}</Block>
        <P dark={dark}>Uses <Code dark={dark}>get_patent_details</Code> to retrieve the USPTO record (or the experimental <Code dark={dark}>get_pct_application</Code> for a PCT number, if WIPO credentials are configured), asks you to paste the claims because the USPTO API does not return claim text, then runs the patent-analysis skill.</P>

        <H3 dark={dark}>/tm-clearance</H3>
        <Block dark={dark}>{`/tm-clearance NEXAFLOW | SaaS workflow software | US, EU, UK, CA
/tm-clearance BRIGHTPATH | Educational consulting`}</Block>
        <P dark={dark}>Format: <Code dark={dark}>mark | goods_services | jurisdictions (optional)</Code>. USPTO has no trademark text search API, so Markman links to USPTO Trademark Search for the knockout search. <Code dark={dark}>check_trademark_status</Code> looks up a mark by serial number through USPTO's TSDR service, which was not responding reliably as of October 2026.</P>

        <H3 dark={dark}>/fto-analysis</H3>
        <Block dark={dark}>{`/fto-analysis Our product uses a transformer-based model to
extract structured data from medical records. Fine-tuned on
clinical text, outputs FHIR-compliant JSON, runs on-device.`}</Block>
        <P dark={dark}>Searches USPTO (and the experimental WIPO server, if WIPO credentials are configured) for candidate patents, asks you to paste the claims to map, then runs the fto-memo skill. Output is a draft for attorney review.</P>

        <H3 dark={dark}>/deadlines</H3>
        <Block dark={dark}>{`/deadlines                    # List all upcoming deadlines
/deadlines add "ML Patent" "Non-provisional filing" "2027-05-15"
/deadlines remove dl-1714500000-a1b2`}</Block>
        <P dark={dark}>Manages IP deadlines stored locally in <Code dark={dark}>~/.markman/data/deadlines.json</Code>. Shows days remaining and a status: OVERDUE (date has passed), URGENT (7 days or fewer), UPCOMING (8 to 30 days), APPROACHING (31 to 60 days), or OK. After a triage that identifies deadlines, Claude is instructed to offer to track them.</P>

        <H3 dark={dark}>/history</H3>
        <Block dark={dark}>{`/history                      # Show last 10 analyses
/history patent               # Filter to patent analyses
/history NEXAFLOW             # Search by keyword`}</Block>
        <P dark={dark}>Skills ask Claude to log each completed analysis to <Code dark={dark}>~/.markman/data/history.json</Code> with type, title, summary, risk level, and original input. Search across past work. Keeps the most recent 500 entries.</P>

        <H3 dark={dark}>/export-memo</H3>
        <Block dark={dark}>{`/export-memo                  # Export last analysis as .docx
/export-memo "Custom Title"   # Export with custom title`}</Block>
        <P dark={dark}>Generates a Word document with Times New Roman body text, a heading hierarchy, and a disclaimer. Every export is marked "DRAFT FOR ATTORNEY REVIEW". Markman does not apply privilege or work-product labels; you decide how to label and protect your work. Files are saved to <Code dark={dark}>~/.markman/data/exports/</Code>.</P>

        {/* ── MCP TOOLS ── */}
        <H2 dark={dark} id="mcp-tools">MCP Tools Reference</H2>

        <H3 dark={dark}>USPTO Server: 4 tools</H3>
        <Table dark={dark}
          headers={['Tool', 'Required Params', 'Returns']}
          rows={[
            ['search_patents', 'query: string', 'Up to 20 application records: application and patent numbers, title, filing and grant dates, status, applicants, inventors, CPC codes. Optional filing date range. No abstracts or claim text.'],
            ['get_patent_details', 'patent_number: string', 'One record by patent number (tried first) or application number: dates, status, applicants, assignees of record, inventors, CPC/USPC, patent term adjustment, continuity, foreign priority, transaction history (including maintenance fee events). No claim text or abstract.'],
            ['search_trademarks', 'mark_text: string', 'No results (USPTO has no trademark text search API); returns a note pointing to USPTO Trademark Search'],
            ['check_trademark_status', 'serial_number: string', 'Status code and status text from TSDR, when TSDR responds'],
          ]}
        />

        <H3 dark={dark}>WIPO Server: 2 tools</H3>
        <Table dark={dark}
          headers={['Tool', 'Required Params', 'Returns']}
          rows={[
            ['search_international_patents', 'query: string', 'Experimental. Requires WIPO credentials. Returns whatever bibliographic fields the WIPO response includes (numbers, title, applicant, dates, IPC codes, status).'],
            ['get_pct_application', 'app_number: string', 'Experimental. Requires WIPO credentials. Returns whatever bibliographic, priority, publication, and status fields the WIPO response includes. Does not compute deadlines.'],
          ]}
        />

        <P dark={dark}>Both API servers apply a client-side request limit (50 per minute for USPTO, 30 per minute for WIPO; the services' own limits apply separately), retry network failures and server errors up to 3 attempts with exponential backoff (other 4xx errors are not retried), and wait for the Retry-After header on HTTP 429. The WIPO server falls back from CASE endpoints to PATENTSCOPE endpoints.</P>

        <H3 dark={dark}>Markman Store: 6 tools</H3>
        <Table dark={dark}
          headers={['Tool', 'What it does']}
          rows={[
            ['add_deadline', 'Store a tracked IP deadline with matter name, description, date, and risk level'],
            ['list_deadlines', 'List all deadlines sorted by date with days remaining and urgency status'],
            ['remove_deadline', 'Remove a tracked deadline by ID'],
            ['log_matter', 'Record an analysis to persistent history (type, title, summary, risk, input)'],
            ['search_history', 'Search past analyses by keyword and/or type filter'],
            ['export_memo', 'Generate a .docx marked as a draft for attorney review, with heading hierarchy and disclaimer'],
          ]}
        />
        <P dark={dark}>The store server requires no API keys. Data is stored locally in <Code dark={dark}>~/.markman/data/</Code> (<Code dark={dark}>deadlines.json</Code>, <Code dark={dark}>history.json</Code>) and Word documents export to <Code dark={dark}>~/.markman/data/exports/</Code>. Set <Code dark={dark}>MARKMAN_DATA_DIR</Code> to use a different folder.</P>

        {/* ── PLAYBOOK ── */}
        <H2 dark={dark} id="playbook">Playbook Configuration</H2>
        <P dark={dark}>
          The playbook at <Code dark={dark}>playbooks/ip-playbook.md</Code> controls how all skills behave. Edit it to match your firm's standards.
        </P>

        <Table dark={dark}
          headers={['Section', 'What it controls', 'Key values']}
          rows={[
            ['FTO Risk Thresholds', 'When to flag HIGH / MEDIUM / LOW', 'Literal infringement = HIGH, uncertain construction = MEDIUM, strong non-infringement = LOW'],
            ['TM Clearance Standards', 'Jurisdictions, preliminary conflict risk ratings', 'Default: US, EU, UK, CA. Preliminary conflict risk: LOW / MEDIUM / HIGH'],
            ['Patent Claim Drafting', 'Language preferences for claim output', '"comprising" (open), "configured to" over "adapted to", avoid means-plus-function'],
            ['Deadline Rules', 'Reminder intervals, status labels, deadline definitions', 'Reminders at 90, 60, 30, 7 days. Status: URGENT (7 days or fewer), UPCOMING (8 to 30), APPROACHING (31 to 60). Patent and trademark deadlines with grace periods'],
            ['General Standards', 'Output formatting', 'Citation format, disclaimers, limitations sections'],
          ]}
        />

        {/* ── APIS & TESTING ── */}
        <H2 dark={dark} id="apis">APIs & Testing Guide</H2>
        <P dark={dark}>
          The USPTO server uses a free USPTO Open Data Portal key. The WIPO server is experimental and requires WIPO API credentials. Here is what each one does, how to get access, and how to test the pipeline. WIPO data and trademark status lookup are not available on the public demo.
        </P>

        <H3 dark={dark}>USPTO Open Data Portal API</H3>
        <P dark={dark}>
          The USPTO key gives access to patent application records through the Open Data Portal API (api.uspto.gov): bibliographic data and transaction history, but not claim text or abstracts. USPTO offers no API for trademark search by text, so Markman points you to USPTO Trademark Search on the web. Trademark status lookup by serial number depends on USPTO's TSDR service, which was not responding reliably as of October 2026; it uses your USPTO key.
        </P>
        <Table dark={dark}
          headers={['What it covers', 'Tools it powers', 'Endpoint']}
          rows={[
            ['Patent application search', 'search_patents', 'api.uspto.gov/api/v1/patent/applications/search'],
            ['Record for one patent or application', 'get_patent_details', 'api.uspto.gov/api/v1/patent/applications/search (by patent number), then /patent/applications/{applicationNumber}'],
            ['Trademark search (not available by API)', 'search_trademarks', 'None; points to tmsearch.uspto.gov'],
            ['Trademark status lookup', 'check_trademark_status', 'tsdrapi.uspto.gov/ts/cd/casestatus/sn{serial}/info.json'],
          ]}
        />
        <div className={`rounded-[14px] border p-5 mb-6 ${dark ? 'bg-ink-800/30 border-ink-700/40' : 'bg-ink-50 border-ink-200'}`}>
          <p className={`text-[15px] font-semibold mb-3 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>How to get your USPTO API key (free):</p>
          <ol className="space-y-2">
            {[
              'Go to data.uspto.gov/myodp',
              'Sign in with a USPTO.gov account (create one if you do not have one)',
              'Verify your identity through ID.me',
              'Complete the four required profile fields: job title, organization type, organization name, and intended use. The key does not work until these are filled in.',
              'Open Manage API Key and copy your key. New keys can take a couple of minutes to activate.',
              'Add it to your shell environment (for example ~/.zshrc) and restart Claude Code. The plugin does not read a .env file; .env is only for the optional web dashboard.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className={`text-[15px] font-bold mono w-4 shrink-0 mt-0.5 ${dark ? 'text-blu-400' : 'text-blu-500'}`}>{i + 1}.</span>
                <span className={`text-[14px] ${dark ? 'text-ink-200' : 'text-ink-600'}`}>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <H3 dark={dark}>WIPO (experimental)</H3>
        <P dark={dark}>
          The WIPO server is experimental. It sends <Code dark={dark}>WIPO_API_KEY</Code> as a bearer token to the endpoints below, and it has not been verified against WIPO's current services. It covers international patent data (PCT applications), <strong>not</strong> international trademarks; for those, check WIPO's Madrid Monitor (not integrated).
        </P>
        <Table dark={dark}
          headers={['What it covers', 'Tools it powers', 'Endpoint']}
          rows={[
            ['International application search', 'search_international_patents', 'wipocase.wipo.int/api/v1/search (PATENTSCOPE endpoint as fallback)'],
            ['PCT application lookup', 'get_pct_application', 'wipocase.wipo.int/api/v1/applications/{number} (PATENTSCOPE endpoint as fallback)'],
          ]}
        />
        <div className={`rounded-[14px] border p-5 mb-6 ${dark ? 'bg-ink-800/30 border-ink-700/40' : 'bg-ink-50 border-ink-200'}`}>
          <p className={`text-[15px] font-semibold mb-3 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>About WIPO access:</p>
          <ol className="space-y-2">
            {[
              'WIPO support requires WIPO API credentials; see WIPO\'s current access terms. WIPO does not offer a self-service key for this.',
              'WIPO CASE is a system for participating patent offices to share search and examination results (wipo.int/en/web/case).',
              'PATENTSCOPE programmatic access is a paid WIPO subscription (wipo.int/en/web/patentscope/data).',
              'Without credentials, search the free PATENTSCOPE website (patentscope.wipo.int) and paste what you find.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className={`text-[15px] font-bold mono w-4 shrink-0 mt-0.5 ${dark ? 'text-blu-400' : 'text-blu-500'}`}>{i + 1}.</span>
                <span className={`text-[14px] ${dark ? 'text-ink-200' : 'text-ink-600'}`}>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <H3 dark={dark}>What about trademark search?</H3>
        <P dark={dark}>
          The USPTO does not offer a public API for trademark text search. Trademark searching is done through the USPTO Trademark Search web interface at tmsearch.uspto.gov. When you run <Code dark={dark}>/tm-clearance NEXAFLOW</Code> in Markman, Claude generates phonetic variants, assesses distinctiveness, identifies Nice classes, and points you to USPTO Trademark Search so you can check for conflicts yourself. The web dashboard also links to other offices' search tools (EUIPO, UKIPO, CIPO, and others). Claude then drafts an analysis of the relevant DuPont factors based on the mark, the goods description, and the marks you provide. Trademark status lookup by serial number depends on USPTO's TSDR service, which was not responding reliably as of October 2026; it uses your USPTO key and is not available on the public demo. For international trademarks, check WIPO's Madrid Monitor.
        </P>

        <H3 dark={dark}>Testing with real API keys</H3>
        <P dark={dark}>Once you have your keys, here's how to verify everything works end to end:</P>
        <Block dark={dark}>{`# 1. Start the USPTO MCP server directly (from a clone of the repo)
USPTO_API_KEY=your_key node mcp/uspto-server.js
# Prints "USPTO MCP server running on stdio" (on stderr),
# then waits for MCP messages. Ctrl+C to stop.

# 2. Start the WIPO MCP server directly (experimental)
WIPO_API_KEY=your_credential node mcp/wipo-server.js
# Prints "WIPO MCP server running on stdio" (on stderr).
# Ctrl+C to stop.

# 3. Test inside Claude Code
claude
# Then try:
You: /review-claims US X,XXX,XXX
# Claude should call get_patent_details, show the matched record,
# and ask you to paste the claims

You: /tm-clearance APPLE | Computers and software | US
# Claude should link to USPTO Trademark Search and draft a clearance screen

You: Search for patents related to "transformer neural network
     for medical record extraction"
# Claude should call search_patents and return matching results`}</Block>

        <H3 dark={dark}>Testing without API keys</H3>
        <P dark={dark}>
          Markman's skills still work without API keys. Claude works from the patents and trademarks you paste in directly. The difference: without keys, you provide the data; with keys, Markman fetches patent data from USPTO. Both produce the same structured draft format.
        </P>
        <Block dark={dark}>{`# Without API keys, paste claims directly:
You: Analyze these patent claims:
Claim 1. A method for recommending content, comprising:
  receiving a user interaction signal...
  generating a multi-modal embedding vector...

# Claude will still run the patent-analysis skill
# and draft a claim map, scope assessment, and recommendations.
# It just can't look up the patent by number.`}</Block>

        {/* ── INSTALL ── */}
        <H2 dark={dark} id="install">Installation</H2>
        <P dark={dark}>Requirements: Node.js 18+, Claude Code. A USPTO API key is free and optional; WIPO credentials are optional and only used by the experimental WIPO server. In Claude Code, run:</P>
        <Block dark={dark}>{`/plugin marketplace add Muna0/markman
/plugin install markman@markman`}</Block>
        <P dark={dark}>To add live USPTO lookups, add your keys to your shell environment (for example <Code dark={dark}>~/.zshrc</Code>), then restart Claude Code:</P>
        <Block dark={dark}>{`export USPTO_API_KEY="your_key"
export WIPO_API_KEY="your_credential"   # optional, experimental`}</Block>

        <H3 dark={dark}>Project Structure</H3>
        <Block dark={dark}>{`markman/
├── .claude-plugin/
│   ├── plugin.json               # Plugin manifest
│   └── marketplace.json          # Marketplace listing
├── .mcp.json                     # MCP server config (runs mcp/dist/*.mjs)
├── mcp/
│   ├── uspto-server.js           # 4 tools
│   ├── wipo-server.js            # 2 tools, experimental
│   ├── markman-store.js          # 6 tools, local data in ~/.markman/data
│   └── dist/                     # Bundled servers
├── skills/
│   ├── patent-analysis/SKILL.md
│   ├── fto-memo/SKILL.md
│   ├── trademark-screen/SKILL.md
│   └── ip-triage/SKILL.md
├── commands/                     # /command invocation
│   ├── review-claims.md
│   ├── fto-analysis.md
│   ├── tm-clearance.md
│   ├── deadlines.md
│   ├── history.md
│   └── export-memo.md
├── playbooks/ip-playbook.md      # Firm-specific config
├── server.js, frontend/          # Optional web dashboard
└── package.json`}</Block>

        {/* ── GLOSSARY ── */}
        <H2 dark={dark} id="glossary">IP Glossary</H2>
        <P dark={dark}>
          Key terms used throughout Markman and IP law practice. Written for attorneys who don't specialize in IP and law students entering the field. Simplified definitions for orientation only; not legal advice.
        </P>

        {[
          { cat: 'Patent Terms', terms: [
            { term: 'Patent', def: 'A government-granted right to exclude others from making, using, offering for sale, selling, or importing the claimed invention. A U.S. utility patent term generally ends 20 years from the U.S. filing date, or from the filing date of the earliest U.S. non-provisional or PCT application whose benefit is claimed (35 U.S.C. §§ 120, 121, 365(c)), subject to adjustments and extensions (35 U.S.C. § 154). Design patents filed on or after May 13, 2015 last 15 years from grant. Types: utility, design, plant.' },
            { term: 'Claim', def: 'The legally operative part of a patent. Claims define the scope of the patent right. Independent claims stand alone; dependent claims refer back to and further limit another claim.' },
            { term: 'Independent Claim', def: 'A patent claim that stands on its own without referring to any other claim. Independent claims are usually the broadest claims in a patent.' },
            { term: 'Dependent Claim', def: 'A claim that refers back to a previous claim and adds further limitations. E.g., "The method of claim 1, wherein the neural network is a transformer."' },
            { term: 'Prior Art', def: 'Under the AIA, patents, printed publications, public uses, sales, and other disclosures available to the public before the effective filing date of a claimed invention, plus certain earlier-filed U.S. and PCT patent filings by others (35 U.S.C. § 102(a)), subject to the exceptions in § 102(b).' },
            { term: 'Prosecution', def: 'The back-and-forth process between a patent applicant and the USPTO to get a patent granted. Includes office actions, amendments, and arguments.' },
            { term: 'Office Action (OA)', def: 'A written communication from a USPTO examiner, often rejecting or objecting to some or all claims. The response period is typically a 3-month shortened statutory period, extendable up to the 6-month statutory maximum with fees.' },
            { term: 'Provisional Application', def: 'A lower-cost U.S. filing that establishes an early effective filing date. It is not examined. A non-provisional application claiming its benefit must be filed within 12 months of the provisional filing date.' },
            { term: 'PCT (Patent Cooperation Treaty)', def: 'An international filing system that lets you seek patent protection in 150+ contracting states with a single application. It does not grant a patent; you must enter the "national phase" in each country or region, generally by 30 months from the earliest priority date.' },
            { term: 'National Phase', def: 'The stage where a PCT application is pursued in individual countries or regions. Deadline: generally 30 months from the earliest priority date (31 months at some offices, including the EPO).' },
            { term: 'CPC / IPC Classification', def: 'Cooperative Patent Classification (CPC) and International Patent Classification (IPC): taxonomy systems that categorize patents by technology area. Used for searching prior art.' },
            { term: 'Maintenance Fees', def: 'Fees due 3.5, 7.5, and 11.5 years after a U.S. utility patent grants to keep it in force. Each fee can be paid with a surcharge during a 6-month grace period; if it is not paid by the end of that period, the patent expires.' },
            { term: 'Claim Construction (Markman Hearing)', def: 'The process of interpreting the meaning of patent claim terms. Markman v. Westview Instruments, Inc., 517 U.S. 370 (1996), held that claim construction is a question for the court. A "Markman hearing" is where a judge decides what disputed claim terms mean, often a pivotal moment in patent litigation.' },
          ]},
          { cat: 'Patentability & Validity', terms: [
            { term: '35 U.S.C. § 101 (Eligibility)', def: 'Patent-eligible subject matter: process, machine, manufacture, or composition of matter. The Alice/Mayo framework tests whether a claim is directed to an abstract idea, law of nature, or natural phenomenon, and if so, whether it adds "significantly more."' },
            { term: 'Alice / Mayo Framework', def: 'Two-step test from Mayo v. Prometheus (2012) and Alice Corp. v. CLS Bank (2014): (1) Is the claim directed to a patent-ineligible concept, such as an abstract idea? (2) If so, do the additional elements supply an "inventive concept" that transforms it into a patent-eligible application? Software claims frequently face § 101 challenges.' },
            { term: '35 U.S.C. § 103 (Obviousness)', def: 'A claim is unpatentable if the claimed invention as a whole would have been obvious, before the effective filing date, to a person having ordinary skill in the art. KSR v. Teleflex (2007) rejected a rigid teaching-suggestion-motivation test: combining known elements by known methods to yield predictable results is likely obvious.' },
            { term: '35 U.S.C. § 112 (Disclosure and Definiteness)', def: '§ 112(a) requires written description and enablement. § 112(b) requires claims that particularly point out and distinctly claim the invention; under Nautilus v. Biosig (2014), claims must inform skilled artisans of their scope with reasonable certainty. § 112(f) governs means-plus-function claims.' },
            { term: 'Means-Plus-Function', def: 'A claim element written as a "means for [function]" rather than reciting structure. Construed to cover the corresponding structure disclosed in the specification and its equivalents (§ 112(f)). It can narrow a claim, and can render it indefinite if the specification discloses no corresponding structure.' },
            { term: 'Doctrine of Equivalents', def: 'A product that does not literally infringe may still infringe if the differences from a claim limitation are insubstantial, applied limitation by limitation. One common formulation is the "function-way-result" test: does the element perform substantially the same function, in substantially the same way, to achieve substantially the same result?' },
            { term: 'Prosecution History Estoppel', def: 'Narrowing amendments or arguments made to obtain a patent can bar the patentee from using the doctrine of equivalents to recapture surrendered subject matter (Festo Corp. v. Shoketsu, 2002). Clear disavowals during prosecution can also narrow claim construction (prosecution disclaimer).' },
          ]},
          { cat: 'Trademark Terms', terms: [
            { term: 'Trademark', def: 'A word, phrase, symbol, design, or combination that identifies the source of goods or services. Protects consumers from confusion about who makes a product.' },
            { term: 'Service Mark', def: 'Same as a trademark, but for services rather than goods. Legally treated the same way.' },
            { term: 'Nice Classification', def: 'International system that categorizes goods and services into 45 classes (1-34 for goods, 35-45 for services). E.g., Class 9 includes downloadable software; Class 42 includes SaaS.' },
            { term: 'Distinctiveness Spectrum', def: 'From weakest to strongest: Generic (not protectable) → Descriptive (protectable only with acquired distinctiveness) → Suggestive (protectable) → Arbitrary (strong) → Fanciful (strongest). "APPLE" for computers is arbitrary; "APPLE" for apples is generic.' },
            { term: 'Likelihood of Confusion', def: 'The core test for trademark infringement and for refusal of registration under Lanham Act § 2(d): would consumers likely be confused about the source of goods or services? The USPTO and TTAB apply the DuPont factors; federal circuits apply similar multi-factor tests.' },
            { term: 'DuPont Factors', def: 'The thirteen factors from In re E. I. du Pont de Nemours & Co., 476 F.2d 1357 (C.C.P.A. 1973): (1) similarity of the marks, (2) relatedness of the goods or services, (3) trade channels, (4) conditions of purchase and buyer sophistication, (5) fame of the prior mark, (6) number and nature of similar marks in use on similar goods, (7) actual confusion, (8) length and conditions of concurrent use without actual confusion, (9) variety of goods on which the mark is used, (10) market interface between the parties, (11) the applicant\'s right to exclude others, (12) extent of potential confusion, (13) any other probative fact. Not every factor is relevant in every case.' },
            { term: 'TESS', def: 'Trademark Electronic Search System. The USPTO\'s former trademark database, retired in 2023 and replaced by USPTO Trademark Search. Used for preliminary clearance searches.' },
            { term: 'TSDR', def: 'Trademark Status & Document Retrieval: the USPTO system for checking the current status of a trademark application or registration.' },
            { term: 'Section 8 Declaration', def: 'A declaration of continued use (or excusable nonuse) filed between the 5th and 6th years after registration, and again with each 10-year renewal. A 6-month grace period is available with a surcharge. Failure to file results in cancellation.' },
            { term: 'Section 15 (Incontestability)', def: 'An optional declaration that can be filed after 5 consecutive years of continuous use following registration. Makes the registration "incontestable", which limits the grounds on which it can be challenged.' },
            { term: 'Madrid Protocol', def: 'International trademark registration system administered by WIPO. File one international application, based on a home registration or application, to seek protection in 130+ countries. Status can be tracked in WIPO\'s Madrid Monitor.' },
            { term: 'Opposition', def: 'A proceeding where a third party challenges a trademark application before it registers. Filed within 30 days of publication in the Official Gazette (extendable). Heard by the Trademark Trial and Appeal Board (TTAB).' },
          ]},
          { cat: 'FTO & Infringement', terms: [
            { term: 'Freedom to Operate (FTO)', def: 'An analysis of whether a product or technology can be commercialized without infringing third-party patent rights. Not the same as patentability: you can have a valid patent and still infringe someone else\'s.' },
            { term: 'Literal Infringement', def: 'When every limitation of a patent claim, as construed, is present in the accused product or process.' },
            { term: 'Design-Around', def: 'Modifying a product to avoid infringing a patent claim by changing one or more elements so they no longer meet the claim limitations. A key output of FTO analysis.' },
            { term: 'Non-Infringement Argument', def: 'A legal argument that a specific claim limitation is not met by the accused technology. In Markman drafts, possible positions are rated STRONG (clear structural difference), MODERATE (arguable), or WEAK (risky to rely on).' },
            { term: 'Claim Chart', def: 'A side-by-side comparison mapping each limitation of a patent claim against the corresponding element of a product or technology. A core work product of infringement and FTO analysis.' },
          ]},
          { cat: 'Trade Secret & Copyright', terms: [
            { term: 'Trade Secret', def: 'Information that derives independent economic value from not being generally known or readily ascertainable through proper means, and that is subject to reasonable measures to keep it secret (18 U.S.C. § 1839(3)). Protected under the Defend Trade Secrets Act (DTSA) and state law, mostly based on the Uniform Trade Secrets Act (UTSA).' },
            { term: 'NDA (Non-Disclosure Agreement)', def: 'A contract that establishes confidentiality obligations. Important for maintaining trade secret status when sharing information with partners, investors, or employees.' },
            { term: 'Misappropriation', def: 'Acquiring a trade secret by improper means (such as theft, bribery, misrepresentation, breach or inducement of a breach of a duty of confidentiality, or espionage), or disclosing or using it without consent when one knew or had reason to know it was improperly obtained or owed confidentiality. Reverse engineering and independent derivation are proper means, not misappropriation (18 U.S.C. § 1839(5), (6)(B); UTSA § 1 cmt.).' },
            { term: 'Copyright', def: 'Protection for original works of authorship (code, text, images, music) fixed in a tangible medium. Arises automatically on fixation. In the US, registration (or refusal of registration) is required before suing for infringement of a U.S. work (§ 411(a)), and timely registration is required for statutory damages and attorney\'s fees (17 U.S.C. § 412).' },
            { term: 'Work for Hire', def: 'When an employee creates a work within the scope of employment, the employer is the author and owns the copyright. A commissioned work by a contractor is a work made for hire only if it falls within one of nine statutory categories and both parties agree in a signed writing (17 U.S.C. § 101).' },
            { term: 'Fair Use', def: 'A defense to copyright infringement. Four statutory factors (17 U.S.C. § 107): (1) purpose and character of the use, (2) nature of the copyrighted work, (3) amount and substantiality of the portion used, (4) effect on the potential market for or value of the work.' },
          ]},
          { cat: 'General IP', terms: [
            { term: 'Priority Date', def: 'The filing date of the earliest application whose benefit or priority is validly claimed (provisional, non-provisional, or foreign). Many PCT and foreign filing deadlines count from this date.' },
            { term: 'Grace Period', def: 'Under 35 U.S.C. § 102(b)(1), a disclosure made 1 year or less before the effective filing date by the inventor (or by others who obtained the subject matter from the inventor) is not prior art, and neither is a later third-party disclosure of subject matter the inventor had already publicly disclosed. Many other countries have no comparable grace period.' },
            { term: 'On-Sale Bar', def: 'Under the AIA (35 U.S.C. § 102(a)(1)), an invention that was on sale or in public use before the effective filing date is prior art, subject to the one-year grace period exceptions in § 102(b)(1). Helsinn Healthcare v. Teva (2019) held that a secret sale can qualify. For pre-AIA patents, the bar applied to sales or public use more than one year before the U.S. filing date.' },
            { term: 'Attorney Work Product', def: 'Documents prepared in anticipation of litigation that are protected from discovery. Whether a document qualifies depends on the facts and the jurisdiction; a label alone does not create protection.' },
            { term: 'FRAND', def: 'Fair, Reasonable, and Non-Discriminatory: licensing terms that holders of standard-essential patents (SEPs) commonly commit to offer when their technology is included in an industry standard (e.g., 5G, Wi-Fi).' },
            { term: 'Bluebook Citation', def: 'The standard legal citation format in the US. Commonly used in formal legal writing. E.g., Alice Corp. v. CLS Bank Int\'l, 573 U.S. 208 (2014).' },
          ]},
        ].map(cat => (
          <div key={cat.cat} className="mb-8">
            <h3 className={`text-[15px] font-bold mb-4 pb-2 border-b ${dark ? 'text-white border-white/10' : 'text-ink-950 border-ink-200'}`}>{cat.cat}</h3>
            <div className="space-y-4">
              {cat.terms.map(t => (
                <div key={t.term} className="flex flex-col sm:flex-row items-start gap-1 sm:gap-3">
                  <span className={`text-[14px] font-bold mono shrink-0 sm:w-[180px] pt-0.5 ${dark ? 'text-ink-100' : 'text-ink-800'}`}>{t.term}</span>
                  <span className={`text-[14px] leading-[1.65] ${dark ? 'text-ink-300' : 'text-ink-500'}`}>{t.def}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className={`mt-12 pt-8 border-t text-center ${dark ? 'border-white/10' : 'border-ink-200'}`}>
          <p className={`text-[14px] ${dark ? 'text-ink-500' : 'text-ink-400'}`}>
            Markman &middot; Apache-2.0 &middot; Claude Code plugin for IP work &middot; Not legal advice
          </p>
        </div>
      </div>
    </div>
  )
}
