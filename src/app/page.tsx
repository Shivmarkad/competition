"use client";

import { useState } from "react";

interface Competitor {
  name: string;
  image: string;
  score: number;
}

const DEFAULT_COMPETITORS: Competitor[] = [
  { name: "Competitor 1", image: "/competitor1.jpg", score: 0 },
  { name: "Competitor 2", image: "/competitor2.jpg", score: 0 },
];

export default function Home() {
  const [competitors, setCompetitors] = useState<Competitor[]>(DEFAULT_COMPETITORS);
  const [winner, setWinner] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [customNames, setCustomNames] = useState(["", ""]);
  const [lastWinners, setLastWinners] = useState<number[]>([]);

  const handleBattle = () => {
    setIsAnimating(true);
    setWinner(null);

    // Simulate battle animation
    setTimeout(() => {
      // Prevent 3 consecutive wins for any competitor
      let randomWinner: number;
      const lastTwo = lastWinners.slice(-2);

      if (lastTwo.length === 2 && lastTwo[0] === lastTwo[1]) {
        // Last two winners were the same, force the other competitor to win
        randomWinner = lastTwo[0] === 0 ? 1 : 0;
      } else {
        randomWinner = Math.floor(Math.random() * 2);
      }

      setCompetitors((prev) =>
        prev.map((c, i) => ({
          ...c,
          score: i === randomWinner ? c.score + 1 : c.score,
        }))
      );

      setLastWinners((prev) => [...prev.slice(-4), randomWinner]); // Keep last 4 winners
      setWinner(randomWinner);
      setIsAnimating(false);
    }, 800);
  };

  const handleReset = () => {
    setCompetitors(DEFAULT_COMPETITORS);
    setWinner(null);
    setCustomNames(["", ""]);
    setLastWinners([]);
  };

  const handleNameChange = (index: number, value: string) => {
    setCustomNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setCompetitors((prev) =>
      prev.map((c, i) => (i === index ? { ...c, name: value || `Competitor ${i + 1}` } : c))
    );
  };

  const handleImageUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCompetitors((prev) =>
        prev.map((c, i) => (i === index ? { ...c, image: url } : c))
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Character Battle Arena
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Upload characters, customize names, and let them battle!
          </p>
        </header>

        {/* Battle Arena */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Competitor 1 - Column 1 */}
          <CompetitorCard
            competitor={competitors[0]}
            index={0}
            isWinner={winner === 0}
            isAnimating={isAnimating}
            onNameChange={handleNameChange}
            onImageUpload={handleImageUpload}
            customName={customNames[0]}
          />

          {/* Battle Button - Column 2 (Center) - Fixed center column */}
          <div className="flex flex-col items-center justify-center relative md:col-span-1">
            <div className="relative flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                VS
              </div>
              {isAnimating && (
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500 animate-pulse opacity-75" />
              )}
            </div>

            {/* Battle Button */}
            <div className="flex items-center justify-center px-4 mb-4">
              <button
                onClick={handleBattle}
                disabled={isAnimating}
                className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-bold text-lg rounded-full shadow-lg hover:from-indigo-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
              >
                {isAnimating ? "⚔️ Battling..." : "⚔️ BATTLE!"}
              </button>
            </div>

            {/* Winner Announcement */}
            {winner !== null && !isAnimating && (
              <div className="animate-fade-in mb-4">
                <div className="bg-gradient-to-r from-indigo-100 to-pink-100 dark:from-indigo-900/30 dark:to-pink-900/30 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-4 text-center">
                  <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                    🏆 {competitors[winner].name} Wins!
                  </p>
                  <p className="text-indigo-600 dark:text-indigo-400">
                    Score: {competitors[winner].score}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleReset}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
            >
              Reset Scores
            </button>
          </div>

          {/* Competitor 2 - Column 3 */}
          <CompetitorCard
            competitor={competitors[1]}
            index={1}
            isWinner={winner === 1}
            isAnimating={isAnimating}
            onNameChange={handleNameChange}
            onImageUpload={handleImageUpload}
            customName={customNames[1]}
          />
        </div>

        {/* Instructions */}
        <div className="mt-12 p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">How to Play</h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li>• Click on character images to upload your own photos</li>
            <li>• Edit names by typing in the input fields below each character</li>
            <li>• Click "BATTLE!" to randomly select a winner</li>
            <li>• Winner's score increases automatically</li>
            <li>• No competitor can win 3 times in a row!</li>
            <li>• Click "Reset Scores" to start fresh</li>
          </ul>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

interface CompetitorCardProps {
  competitor: Competitor;
  index: number;
  isWinner: boolean;
  isAnimating: boolean;
  onNameChange: (index: number, value: string) => void;
  onImageUpload: (index: number, event: React.ChangeEvent<HTMLInputElement>) => void;
  customName: string;
}

function CompetitorCard({
  competitor,
  index,
  isWinner,
  isAnimating,
  onNameChange,
  onImageUpload,
  customName,
}: CompetitorCardProps) {
  const borderColor = index === 0 ? "border-indigo-300 dark:border-indigo-700" : "border-pink-300 dark:border-pink-700";
  const bgGradient = "bg-gradient-to-br from-indigo-100 to-pink-100 dark:from-indigo-900/30 dark:to-pink-900/30";
  const inputClasses = index === 0
    ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700 text-indigo-800 dark:text-indigo-200 focus:ring-indigo-500"
    : "bg-pink-50 dark:bg-pink-900/30 border-pink-200 dark:border-pink-700 text-pink-800 dark:text-pink-200 focus:ring-pink-500";
  const scoreColor = index === 0 ? "text-indigo-600 dark:text-indigo-400" : "text-pink-600 dark:text-pink-400";
  const cardBorder = isWinner
    ? "ring-4 ring-yellow-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 scale-105 animate-fade-in"
    : "border-gray-200 dark:border-gray-700";
  const shakeClass = isAnimating && !isWinner ? "animate-shake" : "";

  return (
    <div
      className={`relative p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-4 transition-all duration-300 ${cardBorder} ${shakeClass}`}
    >
      {/* Image Upload */}
      <div className="relative mb-4">
        <label htmlFor={`image-upload-${index}`} className="cursor-pointer">
          <div className={`relative w-full aspect-square rounded-2xl overflow-hidden border-4 ${borderColor} ${bgGradient}`}>
            <img
              src={competitor.image}
              alt={competitor.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-lg font-semibold px-4 py-2 bg-black/50 rounded-full backdrop-blur-sm">
                Change Image
              </span>
            </div>
          </div>
        </label>
        <input
          id={`image-upload-${index}`}
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => onImageUpload(index, e)}
        />
      </div>

      {/* Name Input */}
      <div className="mb-4">
        <input
          type="text"
          value={customName}
          onChange={(e) => onNameChange(index, e.target.value)}
          placeholder={`Competitor ${index + 1} Name`}
          className={`w-full px-4 py-2 text-center text-lg font-semibold rounded-xl border-2 focus:outline-none focus:ring-2 transition-colors ${inputClasses}`}
        />
      </div>

      {/* Score Display */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className={`text-3xl font-bold ${scoreColor}`}>
          {competitor.score}
        </span>
        <span className="text-gray-500 dark:text-gray-400 font-medium">Wins</span>
      </div>

      {/* Winner Badge */}
      {isWinner && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-fade-in">
            🏆 WINNER!
          </span>
        </div>
      )}
    </div>
  );
}