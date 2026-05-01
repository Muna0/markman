import { useTheme } from '../store/ThemeContext'
import { Link } from 'react-router-dom'
import { MarkmanWordmark } from '../components/Logo'

export default function Privacy() {
  const { dark } = useTheme()

  return (
    <div className={`min-h-screen ${dark ? 'bg-ink-950 text-ink-200' : 'bg-ink-25 text-ink-600'}`}>
      <div className="max-w-[720px] mx-auto px-6 py-16">
        <Link to="/" className="inline-block mb-10">
          <MarkmanWordmark size={36} dark={dark} />
        </Link>

        <h1 className={`serif text-[36px] font-bold mb-2 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Privacy Policy</h1>
        <p className={`mono text-[13px] mb-10 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>Last updated: May 1, 2026</p>

        <div className={`space-y-8 text-[16px] leading-[1.8] ${dark ? 'text-ink-300' : 'text-ink-600'}`}>
          <section>
            <h2 className={`serif text-[22px] font-bold mb-3 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Overview</h2>
            <p>
              Markman is an open-source Claude Code plugin for intellectual property law analysis. This privacy policy explains how data is handled when you use the Markman plugin, web application, or associated services.
            </p>
          </section>

          <section>
            <h2 className={`serif text-[22px] font-bold mb-3 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Data Collection</h2>
            <p className="mb-3"><strong>What Markman stores locally:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li>API keys you configure (stored in your local .env file, never transmitted to Markman servers)</li>
              <li>Analysis history (stored locally in markman-data/history.json on your machine)</li>
              <li>Deadline tracking data (stored locally in markman-data/deadlines.json)</li>
              <li>Exported documents (stored locally in markman-data/exports/)</li>
              <li>Playbook configuration preferences (stored locally)</li>
            </ul>
            <p className="mt-4 mb-3"><strong>What Markman does NOT collect:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We do not collect, store, or transmit your personal information to any Markman-operated server</li>
              <li>We do not have analytics, tracking pixels, or telemetry</li>
              <li>We do not store your API keys on any remote server</li>
              <li>We do not have access to your analysis outputs or matter data</li>
            </ul>
          </section>

          <section>
            <h2 className={`serif text-[22px] font-bold mb-3 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Third-Party Services</h2>
            <p className="mb-3">When you use Markman, your queries may be sent to the following third-party services using API keys you provide:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Anthropic (Claude API)</strong> — Your analysis queries are sent to Anthropic's API for processing. Anthropic's privacy policy applies: anthropic.com/privacy</li>
              <li><strong>USPTO Open Data Portal</strong> — Patent and trademark search queries are sent to the United States Patent and Trademark Office API. This is a U.S. government service.</li>
              <li><strong>WIPO CASE</strong> — International patent queries are sent to the World Intellectual Property Organization API.</li>
            </ul>
            <p className="mt-4">
              Markman does not control how these third parties handle your data. Review their respective privacy policies for details.
            </p>
          </section>

          <section>
            <h2 className={`serif text-[22px] font-bold mb-3 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Data Security</h2>
            <p>
              All data is stored locally on your machine. API keys are stored in environment files that are excluded from version control (.gitignore). The plugin does not transmit data to any server operated by Markman. Communication with third-party APIs (Anthropic, USPTO, WIPO) uses HTTPS encryption.
            </p>
          </section>

          <section>
            <h2 className={`serif text-[22px] font-bold mb-3 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Attorney-Client Privilege</h2>
            <p>
              Markman is designed with privilege awareness. FTO memos are automatically marked as Attorney Work Product. However, users are responsible for maintaining privilege over their own analysis outputs. Sending queries to third-party APIs (Anthropic, USPTO) may have implications for privilege that users should evaluate with their own counsel.
            </p>
          </section>

          <section>
            <h2 className={`serif text-[22px] font-bold mb-3 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Open Source</h2>
            <p>
              Markman is open source under the Apache-2.0 license. You can inspect every line of code to verify exactly what data is collected, stored, and transmitted. The source code is the authoritative reference for data handling behavior.
            </p>
          </section>

          <section>
            <h2 className={`serif text-[22px] font-bold mb-3 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Changes to This Policy</h2>
            <p>
              This privacy policy may be updated as the plugin evolves. Changes will be reflected in the plugin repository and this page. The "last updated" date at the top indicates the most recent revision.
            </p>
          </section>

          <section>
            <h2 className={`serif text-[22px] font-bold mb-3 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Contact</h2>
            <p>
              For questions about this privacy policy or data handling: muna.m.omar@gmail.com
            </p>
          </section>
        </div>

        <div className={`mt-12 pt-8 border-t ${dark ? 'border-ink-800' : 'border-ink-200'}`}>
          <p className={`mono text-[12px] ${dark ? 'text-ink-500' : 'text-ink-400'}`}>
            Markman v1.1.0 — Apache-2.0 License — Claude Code Plugin for IP Law
          </p>
        </div>
      </div>
    </div>
  )
}
