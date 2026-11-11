"use client";

import Link from "next/link";

export default function TermsOfService() {
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
              Terms of Service
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Last updated: November 2026
            </p>
          </header>

          <section className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using Game Hub ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part, you may not use the Service.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">2. Description of Service</h2>
              <p>Game Hub provides free browser-based games and tools including Battle Arena, Dice Spinner, Match Columns, Character Creator, Tournament Brackets, Score Tracker, Custom Rules, and Battle Replay. The Service is provided "as is" for entertainment purposes.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">3. No Account Required</h2>
              <p>You do not need to create an account to use Game Hub. All game data is stored locally in your browser&apos;s <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono">localStorage</code>. We have no access to your data.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">4. Advertising & Revenue</h2>
              <p>Game Hub is ad-supported to remain free. We display:</p>
              <ul className="list-disc list-inside mt-3 space-y-2">
                <li><strong>Web (Google AdSense):</strong> Contextual banner and in-article ads</li>
                <li><strong>Android (Google AdMob):</strong> Rewarded video ads (user-initiated for bonuses) and interstitial ads</li>
              </ul>
              <p className="mt-3">We do <strong>not</strong> use personalized/behavioral advertising. Ads are contextual only. By using the Service, you consent to the display of these ads.</p>
              <p className="mt-3">Ad interactions are governed by <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-700">Google&apos;s Advertising Policies</a>.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">5. User Conduct</h2>
              <p>You agree not to:</p>
              <ul className="list-disc list-inside mt-3 space-y-2">
                <li>Reverse engineer, decompile, or attempt to extract source code</li>
                <li>Use automated scripts, bots, or scrapers on the Service</li>
                <li>Attempt to interfere with ad delivery or measurement</li>
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Upload offensive, illegal, or copyrighted content as custom images</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">6. Intellectual Property</h2>
              <p>The Service&apos;s original code, design, and content are owned by the developer. Game mechanics and rules are not copyrightable. You retain ownership of any custom content you create (character names, uploaded images, tournament brackets).</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">7. Third-Party Services</h2>
              <p>The Service integrates with:</p>
              <ul className="list-disc list-inside mt-3 space-y-2">
                <li><strong>Google AdSense/AdMob:</strong> Advertising — see <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-700">Google Privacy Policy</a></li>
                <li><strong>picsum.photos:</strong> Placeholder images — see their terms</li>
                <li><strong>Google Fonts:</strong> Typography — see <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-700">Google Privacy Policy</a></li>
                <li><strong>Capacitor:</strong> Android app wrapper — MIT licensed</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">8. Disclaimer of Warranties</h2>
              <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">9. Limitation of Liability</h2>
              <p>IN NO EVENT SHALL THE DEVELOPER BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF DATA, PROFITS, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE. TOTAL LIABILITY SHALL NOT EXCEED $0 (THE SERVICE IS FREE).</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">10. Android App Specific Terms</h2>
              <p>The Android app (built with Capacitor) includes:</p>
              <ul className="list-disc list-inside mt-3 space-y-2">
                <li>Rewarded ads: Optional video ads for in-game bonuses (extra battles, extra dice)</li>
                <li>Interstitial ads: Full-screen ads between game sessions</li>
                <li>No additional permissions beyond internet access for ads</li>
                <li>Same local-only data storage as web version</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">11. Changes to Terms</h2>
              <p>We may modify these Terms. Continued use after changes constitutes acceptance. Check this page periodically.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">12. Governing Law</h2>
              <p>These Terms are governed by the laws of the jurisdiction where the developer resides, without regard to conflict of law principles.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">13. Contact</h2>
              <p>Questions? Open an issue on our <a href="https://github.com" className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-700" target="_blank" rel="noopener noreferrer">GitHub repository</a>.</p>
            </div>
          </section>

          <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Game Hub — Free • Ad-supported • No tracking</p>
          </footer>
        </article>
      </div>
    </div>
  );
}