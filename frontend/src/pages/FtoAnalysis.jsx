import { useState } from 'react'
import { ShieldCheck, ChevronRight, Loader2, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react'
import { useTheme } from '../store/ThemeContext'

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
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    if (!description.trim()) return
    setLoading(true)
    setResult(null)
    setTimeout(() => {
      setResult(SAMPLE_RESULT)
      setLoading(false)
    }, 2500)
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

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Privilege Banner */}
          <div className={`rounded-lg px-4 py-2.5 text-xs font-semibold text-center tracking-wide uppercase ${dark ? 'bg-ink-100 text-ink-900' : 'bg-ink-900 text-white'}`}>
            Attorney Work Product / Privileged and Confidential
          </div>

          {/* Risk */}
          <RiskBanner risk={result.risk} />

          {/* Technology Description */}
          <div className={`rounded-xl border p-6 ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
            <h2 className="text-lg font-semibold mb-4">Technology Under Analysis</h2>
            <p className="font-medium text-sm mb-3">{result.technology.name}</p>
            <div className="space-y-2">
              {result.technology.elements.map((el, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <ArrowRight className="w-4 h-4 text-blu-500 mt-0.5 shrink-0" />
                  <span>{el}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Patent Analysis Cards */}
          {result.patents.map(p => (
            <div key={p.number} className={`rounded-xl border overflow-hidden ${dark ? 'bg-ink-900 border-ink-800' : 'bg-white border-ink-200'}`}>
              {/* Patent Header */}
              <div className={`px-6 py-4 border-b flex items-center justify-between ${
                p.risk === 'HIGH' ? (dark ? 'bg-red-950/30 border-red-900' : 'bg-red-50 border-red-200') :
                p.risk === 'MEDIUM' ? (dark ? 'bg-amb-950/30 border-amb-900' : 'bg-amb-50 border-amb-200') :
                (dark ? 'bg-grn-950/30 border-grn-900' : 'bg-grn-50 border-grn-200')
              }`}>
                <div>
                  <h3 className="font-bold text-sm">{p.number}</h3>
                  <p className={`text-xs mt-0.5 ${dark ? 'text-ink-400' : 'text-ink-600'}`}>{p.title}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  p.risk === 'HIGH' ? (dark ? 'bg-red-900 text-red-300' : 'bg-red-200 text-red-800') :
                  p.risk === 'MEDIUM' ? (dark ? 'bg-amb-900 text-amb-300' : 'bg-amb-200 text-amb-800') :
                  (dark ? 'bg-grn-900 text-grn-300' : 'bg-grn-200 text-grn-800')
                }`}>{p.risk} RISK</span>
              </div>

              <div className="p-6 space-y-6">
                {/* Patent Info */}
                <div className="flex flex-wrap gap-6 text-sm">
                  <div><span className="text-ink-500">Assignee:</span> <span className="font-medium">{p.assignee}</span></div>
                  <div><span className="text-ink-500">Expires:</span> <span className="font-medium">{p.expires}</span></div>
                  <div><span className="text-ink-500">Maintained:</span> <span className="font-medium">{p.maintained ? 'Yes' : 'No'}</span></div>
                </div>

                {/* Claim Mapping */}
                <div>
                  <h4 className="font-semibold text-sm mb-3">Claim-by-Claim Analysis</h4>
                  {p.claims.map(c => (
                    <div key={c.num} className="mb-4">
                      <p className={`text-xs font-semibold mb-2 ${dark ? 'text-blu-400' : 'text-blu-600'}`}>Claim {c.num}</p>
                      <div className="space-y-2">
                        {c.elements.map((el, i) => (
                          <div key={i} className={`rounded-lg p-3 border ${dark ? 'bg-ink-800 border-ink-700' : 'bg-ink-50 border-ink-200'}`}>
                            <div className="flex items-start gap-3">
                              <StatusIcon status={el.status} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <p className="text-xs font-medium">{el.claimElement}</p>
                                  <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${
                                    el.status === 'MEETS' ? (dark ? 'bg-red-950 text-red-400' : 'bg-red-100 text-red-700') :
                                    (dark ? 'bg-grn-950 text-grn-400' : 'bg-grn-100 text-grn-700')
                                  }`}>{el.status}</span>
                                </div>
                                <p className={`text-xs ${dark ? 'text-ink-400' : 'text-ink-500'}`}>{el.techElement}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Non-Infringement Arguments */}
                <div>
                  <h4 className="font-semibold text-sm mb-3">Non-Infringement Arguments</h4>
                  <div className="space-y-2">
                    {p.nonInfringement.map((a, i) => (
                      <div key={i} className={`flex items-center justify-between gap-3 rounded-lg p-3 border ${dark ? 'bg-ink-800 border-ink-700' : 'bg-ink-50 border-ink-200'}`}>
                        <span className="text-sm">{a.argument}</span>
                        <StrengthBadge strength={a.strength} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Design-Around Options */}
                {p.designArounds.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Design-Around Options</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className={`border-b ${dark ? 'border-ink-700' : 'border-ink-200'}`}>
                            <th className="text-left py-2 pr-4 font-medium text-ink-500">Option</th>
                            <th className="text-left py-2 pr-4 font-medium text-ink-500">Feasibility</th>
                            <th className="text-left py-2 pr-4 font-medium text-ink-500">Impact</th>
                            <th className="text-left py-2 font-medium text-ink-500">New Risk?</th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.designArounds.map((d, i) => (
                            <tr key={i} className={`border-b last:border-0 ${dark ? 'border-ink-800' : 'border-ink-100'}`}>
                              <td className="py-3 pr-4">{d.option}</td>
                              <td className={`py-3 pr-4 ${dark ? 'text-ink-400' : 'text-ink-600'}`}>{d.feasibility}</td>
                              <td className={`py-3 pr-4 ${dark ? 'text-ink-400' : 'text-ink-600'}`}>{d.impact}</td>
                              <td className="py-3">
                                {d.newRisk ? <AlertTriangle className="w-4 h-4 text-amb-500" /> : <CheckCircle2 className="w-4 h-4 text-grn-500" />}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Disclaimer */}
          <div className={`rounded-lg border p-4 text-xs italic ${dark ? 'bg-ink-800 border-ink-700 text-ink-400' : 'bg-ink-100 border-ink-200 text-ink-500'}`}>
            This FTO analysis is a risk assessment and does not constitute a definitive "freedom to operate" opinion. Analysis covers U.S. patents only. All patent numbers, claim constructions, and legal conclusions should be verified by licensed patent counsel before reliance.
          </div>
        </div>
      )}
    </div>
  )
}
