"use client";

import { useState, useMemo, useRef, useEffect, useCallback, memo } from "react";

// ============================================
// Types & Constants
// ============================================

interface Competitor {
  name: string;
  image: string;
  score: number;
  colorIndex: number;
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
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  customName: string;
  borderColor: string;
  inputClasses: string;
  scoreColor: string;
  cardBgGradient: string;
  cardSize: number;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoBattle: boolean;
  onAutoBattleToggle: () => void;
  autoBattleInterval: number;
  onIntervalChange: (ms: number) => void;
  isBattleTimerRunning: boolean;
  battleTimerRemaining: number;
  battleTimer: number;
  onBattleTimerStart: (minutes: number) => void;
  onBattleTimerStop: () => void;
  formatTime: (seconds: number) => string;
  cardSize: number;
  onCardSizeChange: (size: number) => void;
}

// Animation constants
const ANIMATION_CONFIG = {
  TOTAL_CYCLES: 20,
  BASE_DELAY: 50,
  MAX_DELAY: 300,
  REVEAL_HOLD_MS: 2000,
} as const;

// Color theme constants (moved outside component to prevent recreation)
const COLOR_THEMES = [
  { border: "border-indigo-300 dark:border-indigo-700", bg: "bg-indigo-50 dark:bg-indigo-900", focus: "focus:ring-indigo-500", score: "text-indigo-600 dark:text-indigo-400" },
  { border: "border-pink-300 dark:border-pink-700", bg: "bg-pink-50 dark:bg-pink-900", focus: "focus:ring-pink-500", score: "text-pink-600 dark:text-pink-400" },
  { border: "border-emerald-300 dark:border-emerald-700", bg: "bg-emerald-50 dark:bg-emerald-900", focus: "focus:ring-emerald-500", score: "text-emerald-600 dark:text-emerald-400" },
  { border: "border-amber-300 dark:border-amber-700", bg: "bg-amber-50 dark:bg-amber-900", focus: "focus:ring-amber-500", score: "text-amber-600 dark:text-amber-400" },
  { border: "border-violet-300 dark:border-violet-700", bg: "bg-violet-50 dark:bg-violet-900", focus: "focus:ring-violet-500", score: "text-violet-600 dark:text-violet-400" },
  { border: "border-rose-300 dark:border-rose-700", bg: "bg-rose-50 dark:bg-rose-900", focus: "focus:ring-rose-500", score: "text-rose-600 dark:text-rose-400" },
] as const;

const CARD_BG_GRADIENTS = [
  "bg-gradient-to-br from-indigo-100 to-pink-100 dark:from-indigo-900 dark:to-pink-900",
  "bg-gradient-to-br from-pink-100 to-emerald-100 dark:from-pink-900 dark:to-emerald-900",
  "bg-gradient-to-br from-emerald-100 to-amber-100 dark:from-emerald-900 dark:to-amber-900",
  "bg-gradient-to-br from-amber-100 to-violet-100 dark:from-amber-900 dark:to-violet-900",
  "bg-gradient-to-br from-violet-100 to-rose-100 dark:from-violet-900 dark:to-rose-900",
  "bg-gradient-to-br from-rose-100 to-indigo-100 dark:from-rose-900 dark:to-indigo-900",
] as const;

const AUTO_BATTLE_INTERVALS = [
  { value: 1000, label: "1 second" },
  { value: 2000, label: "2 seconds" },
  { value: 3000, label: "3 seconds" },
  { value: 5000, label: "5 seconds" },
  { value: 10000, label: "10 seconds" },
] as const;

const BATTLE_TIMER_OPTIONS = [1, 5, 10, 30] as const;

const DEFAULT_COMPETITORS: Competitor[] = [
  { name: "Competitor 1", image: "/competitor1.jpg", score: 0, colorIndex: 0 },
  { name: "Competitor 2", image: "/competitor2.jpg", score: 0, colorIndex: 1 },
];

// ============================================
// Components
// ============================================

const CompetitorCard = memo(function CompetitorCard({
  competitor,
  index,
  isWinner,
  isAnimating,
  isSelected = false,
  isRevealing = false,
  onNameChange,
  onImageUpload,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging = false,
  customName,
  borderColor,
  inputClasses,
  scoreColor,
  cardBgGradient,
  cardSize = 50,
}: CompetitorCardProps) {
  // Interpolate values from 0-100 scale
  const t = cardSize / 100;
  const padding = 0.5 + t * 3.5; // 0.5rem to 4rem
  const fontSize = 0.75 + t * 0.5; // 0.75rem to 1.25rem
  const radius = 0.5 + t * 1.5; // 0.5rem to 2rem
  const scoreScale = 1.125 + t * 1.125; // 1.125rem to 2.25rem
  const gap = 0.25 + t * 1; // 0.25rem to 1.25rem
  const margin = 0.5 + t * 1; // 0.5rem to 1.5rem
  const inputPX = 0.5 + t * 1.5; // 0.5rem to 2rem
  const inputPY = 0.25 + t * 0.5; // 0.25rem to 0.75rem
  const minWidth = 140 + t * 340; // 140px to 480px (floor at 140px)

  // Use inline styles for dynamic values (Tailwind JIT can't detect template literal classes)
  const cardStyle: React.CSSProperties = {
    padding: `${padding}rem`,
    fontSize: `${fontSize}rem`,
    borderRadius: `${radius + 0.5}rem`,
    minWidth: `${minWidth}px`,
    marginBottom: `${margin}rem`,
  };
  const imageRadiusStyle: React.CSSProperties = {
    borderRadius: `${radius}rem`,
  };
  const inputStyle: React.CSSProperties = {
    padding: `${inputPY}rem ${inputPX}rem`,
    borderRadius: `${radius * 0.75}rem`,
  };
  const scoreStyle: React.CSSProperties = {
    fontSize: `${scoreScale}rem`,
  };
  const scoreLabelStyle: React.CSSProperties = {
    fontSize: `${0.75 + t * 0.375}rem`,
  };
  const scoreContainerStyle: React.CSSProperties = {
    gap: `${gap}rem`,
    marginBottom: `${margin}rem`,
  };

  const cardBorder = isWinner
    ? "ring-4 ring-yellow-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 scale-105 animate-fade-in"
    : "border-gray-200 dark:border-gray-700";
  const shakeClass = isAnimating && !isWinner && !isSelected && !isRevealing ? "animate-shake" : "";
  const selectedGlowClass = isSelected ? "ring-4 ring-yellow-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 scale-110 animate-glow-pulse" : "";
  const revealingGlowClass = isRevealing ? "ring-4 ring-yellow-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 scale-105 animate-fade-in" : "";

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 shadow-lg sm:shadow-xl border-4 transition-all duration-300 ${cardBorder} ${shakeClass} ${selectedGlowClass} ${revealingGlowClass} ${isDragging ? 'opacity-50 rotate-2 shadow-2xl' : ''}`}
      style={cardStyle}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      role="button"
      tabIndex={0}
      aria-label={`${competitor.name} card${isWinner ? ', current leader' : ''}`}
    >
      {/* Remove button (if more than 2 competitors) */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/80 text-white text-sm font-bold hover:bg-red-500 transition-colors flex items-center justify-center"
          aria-label={`Remove ${competitor.name}`}
        >
          ×
        </button>
      )}

      {/* Image Upload */}
      <div style={{ marginBottom: `${margin}rem` }}>
        <label htmlFor={`image-upload-${index}`} className="cursor-pointer block">
          <div className={`relative w-full aspect-square overflow-hidden border-4 ${borderColor} ${cardBgGradient}`} style={imageRadiusStyle}>
            <img
              src={competitor.image}
              alt={competitor.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
            {isSelected && (
              <div className="absolute inset-0 bg-yellow-400/30 flex items-center justify-center animate-pulse" role="status" aria-live="polite">
                <span className="text-yellow-300 text-sm sm:text-lg font-bold px-3 sm:px-4 py-2 bg-yellow-900/80 rounded-full backdrop-blur-sm border-2 border-yellow-400">
                  🎯 SELECTING...
                </span>
              </div>
            )}
            {isRevealing && (
              <div className="absolute inset-0 bg-yellow-400/20 flex items-center justify-center animate-fade-in" role="status" aria-live="polite">
                <span className="text-yellow-300 text-base sm:text-xl font-bold px-4 sm:px-6 py-2 sm:py-3 bg-yellow-900/90 rounded-full backdrop-blur-sm border-2 border-yellow-400 shadow-lg">
                  🏆 WINNER!
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
              <span className="text-white text-base sm:text-lg font-semibold px-3 sm:px-4 py-2 bg-black/50 rounded-full backdrop-blur-sm">
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
          aria-label={`Upload image for ${competitor.name}`}
        />
      </div>

      {/* Name Input */}
      <div style={{ marginBottom: `${margin}rem` }}>
        <input
          type="text"
          value={customName}
          onChange={(e) => onNameChange(index, e.target.value)}
          placeholder={`Competitor ${index + 1} Name`}
          className={`w-full text-center font-semibold border-2 focus:outline-none focus:ring-2 transition-colors ${inputClasses}`}
          style={inputStyle}
          aria-label={`${competitor.name} name`}
        />
      </div>

      {/* Score Display */}
      <div style={scoreContainerStyle} aria-live="polite">
        <span className={`font-bold ${scoreColor}`} style={scoreStyle} aria-label="Score">
          {competitor.score}
        </span>
        <span className="text-gray-500 dark:text-gray-400 font-medium" style={scoreLabelStyle}>Score</span>
      </div>

      {/* Ahead Badge - shows for ALL tied leaders */}
      {isWinner && (
        <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2" aria-hidden="true">
          <span className="bg-yellow-400 text-gray-900 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg animate-fade-in">
            🏆 AHEAD!
          </span>
        </div>
      )}
    </div>
  );
});

const SettingsModal = memo(function SettingsModal({
  isOpen,
  onClose,
  autoBattle,
  onAutoBattleToggle,
  autoBattleInterval,
  onIntervalChange,
  isBattleTimerRunning,
  battleTimerRemaining,
  battleTimer,
  onBattleTimerStart,
  onBattleTimerStop,
  formatTime,
  cardSize,
  onCardSizeChange,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 id="settings-title" className="text-2xl font-bold text-gray-900 dark:text-gray-100">⚙️ Settings</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Auto Battle Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">🤖 Auto Battle</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoBattle}
                onChange={onAutoBattleToggle}
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 accent-indigo-600"
              />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Enable Auto Battle
              </span>
            </label>

            {autoBattle && (
              <div className="space-y-3 pl-8">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-20">Interval:</span>
                  <select
                    value={autoBattleInterval}
                    onChange={(e) => onIntervalChange(Number(e.target.value))}
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-label="Auto battle interval"
                  >
                    {AUTO_BATTLE_INTERVALS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Next battle in: <span className="font-mono font-bold">{autoBattleInterval / 1000}s</span>
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">⏱️ Battle Timer</h3>
            <div className={`p-4 rounded-xl text-center ${
              isBattleTimerRunning
                ? 'bg-red-500/10 border-2 border-red-500 dark:bg-red-900/20'
                : 'bg-indigo-500/10 border-2 border-indigo-500 dark:bg-indigo-900/20'
            }`}>
              <div className="text-3xl font-mono font-bold text-gray-900 dark:text-gray-100" aria-live="polite">
                {isBattleTimerRunning ? `⏳ ${formatTime(battleTimerRemaining)}` : '⏱️ Battle Timer'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {isBattleTimerRunning
                  ? `Auto-stops after ${formatTime(battleTimer)}`
                  : 'Set duration for auto-battle session'}
              </div>
            </div>

            {!isBattleTimerRunning && (
              <div className="grid grid-cols-2 gap-3" role="group" aria-label="Battle timer duration options">
                {BATTLE_TIMER_OPTIONS.map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => onBattleTimerStart(minutes)}
                    className="px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors font-medium"
                  >
                    {minutes} min
                  </button>
                ))}
              </div>
            )}

            {isBattleTimerRunning && (
              <button
                onClick={onBattleTimerStop}
                className="w-full px-4 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors"
              >
                ⏹️ Stop Battle Timer
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
});

// ============================================
// Custom Hooks
// ============================================

function useBattleLogic(competitors: Competitor[], lastWinners: number[]) {
  const maxScore = useMemo(() => Math.max(...competitors.map(c => c.score), 0), [competitors]);
  const leadingIndices = useMemo(
    () => competitors.map((c, i) => c.score === maxScore ? i : -1).filter(i => i !== -1),
    [competitors, maxScore]
  );
  const isWinner = useCallback((index: number) => leadingIndices.includes(index) && maxScore > 0, [leadingIndices, maxScore]);

  const getRandomWinner = useCallback((): number => {
    if (competitors.length < 2) return 0;

    const lastFour = lastWinners.slice(-4);
    if (lastFour.length === 4 && lastFour.every((w) => w === lastFour[0])) {
      const otherIndices = competitors.map((_, i) => i).filter(i => i !== lastFour[0]);
      return otherIndices[Math.floor(Math.random() * otherIndices.length)];
    }
    return Math.floor(Math.random() * competitors.length);
  }, [competitors.length, lastWinners]);

  return { maxScore, leadingIndices, isWinner, getRandomWinner };
}

function useAutoBattle(
  autoBattle: boolean,
  isAnimating: boolean,
  nextBattleIn: number,
  autoBattleInterval: number,
  handleBattle: () => void,
  setNextBattleIn: (value: number | ((prev: number) => number)) => void
) {
  useEffect(() => {
    if (!autoBattle || isAnimating) return;
    const interval = setInterval(() => {
      setNextBattleIn((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [autoBattle, isAnimating, setNextBattleIn]);

  useEffect(() => {
    if (!autoBattle || isAnimating || nextBattleIn > 0) return;
    handleBattle();
    setNextBattleIn(autoBattleInterval / 1000);
  }, [autoBattle, isAnimating, nextBattleIn, autoBattleInterval, handleBattle, setNextBattleIn]);
}

function useBattleTimer(
  isRunning: boolean,
  remaining: number,
  setRemaining: (value: number | ((prev: number) => number)) => void,
  setIsRunning: (value: boolean) => void,
  setAutoBattle: (value: boolean) => void
) {
  useEffect(() => {
    if (!isRunning || remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setAutoBattle(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, remaining, setRemaining, setIsRunning, setAutoBattle]);
}

function useDragAndDrop(
  competitors: Competitor[],
  customNames: string[],
  setCompetitors: React.Dispatch<React.SetStateAction<Competitor[]>>,
  setCustomNames: React.Dispatch<React.SetStateAction<string[]>>
) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number, e: React.DragEvent) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback((index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    setCompetitors((prev) => {
      const newCompetitors = [...prev];
      [newCompetitors[draggedIndex], newCompetitors[index]] = [newCompetitors[index], newCompetitors[draggedIndex]];
      return newCompetitors;
    });

    setCustomNames((prev) => {
      const newNames = [...prev];
      [newNames[draggedIndex], newNames[index]] = [newNames[index], newNames[draggedIndex]];
      return newNames;
    });

    setDraggedIndex(null);
  }, [draggedIndex, setCompetitors, setCustomNames]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  return { draggedIndex, handleDragStart, handleDragOver, handleDrop, handleDragEnd };
}

// ============================================
// Main Component
// ============================================

export default function Home() {
  const [competitors, setCompetitors] = useState<Competitor[]>(DEFAULT_COMPETITORS);
  const [winner, setWinner] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [customNames, setCustomNames] = useState<string[]>(["", ""]);
  const [lastWinners, setLastWinners] = useState<number[]>([]);
  const [battlePhase, setBattlePhase] = useState<"idle" | "selecting" | "revealing">("idle");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [autoBattle, setAutoBattle] = useState(false);
  const [autoBattleInterval, setAutoBattleInterval] = useState(5000);
  const [nextBattleIn, setNextBattleIn] = useState(5);
  const [battleTimer, setBattleTimer] = useState(0);
  const [battleTimerRemaining, setBattleTimerRemaining] = useState(0);
  const [isBattleTimerRunning, setIsBattleTimerRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cardSize, setCardSize] = useState(50); // 0-100 continuous scale

  // Derived state
  const { isWinner, getRandomWinner } = useBattleLogic(competitors, lastWinners);

  // Battle logic - defined BEFORE hooks that use it
  const handleBattle = useCallback(() => {
    if (competitors.length < 2) return;

    setIsAnimating(true);
    setBattlePhase("selecting");
    setSelectedIndex(0);

    const randomWinner = getRandomWinner();

    const runSelectionAnimation = () => {
      let currentCycle = 0;

      const animate = () => {
        if (currentCycle < ANIMATION_CONFIG.TOTAL_CYCLES) {
          setSelectedIndex(currentCycle % competitors.length);
          const progress = currentCycle / ANIMATION_CONFIG.TOTAL_CYCLES;
          const delay = ANIMATION_CONFIG.BASE_DELAY + (ANIMATION_CONFIG.MAX_DELAY - ANIMATION_CONFIG.BASE_DELAY) * Math.pow(progress, 2);
          currentCycle++;
          setTimeout(animate, delay);
        } else {
          setBattlePhase("revealing");
          setSelectedIndex(randomWinner);
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
          }, ANIMATION_CONFIG.REVEAL_HOLD_MS);
        }
      };

      animate();
    };

    runSelectionAnimation();
  }, [competitors.length, getRandomWinner]);

  // Custom hooks - now handleBattle is defined
  useAutoBattle(autoBattle, isAnimating, nextBattleIn, autoBattleInterval, handleBattle, setNextBattleIn);
  useBattleTimer(isBattleTimerRunning, battleTimerRemaining, setBattleTimerRemaining, setIsBattleTimerRunning, setAutoBattle);

  // Drag and drop handlers
  const handleDragStart = useCallback((index: number, e: React.DragEvent) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback((index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    setCompetitors((prev) => {
      const newCompetitors = [...prev];
      [newCompetitors[draggedIndex], newCompetitors[index]] = [newCompetitors[index], newCompetitors[draggedIndex]];
      return newCompetitors;
    });

    setCustomNames((prev) => {
      const newNames = [...prev];
      [newNames[draggedIndex], newNames[index]] = [newNames[index], newNames[draggedIndex]];
      return newNames;
    });

    setDraggedIndex(null);
  }, [draggedIndex, setCompetitors, setCustomNames]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  // Other handlers
  const handleReset = useCallback(() => {
    setCompetitors((prev) => prev.map((c) => ({ ...c, score: 0 })));
    setWinner(null);
    setLastWinners([]);
  }, []);

  const handleAutoBattleToggle = useCallback(() => {
    setAutoBattle((prev) => {
      const next = !prev;
      if (next) setNextBattleIn(autoBattleInterval / 1000);
      return next;
    });
  }, [autoBattleInterval, setNextBattleIn]);

  const handleIntervalChange = useCallback((ms: number) => {
    setAutoBattleInterval(ms);
    setNextBattleIn(ms / 1000);
  }, []);

  const handleBattleTimerStart = useCallback((minutes: number) => {
    const seconds = minutes * 60;
    setBattleTimer(seconds);
    setBattleTimerRemaining(seconds);
    setIsBattleTimerRunning(true);
    setAutoBattle(true);
  }, []);

  const handleBattleTimerStop = useCallback(() => {
    setIsBattleTimerRunning(false);
    setBattleTimerRemaining(0);
    setAutoBattle(false);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleNameChange = useCallback((index: number, value: string) => {
    setCustomNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setCompetitors((prev) =>
      prev.map((c, i) => (i === index ? { ...c, name: value || `Competitor ${i + 1}` } : c))
    );
  }, []);

  const handleImageUpload = useCallback((index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCompetitors((prev) =>
        prev.map((c, i) => (i === index ? { ...c, image: url } : c))
      );
    }
  }, []);

  const handleAddCompetitor = useCallback(() => {
    const newIndex = competitors.length;
    setCompetitors((prev) => [...prev, { name: `Competitor ${newIndex + 1}`, image: "/competitor1.jpg", score: 0, colorIndex: newIndex % 6 }]);
    setCustomNames((prev) => [...prev, ""]);
  }, [competitors.length]);

  const handleRemoveCompetitor = useCallback((index: number) => {
    if (competitors.length <= 2) return;
    setCompetitors((prev) => prev.filter((_, i) => i !== index));
    setCustomNames((prev) => prev.filter((_, i) => i !== index));
  }, [competitors.length]);

  // Memoized input classes to avoid string construction on every render
  const getInputClasses = useCallback((colorIndex: number) => {
    const theme = COLOR_THEMES[colorIndex % COLOR_THEMES.length];
    const borderClass = theme.border.replace('border-', '').replace('dark:border-', 'dark:border-');
    const textClass = theme.score.replace('text-', '').replace('dark:text-', 'dark:text-');
    return `${theme.bg} border-${borderClass} text-${textClass} ${theme.focus}`;
  }, []);

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
          {/* Competitor Cards - Horizontal Row, Centered */}
          <div
            className="flex flex-wrap justify-center items-stretch"
            style={{
              gap: `${0.25 + cardSize * 0.01}rem`,
            } as React.CSSProperties}
          >
            {competitors.map((competitor, index) => (
              <CompetitorCard
                key={competitor.colorIndex}
                competitor={competitor}
                index={index}
                isWinner={isWinner(index)}
                isAnimating={isAnimating}
                isSelected={isAnimating && battlePhase === "selecting" && selectedIndex === index}
                isRevealing={isAnimating && battlePhase === "revealing" && winner === index}
                onNameChange={handleNameChange}
                onImageUpload={handleImageUpload}
                onRemove={competitors.length > 2 ? () => handleRemoveCompetitor(index) : undefined}
                onDragStart={(e) => handleDragStart(index, e)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                isDragging={draggedIndex === index}
                customName={customNames[index]}
                cardSize={cardSize}
                borderColor={COLOR_THEMES[competitor.colorIndex % COLOR_THEMES.length].border}
                inputClasses={getInputClasses(competitor.colorIndex)}
                scoreColor={COLOR_THEMES[competitor.colorIndex % COLOR_THEMES.length].score}
                cardBgGradient={CARD_BG_GRADIENTS[competitor.colorIndex % CARD_BG_GRADIENTS.length]}
              />
            ))}
          </div>

          {/* Battle Section - Centered Below */}
          <div className="flex flex-col items-center justify-center relative min-w-0 w-full max-w-md">
            <div className="relative flex items-center justify-center mb-4 w-full">
              {/* Phase indicator text */}
              {isAnimating && battlePhase === "selecting" && (
                <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 text-center animate-pulse" role="status" aria-live="polite">
                  <p className="text-yellow-400 font-bold text-lg bg-gray-900/80 px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
                    ⚡ SELECTING CHALLENGER...
                  </p>
                </div>
              )}
              {isAnimating && battlePhase === "revealing" && winner !== null && (
                <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 text-center animate-fade-in" role="status" aria-live="polite">
                  <p className="text-yellow-400 font-bold text-lg bg-gray-900/80 px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
                    🏆 {competitors[winner].name} WINS!
                  </p>
                </div>
              )}
            </div>

            {/* Battle Button */}
            <div className="flex items-center justify-center px-4 mb-4 w-full">
              <button
                onClick={handleBattle}
                disabled={isAnimating || competitors.length < 2}
                className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-bold text-lg rounded-full shadow-lg hover:from-indigo-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 w-full max-w-xs"
                aria-label={isAnimating ? "Battle in progress" : "Start battle"}
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

            {/* Settings Button */}
            <div className="flex items-center justify-center mb-4">
              <button
                onClick={() => setShowSettings(true)}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 border border-gray-200 dark:border-gray-700"
              >
                ⚙️ Settings
              </button>
            </div>

            {/* Card Size Slider - Below Settings */}
            <div className="flex items-center justify-center gap-3 w-full max-w-xs mb-4 px-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">Tiny</span>
              <input
                type="range"
                min="0"
                max="100"
                value={cardSize}
                onChange={(e) => setCardSize(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none accent-indigo-600 cursor-pointer"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 w-12">Huge</span>
            </div>
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 mb-4 font-mono">
              cardSize={cardSize} → minWidth={140 + cardSize * 3.4}px | gap={0.25 + cardSize * 0.01}rem
            </div>

            <div className="flex items-center justify-center gap-3 w-full flex-wrap px-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors whitespace-nowrap"
              >
                Reset Scores
              </button>
              <button
                onClick={handleAddCompetitor}
                className="px-4 py-2 text-sm bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                + Add Competitor
              </button>
            </div>
          </div>
        </div>

        {/* Settings Modal */}
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          autoBattle={autoBattle}
          onAutoBattleToggle={handleAutoBattleToggle}
          autoBattleInterval={autoBattleInterval}
          onIntervalChange={handleIntervalChange}
          isBattleTimerRunning={isBattleTimerRunning}
          battleTimerRemaining={battleTimerRemaining}
          battleTimer={battleTimer}
          onBattleTimerStart={handleBattleTimerStart}
          onBattleTimerStop={handleBattleTimerStop}
          formatTime={formatTime}
          cardSize={cardSize}
          onCardSizeChange={setCardSize}
        />

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
            <li>• Drag and drop cards to reorder</li>
          </ul>
        </div>
      </div>
    </div>
  );
}