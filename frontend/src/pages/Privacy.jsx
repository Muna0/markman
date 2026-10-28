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

        <h1 className={`text-[28px] tracking-[-0.02em] font-bold mb-2 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Privacy Policy</h1>
        <p className={`mono text-[13px] mb-10 ${dark ? 'text-ink-400' : 'text-ink-500'}`}>Last updated: October 28, 2026</p>

        <div className={`space-y-8 text-[16px] leading-[1.8] ${dark ? 'text-ink-300' : 'text-ink-600'}`}>
          <section>
            <h2 className={`text-[20px] tracking-[-0.01em] font-bold mb-3 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Overview</h2>
            <p>
              Markman is an open-source Claude Code plugin for intellectual property law analysis, with a public web demo. This privacy policy explains how data is handled when you use the plugin or the demo.
            </p>
          </section>

          <section>
            <h2 className={`text-[20px] tracking-[-0.01em] font-bold mb-3 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Data Collection</h2>
            <p className="mb-3">The public demo has no accounts and does not save your inputs or results on the server. Here is what happens to your data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Analysis history</strong> stays in this browser's local storage. You can clear it at any time from the Dashboard.</li>
              <li><strong>Daily limit counter.</strong> The server keeps an in-memory count of analyses per IP address to enforce the daily limit. The count is cleared daily and is never written to disk.</li>
              <li><strong>Nothing else.</strong> Beyond this, Markman does not collect personal information or run analytics, tracking pixels, or telemetry. Our hosting provider may keep standard infrastructure logs.</li>
            </ul>
            <p className="mt-4">If you run Markman locally as a Claude Code plugin, your API keys, history, deadlines, and exports stay on your own machine.</p>
          </section>

          <section>
            <h2 className={`text-[20px] tracking-[-0.01em] font-bold mb-3 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Third-Party Services</h2>
            <p className="mb-3">Using the demo sends data to two outside services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>USPTO Open Data Portal.</strong> Patent and trademark searches are sent to the United States Patent and Trademark Office. This is a U.S. government service.</li>
              <li><strong>Anthropic API.</strong> The text you submit for analysis is sent to Anthropic's API to generate the analysis. Anthropic's privacy policy applies: anthropic.com/privacy</li>
            </ul>
            <p className="mt-4">
              Markman does not control how these third parties handle your data. Review their respective privacy policies for details.
            </p>
          </section>

          <section>
            <h2 className={`text-[20px] tracking-[-0.01em] font-bold mb-3 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Data Security</h2>
            <p>
              The demo does not persist your inputs or results on the server; requests are processed in memory to run the search or analysis. History lives only in your browser. Communication with third-party APIs (Anthropic and USPTO) uses HTTPS encryption.
            </p>
          </section>

          <section>
            <h2 className={`text-[20px] tracking-[-0.01em] font-bold mb-3 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Attorney-Client Privilege</h2>
            <p>
              Markman is designed with privilege awareness. FTO memos are automatically marked as Attorney Work Product. However, users are responsible for maintaining privilege over their own analysis outputs. Sending queries to third-party APIs (Anthropic, USPTO) may have implications for privilege that users should evaluate with their own counsel.
            </p>
          </section>

          <section>
            <h2 className={`text-[20px] tracking-[-0.01em] font-bold mb-3 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Open Source</h2>
            <p>
              Markman is open source under the Apache-2.0 license. You can inspect every line of code to verify exactly what data is collected, stored, and transmitted. The source code is the authoritative reference for data handling behavior.
            </p>
          </section>

          <section>
            <h2 className={`text-[20px] tracking-[-0.01em] font-bold mb-3 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Changes to This Policy</h2>
            <p>
              This privacy policy may be updated as Markman evolves. Changes will be reflected in the repository and this page. The "last updated" date at the top indicates the most recent revision.
            </p>
          </section>

          <section>
            <h2 className={`text-[20px] tracking-[-0.01em] font-bold mb-3 ${dark ? 'text-ink-50' : 'text-ink-950'}`}>Contact</h2>
            <p>
              For questions about this privacy policy or data handling, contact us via the GitHub repository.
            </p>
          </section>
        </div>

        <div className={`mt-12 pt-8 border-t ${dark ? 'border-ink-800' : 'border-ink-200'}`}>
          <p className={`mono text-[12px] ${dark ? 'text-ink-500' : 'text-ink-400'}`}>
            Markman v1.1.0 | Apache-2.0 License | Claude Code Plugin for IP Law
          </p>
        </div>
      </div>
    </div>
  )
}
