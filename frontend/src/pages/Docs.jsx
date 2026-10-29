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
  { id: 'commands', label: 'Commands (3)' },
  { id: 'mcp-tools', label: 'MCP Tools (6)' },
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
          Every IP attorney does the same research: search USPTO Trademark Search for conflicting marks, parse patent claims into a dependency tree, map claim limitations against a product for FTO, classify incoming matters by type and deadline. They do it in browser tabs, Word documents, and spreadsheets. Disconnected from each other and disconnected from the data sources.
        </P>
        <P dark={dark}>
          Markman is a free, open-source <strong>Claude Code plugin</strong> that brings structured IP workflows into the terminal or editor. You describe what you need in natural language and Markman drafts structured analysis for attorney review, using USPTO patent data (and WIPO data, if you add a WIPO key) through MCP servers. Markman does not provide legal advice. Output is a draft and must be reviewed by a licensed attorney.
        </P>

        <div className={`rounded-[14px] border p-6 mb-6 ${dark ? 'bg-ink-800/30 border-ink-700/40' : 'bg-ink-50 border-ink-200'}`}>
          <p className={`text-[17px] font-semibold mb-4 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>What Markman offers:</p>
          <div className="space-y-3">
            {[
              'Runs inside Claude Code, with no separate login',
              'Skills fire automatically when you discuss IP matters in conversation',
              'Uses the USPTO API for patent data; WIPO data requires your own WIPO key and is not available on the public demo',
              'Drafts are structured for attorney review, with citations to check and a limitations section',
              'Fully configurable playbook to match your firm\'s specific thresholds and standards',
              'Open source (Apache 2.0) so you can inspect every line, self host, and modify freely',
              'USPTO and WIPO API keys are free to request',
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

        <H3 dark={dark}>Step 2: Skills fire automatically</H3>
        <P dark={dark}>
          Claude Code detects that your message involves an FTO/infringement question. The <Code dark={dark}>fto-memo</Code> skill activates automatically. You do not invoke it manually. The skill's definition file tells Claude how to structure its analysis: what steps to follow, what format to output, what risk thresholds to use.
        </P>
        <div className={`rounded-[14px] border p-4 mb-4 ${dark ? 'bg-ink-800/30 border-ink-700/40' : 'bg-ink-50 border-ink-200'}`}>
          <p className={`text-[15px] font-semibold uppercase tracking-wider mb-2 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>What happens behind the scenes</p>
          <div className="space-y-2">
            {[
              'Claude reads the fto-memo skill definition (skills/fto-memo.md)',
              'Claude reads the playbook (playbooks/ip-playbook.md) for your firm\'s risk thresholds',
              'Claude calls the USPTO MCP server → search_patents tool to find relevant patents',
              'If a WIPO key is set, Claude calls the WIPO MCP server → search_international_patents for PCT coverage',
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
          When Claude needs patent data or a trademark status record, it calls the MCP servers. These are Node.js processes that run locally on your machine, connecting to the USPTO API (and the WIPO API, if you have a key) with your API keys. Claude does not make the API calls directly. The MCP protocol handles this separation.
        </P>
        <Block dark={dark}>{`Claude ──────► MCP Server (local) ──────► USPTO API
                   │                         │
                   │  • Rate limiting         │  data.uspto.gov
                   │  • Retry with backoff    │  tsdrapi.uspto.gov
                   │  • Response parsing      │
                   │                         │
                   ◄────── structured JSON ◄──┘`}</Block>

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
        <Block dark={dark}>{`You: /review-claims US11,234,567

Claude: Retrieving patent from USPTO...
[calls get_patent_details via MCP]

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
Distinctiveness: likely fanciful
Phonetic variants to search: NEXFLOW, NEXA FLOW, NEKSAFLOW
DuPont factors: assessed against marks you provide
...`}</Block>

        <H3 dark={dark}>How the pieces fit</H3>
        <P dark={dark}>
          The skills are structured prompts. The MCP servers are data pipes. The playbook is configuration. Claude does the drafting, Markman provides the structure and the data, and the attorney reviews and decides. That is why it is a plugin, not a separate product.
        </P>

        {/* ── ARCHITECTURE ── */}
        <H2 dark={dark} id="architecture">Architecture</H2>
        <P dark={dark}>
          Markman is a Claude Code plugin with three layers: skills (auto-fire), commands (on-demand), and MCP servers (data access). The playbook configures how all three behave.
        </P>
        <Block dark={dark}>{`┌─────────────────────────────────────────┐
│              Claude Code                │
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐  │
│  │ Skills  │ │Commands │ │ Playbook │  │
│  │(auto)   │ │(/slash) │ │(.md cfg) │  │
│  └────┬────┘ └────┬────┘ └────┬─────┘  │
│       │           │           │         │
│  ┌────▼───────────▼───────────▼──────┐  │
│  │        MCP Server Layer           │  │
│  │  ┌──────────┐  ┌──────────────┐   │  │
│  │  │  USPTO   │  │     WIPO     │   │  │
│  │  │ (4 tools)│  │  (2 tools)   │   │  │
│  │  └────┬─────┘  └──────┬───────┘   │  │
│  └───────┼───────────────┼───────────┘  │
└──────────┼───────────────┼──────────────┘
           │               │
    ┌──────▼──────┐ ┌──────▼──────────┐
    │data.uspto.gov│ │wipocase.wipo.int│
    │tsdrapi.uspto │ │patentscope.wipo │
    └─────────────┘ └─────────────────┘`}</Block>

        <Table dark={dark}
          headers={['Layer', 'Files', 'Trigger']}
          rows={[
            ['Skills (4)', 'skills/*.md', 'Automatic when Claude detects relevant context'],
            ['Commands (3)', 'commands/*.md', 'Manual when user types /command'],
            ['MCP Servers (2)', 'mcp/*.js', 'Called by skills/commands when live data needed'],
            ['Playbook (1)', 'playbooks/ip-playbook.md', 'Referenced by all skills for thresholds and standards'],
          ]}
        />

        {/* ── SKILLS ── */}
        <H2 dark={dark} id="skills">Skills Reference</H2>
        <P dark={dark}>Skills fire automatically when Claude detects relevant IP context. Each follows a structured multi-step workflow.</P>

        {[
          { name: 'patent-analysis', trigger: 'Patent review, claim comparison, patentability', steps: ['Parse claims → classify independent/dependent → map dependency chain', 'Assess scope per limitation → flag breadth issues, means-plus-function, §112(b)', 'Compare across patents → element mapping, double patenting risk', 'Surface prior art red flags → KSR obviousness, Alice/Mayo §101', 'Output: claim map, scope assessment, risks, recommendations'] },
          { name: 'trademark-screen', trigger: 'Trademark search, clearance, brand naming', steps: ['Characterize mark type and distinctiveness → identify Nice classes', 'Point to USPTO Trademark Search for the knockout search → flag same-class conflicts in marks you provide', 'Generate phonetic variants to search → sight/sound/meaning test', 'Score all 8 DuPont factors per conflict → HIGH/MEDIUM/LOW', 'Map jurisdiction coverage → flag first-to-file vs first-to-use gaps', 'Output: draft screen with a preliminary CLEAR / CLEAR WITH RISK / DO NOT USE rating per jurisdiction, for attorney review'] },
          { name: 'fto-memo', trigger: 'FTO, freedom to operate, infringement risk', steps: ['Summarize technology under analysis → identify key elements', 'Search for patents with claims reading on technology', 'Map each claim limitation element-by-element → doctrine of equivalents', 'Rate non-infringement arguments STRONG / MODERATE / WEAK', 'Propose design-arounds for HIGH/MEDIUM risk claims', 'Output: draft FTO analysis for attorney review, with a preliminary risk rating and suggested next steps'] },
          { name: 'ip-triage (matter intake)', trigger: 'New matter intake, IP question classification', steps: ['Classify as Patent / Trademark / Trade Secret / Copyright', 'Extract type-specific key facts (invention details, mark/goods, secrecy measures, or authorship)', 'Identify deadlines from playbook → flag <60 days as URGENT', 'Assign risk: HIGH (<30d deadline, active litigation) / MEDIUM / LOW', 'Output: classification, facts, deadline table, risk, next steps, routing'] },
        ].map(skill => (
          <div key={skill.name} className="mb-8">
            <H3 dark={dark}>{skill.name}</H3>
            <P dark={dark}>Triggers on: {skill.trigger}</P>
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
        <Block dark={dark}>{`/review-claims US11,234,567
/review-claims PCT/US2024/012345
/review-claims [paste claim text]`}</Block>
        <P dark={dark}>Uses <Code dark={dark}>get_patent_details</Code> or <Code dark={dark}>get_pct_application</Code> to retrieve claims, then runs patent-analysis skill.</P>

        <H3 dark={dark}>/tm-clearance</H3>
        <Block dark={dark}>{`/tm-clearance NEXAFLOW | SaaS workflow software | US, EU, UK, CA
/tm-clearance BRIGHTPATH | Educational consulting`}</Block>
        <P dark={dark}>Format: <Code dark={dark}>mark | goods_services | jurisdictions (optional)</Code>. USPTO has no trademark text search API, so Markman links to USPTO Trademark Search for the knockout search. <Code dark={dark}>check_trademark_status</Code> looks up a mark by serial number.</P>

        <H3 dark={dark}>/fto-analysis</H3>
        <Block dark={dark}>{`/fto-analysis Our product uses a transformer-based model to
extract structured data from medical records. Fine-tuned on
clinical text, outputs FHIR-compliant JSON, runs on-device.`}</Block>
        <P dark={dark}>Searches USPTO (and WIPO, if a WIPO key is set) for relevant patents, then runs the fto-memo skill. Output is a draft for attorney review.</P>

        <H3 dark={dark}>/deadlines</H3>
        <Block dark={dark}>{`/deadlines                    # List all upcoming deadlines
/deadlines add "ML Patent" "Provisional filing" "2026-05-15"
/deadlines remove dl-1714500000-a1b2`}</Block>
        <P dark={dark}>Manages persistent IP deadlines stored locally in <Code dark={dark}>markman-data/deadlines.json</Code>. Shows days remaining and urgency status (OVERDUE, URGENT, UPCOMING, APPROACHING, OK). Skills automatically offer to track deadlines after triage.</P>

        <H3 dark={dark}>/history</H3>
        <Block dark={dark}>{`/history                      # Show last 10 analyses
/history patent               # Filter to patent analyses
/history NEXAFLOW             # Search by keyword`}</Block>
        <P dark={dark}>Every analysis is logged to <Code dark={dark}>markman-data/history.json</Code> with type, title, summary, risk level, and original input. Search across all past work. Keeps the last 500 entries.</P>

        <H3 dark={dark}>/export-memo</H3>
        <Block dark={dark}>{`/export-memo                  # Export last analysis as .docx
/export-memo "Custom Title"   # Export with custom title`}</Block>
        <P dark={dark}>Generates a Word document with Times New Roman body text, a heading hierarchy, and a disclaimer. Every export is marked "DRAFT FOR ATTORNEY REVIEW". Markman does not apply privilege or work-product labels; you decide how to label and protect your work. Files saved to <Code dark={dark}>markman-data/exports/</Code>.</P>

        {/* ── MCP TOOLS ── */}
        <H2 dark={dark} id="mcp-tools">MCP Tools Reference</H2>

        <H3 dark={dark}>USPTO Server: 4 tools</H3>
        <Table dark={dark}
          headers={['Tool', 'Required Params', 'Returns']}
          rows={[
            ['search_patents', 'query: string', 'Patent results: number, title, abstract, dates, assignee, inventors, claim count'],
            ['get_patent_details', 'patent_number: string', 'Full patent: claims text, classifications (CPC/USPC), references, maintenance status'],
            ['search_trademarks', 'mark_text: string', 'No results (USPTO has no trademark text search API); returns a link to USPTO Trademark Search'],
            ['check_trademark_status', 'serial_number: string', 'Full status: dates, owner, attorneys, renewal date, filing basis, live/dead'],
          ]}
        />

        <H3 dark={dark}>WIPO Server: 2 tools</H3>
        <Table dark={dark}
          headers={['Tool', 'Required Params', 'Returns']}
          rows={[
            ['search_international_patents', 'query: string', 'PCT results: app number, title, applicant, IPC codes, designated states, status'],
            ['get_pct_application', 'app_number: string', 'Full PCT: priority claims, national phase entries, search report, 30-month deadline'],
          ]}
        />

        <P dark={dark}>Both API servers include rate limiting (50/min USPTO, 30/min WIPO), exponential backoff retry (3 attempts), 429 handling with Retry-After, and fallback endpoints (TSDR for USPTO, PATENTSCOPE for WIPO).</P>

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
        <P dark={dark}>The store server requires no API keys. Data is stored locally in <Code dark={dark}>markman-data/</Code> as JSON files. Word documents export to <Code dark={dark}>markman-data/exports/</Code>.</P>

        {/* ── PLAYBOOK ── */}
        <H2 dark={dark} id="playbook">Playbook Configuration</H2>
        <P dark={dark}>
          The playbook at <Code dark={dark}>playbooks/ip-playbook.md</Code> controls how all skills behave. Edit it to match your firm's standards.
        </P>

        <Table dark={dark}
          headers={['Section', 'What it controls', 'Key values']}
          rows={[
            ['FTO Risk Thresholds', 'When to flag HIGH / MEDIUM / LOW', 'Literal infringement = HIGH, uncertain construction = MEDIUM, strong non-infringement = LOW'],
            ['TM Clearance Standards', 'Jurisdictions, recommendation thresholds', 'Default: US, EU, UK, CA. CLEAR / CLEAR WITH RISK / DO NOT USE'],
            ['Patent Claim Drafting', 'Language preferences for claim output', '"comprising" (open), "configured to" over "adapted to", avoid means-plus-function'],
            ['Deadline Rules', 'Alert intervals and deadline definitions', 'Alerts at 90, 60, 30, 7 days. Patent + trademark deadlines with grace periods'],
            ['General Standards', 'Output formatting', 'Citation format, disclaimers, limitations sections'],
          ]}
        />

        {/* ── APIS & TESTING ── */}
        <H2 dark={dark} id="apis">APIs & Testing Guide</H2>
        <P dark={dark}>
          Markman connects to two APIs with free keys. Here is what each one does, how to get keys, and how to test the pipeline. WIPO data requires your own WIPO key and is not available on the public demo.
        </P>

        <H3 dark={dark}>USPTO Open Data Portal API</H3>
        <P dark={dark}>
          This API key gives you access to patent application data. It powers the patent search and patent details tools. USPTO offers no API for trademark search by text, so Markman links you to USPTO Trademark Search on the web. Trademark status lookups by serial number use the TSDR API, which needs its own key.
        </P>
        <Table dark={dark}
          headers={['What it covers', 'Tools it powers', 'Endpoint']}
          rows={[
            ['Patent full-text search', 'search_patents', 'data.uspto.gov/api/v1/patents/search'],
            ['Patent details (claims, classifications, prosecution)', 'get_patent_details', 'data.uspto.gov/api/v1/patents/{number}'],
            ['Trademark search (not available by API)', 'search_trademarks', 'Links to tmsearch.uspto.gov'],
            ['Trademark status lookup', 'check_trademark_status', 'data.uspto.gov/api/v1/trademarks/{serial} + TSDR fallback'],
          ]}
        />
        <div className={`rounded-[14px] border p-5 mb-6 ${dark ? 'bg-ink-800/30 border-ink-700/40' : 'bg-ink-50 border-ink-200'}`}>
          <p className={`text-[15px] font-semibold mb-3 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>How to get your USPTO API key (free):</p>
          <ol className="space-y-2">
            {[
              'Go to data.uspto.gov/myodp',
              'Create a USPTO.gov account if you do not have one',
              'Verify your identity through ID.me (required for API access)',
              'Link your ID.me account to your USPTO.gov account',
              'Your API key will appear on the MyODP page. Copy it and add it to your .env file.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className={`text-[15px] font-bold mono w-4 shrink-0 mt-0.5 ${dark ? 'text-blu-400' : 'text-blu-500'}`}>{i + 1}.</span>
                <span className={`text-[14px] ${dark ? 'text-ink-200' : 'text-ink-600'}`}>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <H3 dark={dark}>WIPO CASE API</H3>
        <P dark={dark}>
          Covers international patent data (PCT applications). Does <strong>not</strong> cover international trademarks. Madrid Monitor would be needed for that (not yet integrated).
        </P>
        <Table dark={dark}
          headers={['What it covers', 'Tools it powers', 'Endpoint']}
          rows={[
            ['PCT application search', 'search_international_patents', 'wipocase.wipo.int/api/v1/search (+ PATENTSCOPE fallback)'],
            ['PCT application details (deadlines, national phase)', 'get_pct_application', 'wipocase.wipo.int/api/v1/applications/{number}'],
          ]}
        />
        <div className={`rounded-[14px] border p-5 mb-6 ${dark ? 'bg-ink-800/30 border-ink-700/40' : 'bg-ink-50 border-ink-200'}`}>
          <p className={`text-[15px] font-semibold mb-3 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>How to get your WIPO API key (free):</p>
          <ol className="space-y-2">
            {[
              'Go to wipo.int/case/en',
              'Click "Access" or "Apply for API Access"',
              'Submit your organization details. Approval may take 1 to 3 business days.',
              'You\'ll receive a Bearer token for authentication',
              'Add the key to your .env file',
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
          The USPTO does not offer a public API for trademark text search. Trademark searching is done through the USPTO Trademark Search web interface at tmsearch.uspto.gov. When you run <Code dark={dark}>/tm-clearance NEXAFLOW</Code> in Markman, the tool generates phonetic variants, assesses distinctiveness, identifies Nice classifications, and provides direct links to USPTO Trademark Search and other jurisdiction search databases (EUIPO, UKIPO, CIPO, etc.) so you can check for conflicts yourself. Claude then drafts a DuPont factor analysis based on the mark, the goods description, and any marks you provide. For trademark status checks by serial number, Markman uses the TSDR API, which requires its own key from account.uspto.gov/api-manager (set TSDR_API_KEY). For international trademarks, check the Madrid Monitor at wipo.int/madrid/monitor.
        </P>

        <H3 dark={dark}>Testing with real API keys</H3>
        <P dark={dark}>Once you have your keys, here's how to verify everything works end to end:</P>
        <Block dark={dark}>{`# 1. Test USPTO MCP server directly
USPTO_API_KEY=your_key node mcp/uspto-server.js
# Server should print: "USPTO MCP server running on stdio"
# Ctrl+C to stop

# 2. Test WIPO MCP server directly
WIPO_API_KEY=your_key node mcp/wipo-server.js
# Server should print: "WIPO MCP server running on stdio"
# Ctrl+C to stop

# 3. Test inside Claude Code
claude
# Then try:
You: /review-claims US11,234,567
# Claude should call get_patent_details and draft a claim analysis

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
        <P dark={dark}>Requirements: Node.js 18+, Claude Code. USPTO and WIPO API keys are free to request and optional. In Claude Code, run:</P>
        <Block dark={dark}>{`/plugin marketplace add Muna0/markman
/plugin install markman@markman`}</Block>
        <P dark={dark}>To add live USPTO lookups, add your keys to your shell environment (for example <Code dark={dark}>~/.zshrc</Code>), then restart Claude Code:</P>
        <Block dark={dark}>{`export USPTO_API_KEY="your_key"
export WIPO_API_KEY="your_key"   # optional`}</Block>

        <H3 dark={dark}>Project Structure</H3>
        <Block dark={dark}>{`markman/
├── .claude-plugin/plugin.json    # Plugin manifest
├── .mcp.json                     # MCP server config
├── mcp/
│   ├── uspto-server.js           # 4 tools, rate-limited
│   └── wipo-server.js            # 2 tools, with PATENTSCOPE fallback
├── skills/                       # Auto-fire on context
│   ├── patent-analysis.md
│   ├── fto-memo.md
│   ├── trademark-screen.md
│   └── ip-triage.md
├── commands/                     # /slash invocation
│   ├── review-claims.md
│   ├── fto-analysis.md
│   └── tm-clearance.md
├── playbooks/ip-playbook.md      # Firm-specific config
└── package.json`}</Block>

        {/* ── GLOSSARY ── */}
        <H2 dark={dark} id="glossary">IP Glossary</H2>
        <P dark={dark}>
          Key terms used throughout Markman and IP law practice. Written for attorneys who don't specialize in IP and law students entering the field.
        </P>

        {[
          { cat: 'Patent Terms', terms: [
            { term: 'Patent', def: 'A government-granted right to exclude others from making, using, or selling an invention for a limited time (20 years from filing in the US). Types: utility, design, plant.' },
            { term: 'Claim', def: 'The legally operative part of a patent. Claims define exactly what the patent covers. Independent claims stand alone; dependent claims refer back to and narrow an independent claim.' },
            { term: 'Independent Claim', def: 'A patent claim that stands on its own without referring to any other claim. Defines the broadest scope of protection.' },
            { term: 'Dependent Claim', def: 'A claim that refers back to (and narrows) an independent claim or another dependent claim. E.g., "The method of claim 1, wherein the neural network is a transformer."' },
            { term: 'Prior Art', def: 'Any publicly available evidence that your invention was already known before your filing date. Includes patents, publications, products, public demonstrations.' },
            { term: 'Prosecution', def: 'The back-and-forth process between a patent applicant and the USPTO to get a patent granted. Includes office actions, amendments, and arguments.' },
            { term: 'Office Action (OA)', def: 'A written communication from the USPTO examiner, typically rejecting or objecting to some or all claims. Applicants have 3 months (extendable to 6) to respond.' },
            { term: 'Provisional Application', def: 'A lower-cost, informal filing that establishes an early filing date. Must convert to a non-provisional within 12 months or it expires.' },
            { term: 'PCT (Patent Cooperation Treaty)', def: 'An international filing system that lets you seek patent protection in 150+ countries with a single application. Does not grant a patent directly; you must enter "national phase" in each country by month 30.' },
            { term: 'National Phase', def: 'The stage where a PCT application is filed in individual countries. Deadline: 30 months from the earliest priority date (31 months in some jurisdictions like EPO).' },
            { term: 'CPC / IPC Classification', def: 'Cooperative Patent Classification (CPC) and International Patent Classification (IPC): taxonomy systems that categorize patents by technology area. Used for searching prior art.' },
            { term: 'Maintenance Fees', def: 'Fees paid at 3.5, 7.5, and 11.5 years after a US patent grants to keep it in force. If not paid (with a 6-month grace period), the patent expires.' },
            { term: 'Claim Construction (Markman Hearing)', def: 'The process of interpreting the meaning of patent claim terms. Named after Markman v. Westview Instruments (1996). A "Markman hearing" is where a judge decides what disputed claim terms mean, often a critical critical moment in patent litigation.' },
          ]},
          { cat: 'Patentability & Validity', terms: [
            { term: '35 U.S.C. § 101 (Eligibility)', def: 'Patent-eligible subject matter: process, machine, manufacture, or composition of matter. The Alice/Mayo framework tests whether a claim is directed to an abstract idea, law of nature, or natural phenomenon, and if so, whether it adds "significantly more."' },
            { term: 'Alice / Mayo Framework', def: 'Two-step test from Alice Corp. v. CLS Bank (2014): (1) Is the claim directed to an abstract idea? (2) Does it recite an "inventive concept" beyond the abstract idea? Software and AI patents frequently face Alice rejections.' },
            { term: '35 U.S.C. § 103 (Obviousness)', def: 'A patent is invalid if the invention would have been obvious to a person skilled in the art. KSR v. Teleflex (2007) broadened this: combining known elements with predictable results may be obvious.' },
            { term: '35 U.S.C. § 112 (Definiteness)', def: 'Claims must be clear enough that a skilled person can understand their scope. § 112(a) requires enablement and written description. § 112(b) requires definiteness. § 112(f) covers means-plus-function claims.' },
            { term: 'Means-Plus-Function', def: 'A claim element written as a "means for [function]" rather than describing the structure. Interpreted to cover only the structures disclosed in the specification and their equivalents. Risky because it can narrow claims dramatically.' },
            { term: 'Doctrine of Equivalents', def: 'Even if a product doesn\'t literally infringe a claim, it may still infringe if differences are insubstantial. The "function-way-result" test: does it perform substantially the same function, in substantially the same way, to achieve substantially the same result?' },
            { term: 'Prosecution History Estoppel', def: 'Arguments and amendments made during patent prosecution can limit the scope of a patent. If you narrowed a claim to overcome prior art, you can\'t later assert the broader interpretation.' },
          ]},
          { cat: 'Trademark Terms', terms: [
            { term: 'Trademark', def: 'A word, phrase, symbol, design, or combination that identifies the source of goods or services. Protects consumers from confusion about who makes a product.' },
            { term: 'Service Mark', def: 'Same as a trademark, but for services rather than goods. Legally treated the same way.' },
            { term: 'Nice Classification', def: 'International system that categorizes goods and services into 45 classes (1-34 for goods, 35-45 for services). E.g., Class 009 = downloadable software, Class 042 = SaaS.' },
            { term: 'Distinctiveness Spectrum', def: 'From weakest to strongest: Generic (not protectable) → Descriptive (protectable only with acquired distinctiveness) → Suggestive (protectable) → Arbitrary (strong) → Fanciful (strongest). "APPLE" for computers is arbitrary; "APPLE" for apples is generic.' },
            { term: 'Likelihood of Confusion', def: 'The core test for trademark infringement. Would a consumer likely be confused about the source of goods? Analyzed using the DuPont factors (see below).' },
            { term: 'DuPont Factors', def: 'The 8 (sometimes 13) factors used to assess likelihood of confusion: (1) similarity of marks, (2) relatedness of goods/services, (3) similarity of trade channels, (4) conditions of purchase, (5) fame of prior mark, (6) number of similar marks in use, (7) actual confusion evidence, (8) length of concurrent use.' },
            { term: 'TESS', def: 'Trademark Electronic Search System. The USPTO\'s former trademark database, retired in 2023 and replaced by USPTO Trademark Search. Used for preliminary clearance searches.' },
            { term: 'TSDR', def: 'Trademark Status & Document Retrieval: the USPTO system for checking the current status of a trademark application or registration.' },
            { term: 'Section 8 Declaration', def: 'A declaration of continued use filed between years 5-6 after registration. Failure to file results in cancellation.' },
            { term: 'Section 15 (Incontestability)', def: 'Filed after 5 years of continuous use. Makes the registration "incontestable", which limits the grounds on which it can be challenged.' },
            { term: 'Madrid Protocol', def: 'International trademark registration system administered by WIPO. File one application to seek protection in 100+ countries. Managed through the Madrid Monitor system.' },
            { term: 'Opposition', def: 'A proceeding where a third party challenges a trademark application before it registers. Filed within 30 days of publication (extendable). Heard by the Trademark Trial and Appeal Board (TTAB).' },
          ]},
          { cat: 'FTO & Infringement', terms: [
            { term: 'Freedom to Operate (FTO)', def: 'An analysis of whether a product or technology can be commercialized without infringing third-party patent rights. Not the same as patentability: you can have a valid patent and still infringe someone else\'s.' },
            { term: 'Literal Infringement', def: 'When every element of a patent claim is found in the accused product, word for word. The most straightforward form of infringement.' },
            { term: 'Design-Around', def: 'Modifying a product to avoid infringing a patent claim by changing one or more elements so they no longer meet the claim limitations. A key output of FTO analysis.' },
            { term: 'Non-Infringement Argument', def: 'A legal argument that a specific claim limitation is not met by the accused technology. Rated as STRONG (clear structural difference), MODERATE (arguable), or WEAK (risky to rely on).' },
            { term: 'Claim Chart', def: 'A side-by-side comparison mapping each limitation of a patent claim against the corresponding element of a product or technology. The core work product of infringement and FTO analysis.' },
          ]},
          { cat: 'Trade Secret & Copyright', terms: [
            { term: 'Trade Secret', def: 'Information that derives value from being secret, is not generally known, and is subject to reasonable efforts to maintain secrecy. Protected under the Defend Trade Secrets Act (DTSA) and state UTSA laws.' },
            { term: 'NDA (Non-Disclosure Agreement)', def: 'A contract that establishes confidentiality obligations. Critical for maintaining trade secret status when sharing information with partners, investors, or employees.' },
            { term: 'Misappropriation', def: 'The improper acquisition, disclosure, or use of a trade secret. Can occur through breach of confidence, espionage, or reverse engineering (in some cases).' },
            { term: 'Copyright', def: 'Protection for original works of authorship (code, text, images, music). Arises automatically at creation; registration is optional but required for statutory damages and attorney\'s fees in the US.' },
            { term: 'Work for Hire', def: 'When an employee creates a work within the scope of employment, the employer owns the copyright automatically. For contractors, it must be agreed in writing and fit specific categories.' },
            { term: 'Fair Use', def: 'A defense to copyright infringement. Four factors: (1) purpose and character of use, (2) nature of the work, (3) amount used, (4) effect on market value.' },
          ]},
          { cat: 'General IP', terms: [
            { term: 'Priority Date', def: 'The earliest filing date from which patent rights are measured. Established by the first-filed application (provisional, non-provisional, or foreign). Most deadlines count from this date.' },
            { term: 'Grace Period', def: 'In the US, inventors have 12 months after public disclosure to file a patent without losing rights. Many other countries have no grace period, so public disclosure before filing can bar a patent.' },
            { term: 'On-Sale Bar', def: 'If an invention was sold, offered for sale, or in public use more than 1 year before the US filing date, the patent is invalid. AIA changed this to "effectively filed" date.' },
            { term: 'Attorney Work Product', def: 'Documents prepared in anticipation of litigation that are protected from discovery. Whether a document qualifies depends on the facts and the jurisdiction; a label alone does not create protection.' },
            { term: 'FRAND', def: 'Fair, Reasonable, and Non-Discriminatory: licensing terms required for standard-essential patents (SEPs). Relevant when a patented technology is incorporated into an industry standard (e.g., 5G, Wi-Fi).' },
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
