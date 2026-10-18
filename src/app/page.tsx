"use client";

import Link from "next/link";

interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

const GAMES: Game[] = [
  {
    id: "battle-arena",
    title: "Battle Arena",
    description: "Upload characters and let them battle! Automatic scoring and winner selection.",
    icon: "⚔️",
    href: "/games/battle-arena",
    color: "from-indigo-500 to-pink-500",
  },
  {
    id: "dice-spinner",
    title: "Dice Spinner",
    description: "Roll multiple dice with animations. Perfect for board games and battles!",
    icon: "🎲",
    href: "/games/dice-spinner",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "match-columns",
    title: "Match Columns",
    description: "Drop pieces and match colors vertically. Classic connect-style gameplay!",
    icon: "🔴",
    href: "/games/match-columns",
    color: "from-amber-500 to-orange-500",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🎮 Game Hub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose your game and start playing!
          </p>
        </header>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {GAMES.map((game) => (
            <Link
              key={game.id}
              href={game.href}
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-5 group-hover:opacity-10 transition-opacity`} />

              {/* Content */}
              <div className="relative p-8">
                {/* Icon */}
                <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">
                  {game.icon}
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  {game.title}
                </h2>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {game.description}
                </p>

                {/* Play Button */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${game.color} text-white font-semibold rounded-lg group-hover:gap-3 transition-all`}>
                  <span>Play Now</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>

              {/* Shine Effect on Hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </Link>
          ))}
        </div>

        {/* Features */}
        <div className="mt-16 p-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 text-center">
            ✨ Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">📱</div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Mobile Ready</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Optimized for Android devices
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🎨</div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Beautiful Design</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Modern UI with smooth animations
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Easy to Play</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Simple controls for all ages
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
