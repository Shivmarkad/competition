"use client";

import Link from "next/link";

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  gradient: string;
  color: string;
  features: string[];
  comingSoon?: boolean;
}

const TOOLS: Tool[] = [
  {
    id: "character-creator",
    title: "Character Creator",
    description: "Design custom characters with images, colors, and accessories. Export directly to Battle Arena!",
    icon: "🎨",
    href: "/tools/character-creator",
    gradient: "gradient-battle",
    color: "battle",
    features: ["Image Upload", "Color Themes", "Name Generator", "PNG Export", "Preset Library"],
  },
  {
    id: "tournament-bracket",
    title: "Tournament Bracket",
    description: "Create single & double elimination brackets for 4-64 players. Print, share, and track results.",
    icon: "🏆",
    href: "/tools/tournament-bracket",
    gradient: "gradient-dice",
    color: "dice",
    features: ["Single/Double Elim", "Drag-to-Seed", "PDF/PNG Export", "Auto Schedule", "Local Storage"],
  },
  {
    id: "score-tracker",
    title: "Score Tracker",
    description: "Track battle history, win rates, and streaks over time. Export data and view visual statistics.",
    icon: "📊",
    href: "/tools/score-tracker",
    gradient: "gradient-match",
    color: "match",
    features: ["Battle History", "Win Rate Charts", "Streak Tracking", "CSV/JSON Export", "Persistent Stats"],
  },
  {
    id: "custom-rules",
    title: "Custom Rules",
    description: "Create and share house rules: team mode, point targets, handicaps, streak limits, and more.",
    icon: "⚙️",
    href: "/tools/custom-rules",
    gradient: "gradient-battle",
    color: "battle",
    features: ["Rule Builder", "Preset Library", "Shareable URLs", "Import/Export JSON", "Quick Apply"],
  },
  {
    id: "battle-replay",
    title: "Battle Replay",
    description: "Record battles, replay animations, and generate shareable result cards for social media.",
    icon: "🎬",
    href: "/tools/battle-replay",
    gradient: "gradient-dice",
    color: "dice",
    features: ["Battle Recording", "Canvas Replay", "GIF/Video Export", "Share Cards", "Timestamp Log"],
    comingSoon: true,
  },
];

export default function ToolsHub() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4 safe-top safe-bottom">
      <div className="container">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 min-h-[48px]"
        >
          ← Back to Games
        </Link>

        {/* Header */}
        <header className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass border border-white/20 mb-6 animate-scale-in stagger-1">
            <span className="text-2xl">🛠️</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">Battle Arena Tools</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gradient-battle mb-6 animate-fade-in-up stagger-2">
            Companion Tools
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto animate-fade-in-up stagger-3">
            Enhance your Battle Arena experience with powerful companions for characters, tournaments, stats & more.
          </p>
        </header>

        {/* Tools Grid */}
        <main className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {TOOLS.map((tool, index) => (
              <article
                key={tool.id}
                className="group relative overflow-hidden rounded-2xl glass-strong border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${100 + index * 100}ms` }}
              >
                {/* Gradient Mesh Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
                <div className={`absolute inset-0 ${tool.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />

                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Coming Soon Badge */}
                {tool.comingSoon && (
                  <div className="absolute top-4 right-4 z-10 animate-pulse-soft">
                    <span className="bg-amber-500/90 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                      Coming Soon
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="relative p-6 md:p-8 flex flex-col h-full">
                  {/* Icon with floating animation */}
                  <div className="relative mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg animate-float">
                      <span className="text-5xl group-hover:rotate-12 transition-transform duration-300">{tool.icon}</span>
                    </div>
                    {/* Pulse ring */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-current/20 animate-ping-slow" style={{ borderColor: `var(--${tool.color}-primary)` }} />
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r">
                    {tool.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 mb-6 flex-1 line-clamp-3">
                    {tool.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6" role="list" aria-label={`${tool.title} features`}>
                    {tool.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                        <span className="w-5 h-5 rounded-full bg-current/10 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `var(--${tool.color}-primary)`, color: `var(--${tool.color}-primary)` }}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  <Link
                    href={tool.href}
                    className={`inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${tool.gradient} group-hover:shadow-xl ${tool.comingSoon ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                    style={{ boxShadow: `0 10px 30px -10px var(--${tool.color}-glow)` }}
                    aria-disabled={tool.comingSoon}
                  >
                    <span>{tool.comingSoon ? "Notify Me" : "Open Tool"}</span>
                    {!tool.comingSoon && (
                      <span className="group-hover:translate-x-1 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    )}
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Quick Actions */}
          <section className="relative animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Quick Actions
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Jump straight into the action
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/games/battle-arena"
                className="group p-6 rounded-2xl glass border border-white/20 hover:border-white/40 transition-all duration-300 text-center animate-fade-in-up border-battle-primary/30"
              >
                <div className="text-4xl mb-4 animate-float">⚔️</div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r">
                  Play Battle Arena
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Start a new battle</p>
              </Link>

              <Link
                href="/tools/character-creator"
                className="group p-6 rounded-2xl glass border border-white/20 hover:border-white/40 transition-all duration-300 text-center animate-fade-in-up border-dice-primary/30"
              >
                <div className="text-4xl mb-4 animate-float" style={{ animationDelay: '0.5s' }}>🎨</div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r">
                  Create Character
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Design a new fighter</p>
              </Link>

              <Link
                href="/tools/tournament-bracket"
                className="group p-6 rounded-2xl glass border border-white/20 hover:border-white/40 transition-all duration-300 text-center animate-fade-in-up border-match-primary/30"
              >
                <div className="text-4xl mb-4 animate-float" style={{ animationDelay: '1s' }}>🏆</div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r">
                  New Tournament
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Set up a bracket</p>
              </Link>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-20 text-center animate-fade-in-up" style={{ animationDelay: '800ms' }}>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              Made with Next.js 16, React 19 & Tailwind CSS 4
            </p>
            <p className="text-gray-400 dark:text-gray-600 text-xs mt-2">
              Open source • No tracking • Works offline • Data stays in your browser
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}