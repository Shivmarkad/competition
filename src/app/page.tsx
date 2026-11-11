"use client";

import Link from "next/link";
import { AdSenseBanner } from "@/components/ads";

interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  gradient: string;
  color: string;
  features: string[];
}

const GAMES: Game[] = [
  {
    id: "battle-arena",
    title: "Battle Arena",
    description: "Upload characters, customize names, and let them battle with automatic scoring!",
    icon: "⚔️",
    href: "/games/battle-arena",
    gradient: "gradient-battle",
    color: "battle",
    features: ["Auto Battle", "Sound Effects", "Drag & Drop", "Local Storage"],
  },
  {
    id: "dice-spinner",
    title: "Dice Spinner",
    description: "Roll multiple 3D dice with realistic physics. Perfect for board games and battles!",
    icon: "🎲",
    href: "/games/dice-spinner",
    gradient: "gradient-dice",
    color: "dice",
    features: ["3D Animation", "Up to 10 Dice", "Auto Total", "Haptic Feedback"],
  },
  {
    id: "match-columns",
    title: "Match Columns",
    description: "Classic Connect-4 gameplay. Drop pieces and connect four to win!",
    icon: "🔴",
    href: "/games/match-columns",
    gradient: "gradient-match",
    color: "match",
    features: ["Win Detection", "Draw Detection", "Smooth Animation", "New Game Reset"],
  },
  {
    id: "edu-swiper",
    title: "Edu Swiper",
    description: "Learn anything in bite-sized cards. Swipe, answer, level up!",
    icon: "📚",
    href: "/games/edu-swiper",
    gradient: "gradient-edu",
    color: "edu",
    features: ["Spaced Repetition", "XP & Levels", "Daily Goals", "Multi-topic"],
  },
  {
    id: "tools",
    title: "Tools Hub",
    description: "Character Creator, Tournament Brackets, Score Tracker, Custom Rules & Battle Replay.",
    icon: "🛠️",
    href: "/tools",
    gradient: "gradient-battle",
    color: "battle",
    features: ["Character Creator", "Tournaments", "Score History", "Custom Rules"],
  },
];

const FEATURES = [
  { icon: "📱", title: "Mobile First", desc: "Optimized for all screen sizes" },
  { icon: "🎨", title: "Beautiful Design", desc: "Modern UI with smooth animations" },
  { icon: "⚡", title: "Fast & Lightweight", desc: "Built with Next.js 16 & React 19" },
  { icon: "🔊", title: "Sound & Haptics", desc: "Immersive audio & tactile feedback" },
  { icon: "💾", title: "Persistent State", desc: "Games save automatically" },
  { icon: "♿", title: "Accessible", desc: "WCAG AA compliant, reduced motion" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4 safe-top safe-bottom">
      <div className="container">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-40 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>

        {/* Header */}
        <header className="relative text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass border border-white/20 mb-6 animate-scale-in stagger-1">
            <span className="text-2xl">🎮</span>
            <span className="font-semibold text-gray-900 dark:text-gray-950">Game Hub</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gradient-battle mb-6 animate-fade-in-up stagger-2">
            Play Games
          </h1>
          <p className="text-xl md:text-2xl text-white dark:text-white max-w-2xl mx-auto animate-fade-in-up stagger-3">
            Three unique games. Zero installs. Pure fun.
          </p>
        </header>

        {/* Games Grid */}
        <main className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {GAMES.map((game, index) => (
              <article
                key={game.id}
                className="group relative overflow-hidden rounded-2xl glass-strong border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${100 + index * 100}ms` }}
              >
                {/* Gradient Mesh Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
                <div className={`absolute inset-0 ${game.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />

                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Content */}
                <div className="relative p-6 md:p-8 flex flex-col h-full">
                  {/* Icon with floating animation */}
                  <div className="relative mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg animate-float">
                      <span className="text-5xl group-hover:rotate-12 transition-transform duration-300">{game.icon}</span>
                    </div>
                    {/* Pulse ring */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-current/20 animate-ping-slow" style={{ borderColor: `var(--${game.color}-primary)` }} />
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-950 mb-3">
                    {game.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-900 dark:text-gray-950 mb-6 flex-1 line-clamp-3">
                    {game.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6" role="list" aria-label={`${game.title} features`}>
                    {game.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-gray-900 dark:text-gray-950">
                        <span className="w-5 h-5 rounded-full bg-current/10 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `var(--${game.color}-primary)`, color: `var(--${game.color}-primary)` }}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Play Button */}
                  <Link
                    href={game.href}
                    className={`inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${game.gradient} group-hover:shadow-xl`}
                    style={{ boxShadow: `0 10px 30px -10px var(--${game.color}-glow)` }}
                  >
                    <span>Play Now</span>
                    <span className="group-hover:translate-x-1 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* AdSense Banner */}
          <div className="my-12 animate-fade-in-up" style={{ animationDelay: '350ms' }} role="complementary" aria-label="Advertisement">
            <AdSenseBanner className="w-full max-w-4xl mx-auto" />
          </div>

          {/* Features Section */}
          <section className="relative animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white dark:text-white mb-4">
                Why Game Hub?
              </h2>
              <p className="text-lg text-white dark:text-white max-w-2xl mx-auto">
                Built with modern web technologies for the best experience
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group p-6 rounded-2xl glass border border-white/20 hover:border-white/40 transition-all duration-300 text-center animate-fade-in-up"
                  style={{ animationDelay: `${500 + index * 100}ms` }}
                >
                  <div className="text-4xl mb-4 animate-float" style={{ animationDelay: `${index * 0.5}s` }}>
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-950 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-900 dark:text-gray-950">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-20 text-center animate-fade-in-up" style={{ animationDelay: '800ms' }}>
            <p className="text-white dark:text-white text-sm">
              Made with Next.js 16, React 19 & Tailwind CSS 4
            </p>
            <p className="text-white dark:text-white text-xs mt-2">
              Open source • No tracking • Works offline
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}