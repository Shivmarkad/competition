"use client";

import { useState, useMemo } from "react";

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
  const [customNames, setCustomNames] = useState<string[]>(["", ""]);
  const [lastWinners, setLastWinners] = useState<number[]>([]);
  const [battlePhase, setBattlePhase] = useState<"idle" | "selecting" | "revealing">("idle");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cardSize, setCardSize] = useState(280); // Base width in pixels

  // Generic: find all indices with the maximum score (handles ties)
  const maxScore = useMemo(() => Math.max(...competitors.map(c => c.score)), [competitors]);
  const leadingIndices = useMemo(
    () => competitors.map((c, i) => c.score === maxScore ? i : -1).filter(i => i !== -1),
    [competitors, maxScore]
  );
  const isWinner = (index: number) => leadingIndices.includes(index) && maxScore > 0;

  const handleBattle = () => {
    if (competitors.length < 2) return;

    setIsAnimating(true);
    setBattlePhase("selecting");
    setSelectedIndex(0);

    // Prevent 5 consecutive wins for any competitor
    let randomWinner: number;
    const lastFour = lastWinners.slice(-4);

    if (lastFour.length === 4 && lastFour.every((w) => w === lastFour[0])) {
      // Pick any competitor except the one that won 4 times
      const otherIndices = competitors.map((_, i) => i).filter(i => i !== lastFour[0]);
      randomWinner = otherIndices[Math.floor(Math.random() * otherIndices.length)];
    } else {
      randomWinner = Math.floor(Math.random() * competitors.length);
    }

    // Animation sequence: selecting (rapid switching) -> revealing (slow down) -> result
    const totalCycles = 20; // Number of rapid switches
    let currentCycle = 0;
    const baseDelay = 50; // Start fast
    const maxDelay = 300; // End slow

    const runSelectionAnimation = () => {
      if (currentCycle < totalCycles) {
        // Cycle through all competitors during selection
        setSelectedIndex(currentCycle % competitors.length);

        // Progressive slowdown
        const progress = currentCycle / totalCycles;
        const delay = baseDelay + (maxDelay - baseDelay) * Math.pow(progress, 2);

        currentCycle++;
        setTimeout(runSelectionAnimation, delay);
      } else {
        // Reveal phase - show the winner
        setBattlePhase("revealing");
        setSelectedIndex(randomWinner);
        // Set winner immediately so reveal animation works
        setWinner(randomWinner);

        setTimeout(() => {
          setCompetitors((prev) =>
            prev.map((c, i) => ({
              ...c,
              score: i === randomWinner ? c.score + 1 : c.score,
            }))
          );

          setLastWinners((prev) => [...prev.slice(-4), randomWinner]);
          setBattlePhase("idle");
          setIsAnimating(false);
        }, 2000); // Hold the winner for 2 seconds so it's visible
      }
    };

    runSelectionAnimation();
  };

  const handleReset = () => {
    setCompetitors((prev) => prev.map((c) => ({ ...c, score: 0 })));
    setWinner(null);
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

  const handleAddCompetitor = () => {
    const newIndex = competitors.length;
    setCompetitors((prev) => [...prev, { name: `Competitor ${newIndex + 1}`, image: "/competitor1.jpg", score: 0 }]);
    setCustomNames((prev) => [...prev, ""]);
  };

  const handleRemoveCompetitor = (index: number) => {
    if (competitors.length <= 2) return; // Minimum 2 competitors
    setCompetitors((prev) => prev.filter((_, i) => i !== index));
    setCustomNames((prev) => prev.filter((_, i) => i !== index));
  };

  const colors = [
    { border: "border-indigo-300 dark:border-indigo-700", bg: "bg-indigo-50 dark:bg-indigo-900", focus: "focus:ring-indigo-500", score: "text-indigo-600 dark:text-indigo-400" },
    { border: "border-pink-300 dark:border-pink-700", bg: "bg-pink-50 dark:bg-pink-900", focus: "focus:ring-pink-500", score: "text-pink-600 dark:text-pink-400" },
    { border: "border-emerald-300 dark:border-emerald-700", bg: "bg-emerald-50 dark:bg-emerald-900", focus: "focus:ring-emerald-500", score: "text-emerald-600 dark:text-emerald-400" },
    { border: "border-amber-300 dark:border-amber-700", bg: "bg-amber-50 dark:bg-amber-900", focus: "focus:ring-amber-500", score: "text-amber-600 dark:text-amber-400" },
    { border: "border-violet-300 dark:border-violet-700", bg: "bg-violet-50 dark:bg-violet-900", focus: "focus:ring-violet-500", score: "text-violet-600 dark:text-violet-400" },
    { border: "border-rose-300 dark:border-rose-700", bg: "bg-rose-50 dark:bg-rose-900", focus: "focus:ring-rose-500", score: "text-rose-600 dark:text-rose-400" },
  ];

  const cardBgGradients = [
    "bg-gradient-to-br from-indigo-100 to-pink-100 dark:from-indigo-900 dark:to-pink-900",
    "bg-gradient-to-br from-pink-100 to-emerald-100 dark:from-pink-900 dark:to-emerald-900",
    "bg-gradient-to-br from-emerald-100 to-amber-100 dark:from-emerald-900 dark:to-amber-900",
    "bg-gradient-to-br from-amber-100 to-violet-100 dark:from-amber-900 dark:to-violet-900",
    "bg-gradient-to-br from-violet-100 to-rose-100 dark:from-violet-900 dark:to-rose-900",
    "bg-gradient-to-br from-rose-100 to-indigo-100 dark:from-rose-900 dark:to-indigo-900",
  ];

  const numColumns = competitors.length + 1; // +1 for center battle column
  const gridCols = competitors.length >= 3 ? competitors.length + 1 : 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Character Battle Arena
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Upload characters, customize names, and let them battle!
          </p>
        </header>

        {/* Battle Arena - Competitors in horizontal row, Battle below */}
        <div className="flex flex-col items-center gap-12">
          {/* Competitor Cards - Horizontal Row */}
          <div className="flex flex-wrap justify-center gap-8 w-full">
            {competitors.map((competitor, index) => (
              <CompetitorCard
                key={index}
                competitor={competitor}
                index={index}
                isWinner={isWinner(index)}
                isAnimating={isAnimating}
                isSelected={isAnimating && battlePhase === "selecting" && selectedIndex === index}
                isRevealing={isAnimating && battlePhase === "revealing" && winner === index}
                onNameChange={handleNameChange}
                onImageUpload={handleImageUpload}
                onRemove={competitors.length > 2 ? () => handleRemoveCompetitor(index) : undefined}
                customName={customNames[index]}
                borderColor={colors[index % colors.length].border}
                inputClasses={`${colors[index % colors.length].bg} border-${colors[index % colors.length].border.replace('border-', '').replace('dark:border-', 'dark:border-')} text-${colors[index % colors.length].score.replace('text-', '').replace('dark:text-', 'dark:text-')} ${colors[index % colors.length].focus}`}
                scoreColor={colors[index % colors.length].score}
                cardBgGradient={cardBgGradients[index % cardBgGradients.length]}
                cardSize={cardSize}
              />
            ))}
          </div>

          {/* Battle Section - Centered Below (just VS badge and button) */}
          <div className="flex flex-col items-center justify-center relative min-w-0 w-full max-w-md">
            <div className="relative flex items-center justify-center mb-4 min-h-[80px] w-full">
              {/* Phase indicator text - positioned above VS */}
              {isAnimating && battlePhase === "selecting" && (
                <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 text-center animate-pulse">
                  <p className="text-yellow-400 font-bold text-lg bg-gray-900/80 px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
                    ⚡ SELECTING CHALLENGER...
                  </p>
                </div>
              )}
              {isAnimating && battlePhase === "revealing" && (
                <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 text-center animate-fade-in">
                  <p className="text-yellow-400 font-bold text-lg bg-gray-900/80 px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
                    🏆 WINNER REVEALED!
                  </p>
                </div>
              )}

              {/* Default VS or Winner badge during reveal */}
              {!isAnimating && competitors.length > 0 && (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  VS
                </div>
              )}
              {isAnimating && battlePhase === "revealing" && winner !== null && (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-2xl shadow-2xl animate-fade-in">
                  🏆
                </div>
              )}
            </div>

            {/* Battle Button */}
            <div className="flex items-center justify-center px-4 mb-4 w-full">
              <button
                onClick={handleBattle}
                disabled={isAnimating || competitors.length < 2}
                className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-bold text-lg rounded-full shadow-lg hover:from-indigo-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 w-full max-w-xs"
              >
                {isAnimating ? (
                  <span className="flex items-center gap-2 animate-pulse">
                    <span className="animate-bounce">⚔️</span>
                    <span>BATTLING...</span>
                    <span className="animate-bounce" style={{animationDelay: '100ms'}}>⚔️</span>
                  </span>
                ) : (
                  "⚔️ BATTLE!"
                )}
              </button>
            </div>

            {/* Winner Announcement - Show during animation too */}
            {winner !== null && (
              <div className="animate-fade-in mb-4 w-full">
                <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 dark:from-yellow-500 dark:via-amber-600 dark:to-orange-600 rounded-2xl border-2 border-yellow-300 dark:border-yellow-700 p-4 text-center shadow-lg shadow-yellow-500/25 transition-all duration-300">
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-900">
                    🏆 {competitors[winner].name} won this round!
                  </p>
                  <p className="text-gray-800 dark:text-gray-800 font-medium">
                    Score: {competitors[winner].score}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-4 w-full flex-wrap">
              <button
                onClick={handleReset}
                className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
              >
                Reset Scores
              </button>
              <button
                onClick={handleAddCompetitor}
                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                + Add Competitor
              </button>
            </div>

            {/* Card Size Control */}
            <div className="mt-6 w-full max-w-md">
              <label className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-medium">
                <span className="w-24">Card Size:</span>
                <input
                  type="range"
                  min="200"
                  max="400"
                  step="20"
                  value={cardSize}
                  onChange={(e) => setCardSize(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none accent-indigo-600 cursor-pointer"
                />
                <span className="w-16 text-right">{cardSize}px</span>
              </label>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">How to Play</h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li>• Click on character images to upload your own photos</li>
            <li>• Edit names by typing in the input fields below each character</li>
            <li>• Click "BATTLE!" to randomly select a winner</li>
            <li>• Winner's score increases automatically</li>
            <li>• No competitor can win 5 times in a row!</li>
            <li>• Click "Reset Scores" to start fresh</li>
            <li>• Add more competitors with "+ Add Competitor" (max 6)</li>
            <li>• Remove competitors with the × button (minimum 2)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

interface CompetitorCardProps {
  competitor: Competitor;
  index: number;
  isWinner: boolean;
  isAnimating: boolean;
  isSelected?: boolean;
  isRevealing?: boolean;
  onNameChange: (index: number, value: string) => void;
  onImageUpload: (index: number, event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove?: () => void;
  customName: string;
  borderColor: string;
  inputClasses: string;
  scoreColor: string;
  cardBgGradient: string;
  cardSize: number;
}

function CompetitorCard({
  competitor,
  index,
  isWinner,
  isAnimating,
  isSelected = false,
  isRevealing = false,
  onNameChange,
  onImageUpload,
  onRemove,
  customName,
  borderColor,
  inputClasses,
  scoreColor,
  cardBgGradient,
  cardSize = 280,
}: CompetitorCardProps) {
  const cardBorder = isWinner
    ? "ring-4 ring-yellow-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 scale-105 animate-fade-in"
    : "border-gray-200 dark:border-gray-700";
  const shakeClass = isAnimating && !isWinner && !isSelected && !isRevealing ? "animate-shake" : "";
  const selectedGlowClass = isSelected ? "ring-4 ring-yellow-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 scale-110 animate-glow-pulse" : "";
  const revealingGlowClass = isRevealing ? "ring-4 ring-yellow-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 scale-105 animate-fade-in" : "";

  return (
    <div
      style={{ width: cardSize }}
      className={`relative p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-4 transition-all duration-300 ${cardBorder} ${shakeClass} ${selectedGlowClass} ${revealingGlowClass}`}
    >
      {/* Remove button (if more than 2 competitors) */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/80 text-white text-sm font-bold hover:bg-red-500 transition-colors flex items-center justify-center"
          aria-label="Remove competitor"
        >
          ×
        </button>
      )}

      {/* Image Upload */}
      <div className="relative mb-4">
        <label htmlFor={`image-upload-${index}`} className="cursor-pointer">
          <div className={`relative w-full aspect-square rounded-2xl overflow-hidden border-4 ${borderColor} ${cardBgGradient}`}>
            <img
              src={competitor.image}
              alt={competitor.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            {isSelected && (
              <div className="absolute inset-0 bg-yellow-400/30 flex items-center justify-center animate-pulse">
                <span className="text-yellow-300 text-lg font-bold px-4 py-2 bg-yellow-900/80 rounded-full backdrop-blur-sm border-2 border-yellow-400">
                  🎯 SELECTING...
                </span>
              </div>
            )}
            {isRevealing && (
              <div className="absolute inset-0 bg-yellow-400/20 flex items-center justify-center animate-fade-in">
                <span className="text-yellow-300 text-xl font-bold px-6 py-3 bg-yellow-900/90 rounded-full backdrop-blur-sm border-2 border-yellow-400 shadow-lg">
                  🏆 WINNER!
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
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
        <span className="text-gray-500 dark:text-gray-400 font-medium">Score</span>
      </div>

      {/* Ahead Badge - shows for ALL tied leaders */}
      {isWinner && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-fade-in">
            🏆 AHEAD!
          </span>
        </div>
      )}
    </div>
  );
}