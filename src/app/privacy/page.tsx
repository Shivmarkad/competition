"use client";

import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4 safe-top safe-bottom">
      <div className="container max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 min-h-[48px]"
        >
          ← Back to Home
        </Link>

        <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 glass-strong border border-white/20 animate-fade-in-up">
          <header className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Last updated: November 2026
            </p>
          </header>

          <section className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">1. Information We Collect</h2>
              <p>Game Hub is designed with privacy in mind. We <strong>do not collect</strong> any personally identifiable information. No accounts, no emails, no tracking.</p>
              <p>The only data stored is game state (scores, competitor names, dice counts) saved locally in your browser&apos;s <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono">localStorage</code>. This data never leaves your device.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">2. Local Storage</h2>
              <p>We use <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono">localStorage</code> to persist:</p>
              <ul className="list-disc list-inside mt-3 space-y-2">
                <li>Battle Arena: competitor names, images, scores, settings</li>
                <li>Dice Spinner: dice count, last roll totals</li>
                <li>Match Columns: game state</li>
                <li>Tools: character data, tournament brackets, score history</li>
                <li>User preferences: sound, music, card size, dark mode</li>
              </ul>
              <p className="mt-3">You can clear this data anytime via your browser settings or the "Reset" buttons in each game.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">3. Third-Party Services</h2>
              <p>We use the following external services:</p>
              <ul className="list-disc list-inside mt-3 space-y-2">
                <li><strong>picsum.photos</strong> — placeholder images for competitor avatars (no personal data sent)</li>
                <li><strong>Google AdSense</strong> — displays ads on the web version (see Ads section below)</li>
                <li><strong>Google AdMob</strong> — displays rewarded/interstitial ads in the Android app (see Ads section below)</li>
                <li><strong>Google Fonts</strong> — Geist font family (loaded from fonts.gstatic.com)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">4. Advertising</h2>
              <p>To keep Game Hub free, we display advertisements:</p>
              <ul className="list-disc list-inside mt-3 space-y-2">
                <li><strong>Web (AdSense):</strong> Contextual banner and in-article ads. No behavioral tracking.</li>
                <li><strong>Android (AdMob):</strong> Rewarded video ads (opt-in for bonuses) and interstitials between games.</li>
              </ul>
              <p className="mt-3">We do <strong>not</strong> use personalized/behavioral advertising. Ads are contextual only. See our <a href="/terms" className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-700">Terms of Service</a> for more details.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">5. Cookies & Consent</h2>
              <p>We use a cookie consent banner to comply with GDPR/CCPA. You can accept or reject non-essential cookies. Essential cookies (session, preferences) are always active.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">6. Children&apos;s Privacy</h2>
              <p>Game Hub is not directed at children under 13. We do not knowingly collect data from children. If you believe a child has provided personal information, please contact us.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">7. Data Retention</h2>
              <p>Local storage data persists until you clear it. We have no server-side data retention because we don&apos;t store anything on our servers.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">8. Your Rights</h2>
              <ul className="list-disc list-inside mt-3 space-y-2">
                <li>Access: All your data is visible in the app</li>
                <li>Deletion: Clear localStorage or use in-app reset buttons</li>
                <li>Opt-out: Reject cookies via consent banner</li>
                <li>Portability: Export data manually from browser dev tools</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">9. Changes to This Policy</h2>
              <p>We may update this policy. Changes will be posted here with an updated "Last updated" date.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">10. Contact</h2>
              <p>Questions about this policy? Open an issue on our <a href="https://github.com" className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-700" target="_blank" rel="noopener noreferrer">GitHub repository</a>.</p>
            </div>
          </section>

          <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Game Hub — No tracking • No accounts • Just games</p>
          </footer>
        </article>
      </div>
    </div>
  );
}