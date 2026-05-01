import { useState } from 'react'
import { ShieldCheck, ChevronRight, Loader2, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react'
import { useTheme } from '../store/ThemeContext'
import { api } from '../store/api'
import ClaudeAnalysis from '../components/ClaudeAnalysis'

const SAMPLE_RESULT = {
  risk: 'MEDIUM',
  summary: 'Two patents identified with claims potentially reading on the technology. One presents medium infringement risk with reasonable non-infringement arguments; the other is low risk. Design-around options are feasible for the medium-risk patent.',
  technology: {
    name: 'Transformer-Based Medical Record Extraction',
    elements: [
      'Fine-tuned transformer model for clinical text NER',
      'FHIR-compliant JSON output schema',
      'On-device inference for HIPAA compliance',
      'Custom tokenizer trained on medical terminology',
    ],
  },
  patents: [
    {
      number: 'US 10,456,789',
      title: 'System for Extracting Structured Medical Data Using Neural Networks',
      assignee: 'HealthAI Corp.',
      expires: '2037-06-15',
      maintained: true,
      risk: 'MEDIUM',
      claims: [
        {
          num: 1,
          elements: [
            { claimElement: 'A method for extracting structured data from medical records', techElement: 'Core functionality matches', status: 'MEETS' },
            { claimElement: 'using a recurrent neural network trained on clinical text', techElement: 'Our system uses transformers, not RNNs', status: 'DOES NOT MEET' },
            { claimElement: 'outputting data in a standardized healthcare format', techElement: 'FHIR JSON output - standardized format', status: 'MEETS' },
            { claimElement: 'wherein the extraction is performed on a remote server', techElement: 'Our system runs on-device, not remote', status: 'DOES NOT MEET' },
          ],
        },
      ],
      nonInfringement: [
        { argument: 'Different neural architecture (transformer vs. RNN) - structural distinction', strength: 'STRONG' },
        { argument: 'On-device vs. remote server processing - express claim limitation not met', strength: 'STRONG' },
        { argument: 'Prosecution history shows narrowing amendments to "recurrent" network', strength: 'MODERATE' },
      ],
      designArounds: [
        { option: 'Maintain transformer architecture (already distinct)', feasibility: 'Already implemented', impact: 'None', newRisk: false },
        { option: 'Ensure on-device only deployment is documented', feasibility: 'Easy', impact: 'None', newRisk: false },
      ],
    },
    {
      number: 'US 11,234,567',
      title: 'FHIR Data Conversion from Unstructured Clinical Notes',
      assignee: 'MedConvert Inc.',
      expires: '2040-02-20',
      maintained: true,
      risk: 'LOW',
      claims: [
        {
          num: 1,
          elements: [
            { claimElement: 'Converting unstructured clinical notes to FHIR resources', techElement: 'Functionally similar', status: 'MEETS' },
            { claimElement: 'using a rule-based NLP pipeline with dictionary lookup', techElement: 'Our system uses ML, not rule-based NLP', status: 'DOES NOT MEET' },
            { claimElement: 'mapping extracted entities to FHIR resource types via ontology', techElement: 'Our mapping is learned, not ontology-based', status: 'DOES NOT MEET' },
          ],
        },
      ],
      nonInfringement: [
        { argument: 'ML-based extraction vs. rule-based NLP pipeline - fundamentally different approach', strength: 'STRONG' },
        { argument: 'Learned mapping vs. ontology-based mapping - no dictionary lookup step', strength: 'STRONG' },
      ],
      designArounds: [],
    },
  ],
}

function RiskBanner({ risk }) {
  const { dark } = useTheme()
  const config = {
    HIGH: {
      bg: dark ? 'bg-red-950/30 border-red-900' : 'bg-red-50 border-red-200',
      icon: dark ? 'text-red-400' : 'text-red-600',
      label: 'HIGH RISK',
    },
    MEDIUM: {
      bg: dark ? 'bg-amb-950/30 border-amb-900' : 'bg-amb-50 border-amb-200',
      icon: dark ? 'text-amb-400' : 'text-amb-600',
      label: 'MEDIUM RISK',
    },
    LOW: {
      bg: dark ? 'bg-grn-950/30 border-grn-900' : 'bg-grn-50 border-grn-200',
      icon: dark ? 'text-grn-400' : 'text-grn-600',
      label: 'LOW RISK',
    },
  }
  const c = config[risk]
  return (
    <div className={`rounded-xl p-6 border ${c.bg}`}>
      <div className="flex items-center gap-3 mb-3">
        <AlertTriangle className={`w-6 h-6 ${c.icon}`} />
        <h2 className="text-xl font-bold">Overall FTO Risk: {c.label}</h2>
      </div>
      <p className="text-sm">{SAMPLE_RESULT.summary}</p>
    </div>
  )
}

function StrengthBadge({ strength }) {
  const { dark } = useTheme()
  const styles = {
    STRONG: dark ? 'bg-grn-950 text-grn-400' : 'bg-grn-100 text-grn-700',
    MODERATE: dark ? 'bg-amb-950 text-amb-400' : 'bg-amb-100 text-amb-700',
    WEAK: dark ? 'bg-red-950 text-red-400' : 'bg-red-100 text-red-700',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[strength]}`}>{strength}</span>
}

function StatusIcon({ status }) {
  if (status === 'MEETS') return <AlertTriangle className="w-4 h-4 text-red-500" />
  return <CheckCircle2 className="w-4 h-4 text-grn-500" />
}

export default function FtoAnalysis() {
  const { dark } = useTheme()
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submittedQuery, setSubmittedQuery] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!description.trim()) return
    setSubmittedQuery(description)
    setSubmitted(true)
    api.logMatter('fto-memo', `FTO: ${description.slice(0, 60)}`, 'Analysis submitted', 'UNKNOWN', description)
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amb-500 to-amb-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">FTO Analysis</h1>
            <p className={`text-sm ${dark ? 'text-ink-400' : 'text-ink-500'}`}>Freedom-to-operate risk assessment</p>
          </div>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className={`rounded-xl border p-6 mb-6 ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
        <label className="block text-sm font-medium mb-2">Describe the technology, product, or feature to clear</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={6}
          placeholder="Example: Our product uses a transformer-based model to extract structured data from unstructured medical records. Key features: fine-tuned on clinical text, outputs FHIR-compliant JSON, runs on-device for HIPAA compliance. Custom tokenizer trained on medical terminology corpus."
          className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blu-500 focus:border-transparent resize-none placeholder:text-ink-400 ${dark ? 'border-ink-700 bg-ink-800' : 'border-ink-300 bg-ink-50'}`}
        />
        <div className={`mt-4 rounded-lg border p-3 ${dark ? 'bg-ink-800 border-ink-700' : 'bg-ink-50 border-ink-200'}`}>
          <p className={`text-xs ${dark ? 'text-ink-400' : 'text-ink-500'}`}>
            <strong>Tip:</strong> Include: (1) what the technology does, (2) how it works technically, (3) key differentiating features, and (4) target market context.
          </p>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={!description.trim() || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blu-600 text-white text-sm font-medium hover:bg-blu-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            {loading ? 'Analyzing...' : 'Run FTO Analysis'}
          </button>
        </div>
      </form>

      {/* Results — Claude Analysis Only */}
      {submitted && (
        <div className="space-y-6">
          {/* Privilege Banner */}
          <div className={`rounded-lg px-4 py-2.5 text-[13px] font-semibold text-center tracking-wide uppercase ${dark ? 'bg-ink-100 text-ink-900' : 'bg-ink-900 text-white'}`}>
            Attorney Work Product / Privileged and Confidential
          </div>

          {/* Claude FTO Analysis */}
          <ClaudeAnalysis
            query={`Run a full freedom-to-operate analysis for this technology: ${submittedQuery}. Identify potentially blocking U.S. patents, map each claim limitation against the technology element-by-element, assess literal infringement and doctrine of equivalents, rate non-infringement arguments as STRONG/MODERATE/WEAK, propose specific design-around options for any HIGH or MEDIUM risk claims, and provide an overall FTO risk rating (HIGH/MEDIUM/LOW) with rationale. Follow the FTO memo skill definition exactly.`}
            skillType="fto"
            context={`Technology description: ${submittedQuery}`}
          />

          {/* Disclaimer */}
          <div className={`rounded-lg border p-4 text-[13px] italic ${dark ? 'bg-ink-800 border-ink-700 text-ink-400' : 'bg-ink-100 border-ink-200 text-ink-500'}`}>
            This FTO analysis is a risk assessment and does not constitute a definitive "freedom to operate" opinion. Analysis covers U.S. patents only. All patent numbers, claim constructions, and legal conclusions should be verified by licensed patent counsel before reliance.
          </div>
        </div>
      )}
    </div>
  )
}
