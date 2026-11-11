"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { AdSenseBanner, AdSenseInArticle } from "@/components/ads";

interface Competitor {
  id: number;
  name: string;
  image: string;
  score: number;
  wins: number;
  consecutiveWins: number;
  colorIndex: number;
}

const STORAGE_KEY = "battle-arena-data";

// Color theme constants (6 color profiles)
const COLOR_THEMES = [
  { border: "border-indigo-300 dark:border-indigo-700", bg: "bg-indigo-50 dark:bg-indigo-900", focus: "focus:ring-indigo-500", score: "text-indigo-600 dark:text-indigo-400" },
  { border: "border-pink-300 dark:border-pink-700", bg: "bg-pink-50 dark:bg-pink-900", focus: "focus:ring-pink-500", score: "text-pink-600 dark:text-pink-400" },
  { border: "border-emerald-300 dark:border-emerald-700", bg: "bg-emerald-50 dark:bg-emerald-900", focus: "focus:ring-emerald-600 dark:text-emerald-400" },
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

const DEFAULT_COMPETITORS: Competitor[] = [
  {
    id: 1,
    name: "Player 1",
    image: "https://picsum.photos/seed/battle1/200/200.jpg",
    score: 0,
    wins: 0,
    consecutiveWins: 0,
    colorIndex: 0,
  },
  {
    id: 2,
    name: "Player 2",
    image: "https://picsum.photos/seed/battle2/200/200.jpg",
    score: 0,
    wins: 0,
    consecutiveWins: 0,
    colorIndex: 1,
  },
];

const MAX_COMPETITORS = 6;
const MIN_COMPETITORS = 2;
const MAX_CONSECUTIVE_WINS = 5;

function getRandomImageUrl(seed: string): string {
  return `https://picsum.photos/seed/${seed}/200/200.jpg`;
}

function loadState(): {
  competitors: Competitor[];
  battleCount: number;
  soundEnabled: boolean;
  backgroundMusicEnabled: boolean;
  backgroundMusicVolume: number;
  autoBattleEnabled: boolean;
  autoBattleInterval: number;
  showSettings: boolean;
  cardSize: "compact" | "normal" | "large";
} {
  if (typeof window === "undefined") {
    return {
      competitors: DEFAULT_COMPETITORS,
      battleCount: 0,
      soundEnabled: true,
      backgroundMusicEnabled: false,
      backgroundMusicVolume: 0.3,
      autoBattleEnabled: false,
      autoBattleInterval: 3000,
      showSettings: false,
      cardSize: "normal",
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        competitors: parsed.competitors || DEFAULT_COMPETITORS,
        battleCount: parsed.battleCount || 0,
        soundEnabled: parsed.soundEnabled !== undefined ? parsed.soundEnabled : true,
        backgroundMusicEnabled: parsed.backgroundMusicEnabled || false,
        backgroundMusicVolume: parsed.backgroundMusicVolume || 0.3,
        autoBattleEnabled: parsed.autoBattleEnabled || false,
        autoBattleInterval: parsed.autoBattleInterval || 3000,
        showSettings: false,
        cardSize: parsed.cardSize || "normal",
      };
    }
  } catch (e) {
    console.error("Failed to load battle arena state:", e);
  }

  return {
    competitors: DEFAULT_COMPETITORS,
    battleCount: 0,
    soundEnabled: true,
    backgroundMusicEnabled: false,
    backgroundMusicVolume: 0.3,
    autoBattleEnabled: false,
    autoBattleInterval: 3000,
    showSettings: false,
    cardSize: "normal",
  };
}

export default function BattleArena() {
  const initialState = loadState();

  const [competitors, setCompetitors] = useState<Competitor[]>(initialState.competitors);
  const [battleCount, setBattleCount] = useState(initialState.battleCount);
  const [soundEnabled, setSoundEnabled] = useState(initialState.soundEnabled);
  const [backgroundMusicEnabled, setBackgroundMusicEnabled] = useState(initialState.backgroundMusicEnabled);
  const [backgroundMusicVolume, setBackgroundMusicVolume] = useState(initialState.backgroundMusicVolume);
  const [autoBattleEnabled, setAutoBattleEnabled] = useState(initialState.autoBattleEnabled);
  const [autoBattleInterval, setAutoBattleInterval] = useState(initialState.autoBattleInterval);
  const [showSettings, setShowSettings] = useState(initialState.showSettings);
  const [cardSize, setCardSize] = useState(initialState.cardSize);
  const [lastWinnerId, setLastWinnerId] = useState<number | null>(null);
  const [isBattleAnimating, setIsBattleAnimating] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const autoBattleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 640);
    }
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback(
    (type: "battle" | "win" | "click" | "error") => {
      if (!soundEnabled) return;

      const ctx = initAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      switch (type) {
        case "battle":
          oscillator.type = "square";
          oscillator.frequency.setValueAtTime(200, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
          oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
          gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.3);
          break;
        case "win":
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
          oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
          oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
          oscillator.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.3); // C6
          gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.5);
          break;
        case "click":
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(800, ctx.currentTime);
          gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.1);
          break;
        case "error":
          oscillator.type = "sawtooth";
          oscillator.frequency.setValueAtTime(150, ctx.currentTime);
          gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.2);
          break;
      }
    },
    [soundEnabled, initAudioContext]
  );

  const startBackgroundMusic = useCallback(() => {
    if (!backgroundMusicEnabled || backgroundMusicRef.current) return;

    const ctx = initAudioContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    // Create a simple ambient background music using Web Audio API
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.type = "sine";
    oscillator.frequency.value = 110; // A2

    filter.type = "lowpass";
    filter.frequency.value = 800;
    filter.Q.value = 1;

    // LFO for subtle modulation
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = 0.1; // Very slow modulation
    lfoGain.gain.value = 5; // Modulation depth in Hz

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);

    gainNode.gain.value = backgroundMusicVolume * 0.1;

    oscillator.start();
    lfo.start();

    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;
    lfoRef.current = lfo;
    lfoGainRef.current = lfoGain;
    backgroundMusicRef.current = {} as HTMLAudioElement; // Just a marker
  }, [backgroundMusicEnabled, backgroundMusicVolume, initAudioContext]);

  const stopBackgroundMusic = useCallback(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
    if (lfoRef.current) {
      lfoRef.current.stop();
      lfoRef.current = null;
    }
    gainNodeRef.current = null;
    lfoGainRef.current = null;
    backgroundMusicRef.current = null;
  }, []);

  useEffect(() => {
    if (backgroundMusicEnabled) {
      startBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
    return () => stopBackgroundMusic();
  }, [backgroundMusicEnabled, startBackgroundMusic, stopBackgroundMusic]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = backgroundMusicVolume * 0.1;
    }
  }, [backgroundMusicVolume]);

  const saveState = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          competitors,
          battleCount,
          soundEnabled,
          backgroundMusicEnabled,
          backgroundMusicVolume,
          autoBattleEnabled,
          autoBattleInterval,
          cardSize,
        })
      );
    } catch (e) {
      console.error("Failed to save battle arena state:", e);
    }
  }, [competitors, battleCount, soundEnabled, backgroundMusicEnabled, backgroundMusicVolume, autoBattleEnabled, autoBattleInterval, cardSize]);

  useEffect(() => {
    saveState();
  }, [saveState]);

  const selectWinner = useCallback(() => {
    if (competitors.length < MIN_COMPETITORS) return;

    setIsBattleAnimating(true);
    playSound("battle");

    // Build weighted array based on consecutive wins (lower consecutive wins = higher chance)
    const weightedPool: Competitor[] = [];
    competitors.forEach((c) => {
      const weight = Math.max(1, MAX_CONSECUTIVE_WINS - c.consecutiveWins + 1);
      for (let i = 0; i < weight; i++) {
        weightedPool.push(c);
      }
    });

    const winner = weightedPool[Math.floor(Math.random() * weightedPool.length)];
    const winnerIndex = competitors.findIndex((c) => c.id === winner.id);

    setTimeout(() => {
      setCompetitors((prev) => {
        const updated = [...prev];
        updated[winnerIndex] = {
          ...updated[winnerIndex],
          score: updated[winnerIndex].score + 1,
          wins: updated[winnerIndex].wins + 1,
          consecutiveWins: updated[winnerIndex].consecutiveWins + 1,
        };
        // Reset consecutive wins for others
        updated.forEach((c, i) => {
          if (i !== winnerIndex) {
            updated[i] = { ...c, consecutiveWins: 0 };
          }
        });
        return updated;
      });
      setBattleCount((prev) => prev + 1);
      setLastWinnerId(winner.id);
      playSound("win");
      setIsBattleAnimating(false);
    }, 800);
  }, [competitors, playSound]);

  const handleAutoBattle = useCallback(() => {
    if (autoBattleEnabled && !isBattleAnimating) {
      autoBattleTimerRef.current = setTimeout(() => {
        selectWinner();
      }, autoBattleInterval);
    }
    return () => {
      if (autoBattleTimerRef.current) {
        clearTimeout(autoBattleTimerRef.current);
      }
    };
  }, [autoBattleEnabled, autoBattleInterval, isBattleAnimating, selectWinner]);

  useEffect(() => {
    const cleanup = handleAutoBattle();
    return cleanup;
  }, [handleAutoBattle]);

  const addCompetitor = useCallback(() => {
    if (competitors.length >= MAX_COMPETITORS) {
      playSound("error");
      return;
    }
    playSound("click");
    const newId = Math.max(...competitors.map((c) => c.id)) + 1;
    setCompetitors((prev) => [
      ...prev,
      {
        id: newId,
        name: `Player ${newId}`,
        image: getRandomImageUrl(`battle${newId}`),
        score: 0,
        wins: 0,
        consecutiveWins: 0,
        colorIndex: 0,
      },
    ]);
  }, [competitors, playSound]);

  const removeCompetitor = useCallback(
    (id: number) => {
      if (competitors.length <= MIN_COMPETITORS) {
        playSound("error");
        return;
      }
      playSound("click");
      setCompetitors((prev) => prev.filter((c) => c.id !== id));
    },
    [competitors.length, playSound]
  );

  const updateCompetitorName = useCallback((id: number, name: string) => {
    setCompetitors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name } : c))
    );
  }, []);

  const updateCompetitorImage = useCallback((id: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCompetitors((prev) =>
        prev.map((c) => (c.id === id ? { ...c, image: e.target?.result as string } : c))
      );
    };
    reader.readAsDataURL(file);
  }, []);

  const resetScores = useCallback(() => {
    playSound("click");
    setCompetitors((prev) =>
      prev.map((c) => ({ ...c, score: 0, wins: 0, consecutiveWins: 0 }))
    );
    setBattleCount(0);
    setLastWinnerId(null);
  }, [playSound]);

  const reorderCompetitors = useCallback((fromIndex: number, toIndex: number) => {
    setCompetitors((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, removed);
      return updated;
    });
  }, []);

  const cardSizeClasses = {
    compact: "w-32 h-40 md:w-36 md:h-44",
    normal: "w-40 h-48 md:w-44 md:h-52",
    large: "w-48 h-56 md:w-52 md:h-60",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4 safe-top safe-bottom">
      <div className="container">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 md:mb-8 px-4 py-2.5 bg-white dark:bg-gray-800 text-white dark:text-gray-950 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 min-h-[48px]"
        >
          ← Back to Games
        </Link>

        {/* Header */}
        <header className="text-center mb-6 md:mb-8 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-battle mb-3">
            ⚔️ Battle Arena
          </h1>
          <p className="text-lg md:text-xl text-gray-900 dark:text-gray-950 max-w-2xl mx-auto">
            Random competitor battles with weighted odds, persistent stats, and epic sound effects!
          </p>
        </header>

        {/* Battle Stats */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-6 md:mb-8 animate-fade-in-up stagger-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6 border-4 border-purple-500/30 min-w-[140px] text-center">
            <div className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-medium">Total Battles</div>
            <div className="text-3xl md:text-4xl font-bold text-gradient-battle font-mono">{battleCount}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6 border-4 border-pink-500/30 min-w-[140px] text-center">
            <div className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-medium">Competitors</div>
            <div className="text-3xl md:text-4xl font-bold text-gradient-battle font-mono">{competitors.length}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6 border-4 border-indigo-500/30 min-w-[140px] text-center">
            <div className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-medium">Max Consecutive</div>
            <div className="text-3xl md:text-4xl font-bold text-gradient-battle font-mono">{MAX_CONSECUTIVE_WINS}</div>
          </div>
        </div>

        {/* Settings Drawer */}
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-labelledby="settings-title">
          {showSettings && (
            <>
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
              <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-xl p-6 max-h-[80vh] overflow-y-auto animate-slide-up" style={{ zIndex: 50 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 id="settings-title" className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Settings
                  </h2>
                  <button onClick={() => setShowSettings(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-[44px] min-w-[44px]" aria-label="Close settings">
                    ✕
                  </button>
                </div>
                <SettingsPanel
                  soundEnabled={soundEnabled}
                  onSoundEnabledToggle={() => setSoundEnabled(!soundEnabled)}
                  backgroundMusicEnabled={backgroundMusicEnabled}
                  onBackgroundMusicEnabledToggle={() => setBackgroundMusicEnabled(!backgroundMusicEnabled)}
                  backgroundMusicVolume={backgroundMusicVolume}
                  onBackgroundMusicVolumeChange={setBackgroundMusicVolume}
                  autoBattleEnabled={autoBattleEnabled}
                  onAutoBattleEnabledToggle={() => setAutoBattleEnabled(!autoBattleEnabled)}
                  autoBattleInterval={autoBattleInterval}
                  onAutoBattleIntervalChange={setAutoBattleInterval}
                  cardSize={cardSize}
                  onCardSizeChange={setCardSize}
                />
              </div>
            </>
          )}
        </div>

        {/* Competitor Cards */}
        <div className="mb-6 md:mb-8 animate-fade-in-up stagger-2" role="region" aria-label="Competitors">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">Competitors</h2>
            <div className="flex items-center gap-3 md:gap-4">
              {/* Card Size Selector */}
              <div className="flex items-center gap-2 hidden sm:flex">
                <span className="text-sm text-gray-600 dark:text-gray-400">Card Size:</span>
                <select
                  value={cardSize}
                  onChange={(e) => setCardSize(e.target.value as "compact" | "normal" | "large")}
                  className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px]"
                >
                  <option value="compact">Compact</option>
                  <option value="normal">Normal</option>
                  <option value="large">Large</option>
                </select>
              </div>
              {/* Settings Button (Mobile) */}
              <button
                onClick={() => setShowSettings(true)}
                className="btn-secondary px-4 py-2.5 min-h-[44px] lg:hidden"
                aria-label="Open settings"
              >
                ⚙️ Settings
              </button>
              {/* Add Competitor Button */}
              <button
                onClick={addCompetitor}
                disabled={competitors.length >= MAX_COMPETITORS}
                className="btn-primary px-4 py-2.5 min-h-[44px] disabled:opacity-50"
                aria-label="Add competitor"
              >
                + Add Competitor
              </button>
            </div>
          </div>

          {/* Desktop: Horizontal scroll with drag-drop */}
          <div
            className="flex gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-6 -mx-4 md:mx-0 px-4 md:px-0"
            role="list"
            aria-label="Competitor cards"
          >
            {competitors.map((competitor, index) => (
              <CompetitorCard
                key={competitor.id}
                competitor={competitor}
                index={index}
                isWinner={lastWinnerId === competitor.id}
                isAnimating={isBattleAnimating}
                cardSize={cardSizeClasses[cardSize]}
                colorIndex={competitor.colorIndex}
                onNameChange={(name) => updateCompetitorName(competitor.id, name)}
                onImageChange={(file) => updateCompetitorImage(competitor.id, file)}
                onRemove={() => removeCompetitor(competitor.id)}
                onDragStart={(e) => {
        e.dataTransfer?.setData("text/plain", String(index));
        setDragIndex(index);
      }}
                onDragOver={(e) => {
        e.preventDefault();
      }}
                onDrop={(e) => {
        e.preventDefault();
        const droppedIndex = Number(e.dataTransfer?.getData("text/plain") || "-1");
        if (droppedIndex !== index && droppedIndex >= 0) {
          const newCompetitors = [...competitors];
          [newCompetitors[index], newCompetitors[droppedIndex]] = [
            newCompetitors[droppedIndex],
            newCompetitors[index],
          ];
          setCompetitors(newCompetitors);
        }
      }}
                onDragEnd={() => setDragIndex(null)}
                canRemove={competitors.length > MIN_COMPETITORS}
              />
            ))}
          </div>

          {/* Mobile: Card Size Selector */}
          <div className="flex items-center justify-center gap-2 md:hidden mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">Card Size:</span>
            <select
              value={cardSize}
              onChange={(e) => setCardSize(e.target.value as "compact" | "normal" | "large")}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px]"
            >
              <option value="compact">Compact</option>
              <option value="normal">Normal</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>

        {/* Battle Button */}
        <div className="mb-6 md:mb-8 animate-fade-in-up stagger-3">
          <button
            onClick={selectWinner}
            disabled={isBattleAnimating || competitors.length < MIN_COMPETITORS}
            className="btn-primary px-10 md:px-16 py-4 md:py-5 text-lg md:text-xl min-w-[280px] shadow-xl w-full sm:w-auto"
            style={{ boxShadow: "0 10px 30px -10px var(--battle-glow)", minHeight: "56px" }}
            aria-label={isBattleAnimating ? "Battle in progress" : "Start battle"}
          >
            {isBattleAnimating ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Battling...
              </span>
            ) : (
              "⚔️ BATTLE!"
            )}
          </button>
        </div>

        {/* Last Winner Display */}
        {lastWinnerId && (
          <div className="mb-6 md:mb-8 animate-bounce-in stagger-4" role="status" aria-live="polite">
            <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6 border-4 border-yellow-400/30">
              <div className="text-4xl md:text-5xl animate-bounce">🏆</div>
              <div>
                <div className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-medium">Last Winner</div>
                <div className="text-2xl md:text-3xl font-bold text-gradient-battle">
                  {competitors.find((c) => c.id === lastWinnerId)?.name}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 mb-8 md:mb-12 animate-fade-in-up stagger-5">
          <button
            onClick={resetScores}
            className="btn-secondary px-8 py-3 text-lg min-w-[200px] min-h-[48px]"
          >
            🔄 Reset Scores
          </button>

          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-gray-700 dark:text-gray-300 font-medium">🔊 Sound Effects</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={backgroundMusicEnabled}
                onChange={(e) => setBackgroundMusicEnabled(e.target.checked)}
                className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
              />
              <span className="text-gray-700 dark:text-gray-300 font-medium">🎵 Background Music</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={autoBattleEnabled}
                onChange={(e) => setAutoBattleEnabled(e.target.checked)}
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-gray-700 dark:text-gray-300 font-medium">🤖 Auto Battle</span>
            </label>
          </div>
        </div>

        {/* Auto Battle Interval (when enabled) */}
        {autoBattleEnabled && (
          <div className="mb-8 md:mb-12 animate-fade-in-up stagger-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Auto Battle Interval: {autoBattleInterval / 1000}s
            </label>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={autoBattleInterval}
              onChange={(e) => setAutoBattleInterval(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600 min-h-[44px]"
              aria-label="Auto battle interval in seconds"
            />
          </div>
        )}

        {/* Settings Panel (Desktop) */}
        <div className="hidden lg:block animate-fade-in-up stagger-5">
          <SettingsPanel
            soundEnabled={soundEnabled}
            onSoundEnabledToggle={() => setSoundEnabled(!soundEnabled)}
            backgroundMusicEnabled={backgroundMusicEnabled}
            onBackgroundMusicEnabledToggle={() => setBackgroundMusicEnabled(!backgroundMusicEnabled)}
            backgroundMusicVolume={backgroundMusicVolume}
            onBackgroundMusicVolumeChange={setBackgroundMusicVolume}
            autoBattleEnabled={autoBattleEnabled}
            onAutoBattleEnabledToggle={() => setAutoBattleEnabled(!autoBattleEnabled)}
            autoBattleInterval={autoBattleInterval}
            onAutoBattleIntervalChange={setAutoBattleInterval}
            cardSize={cardSize}
            onCardSizeChange={setCardSize}
          />
        </div>

        {/* AdSense Banner */}
        <div className="my-8 md:my-12 animate-fade-in-up" role="complementary" aria-label="Advertisement">
          <AdSenseBanner className="w-full max-w-4xl mx-auto" />
        </div>

        {/* AdSense In-Article */}
        <div className="my-8 md:my-12 animate-fade-in-up" role="complementary" aria-label="Advertisement">
          <AdSenseInArticle className="w-full max-w-4xl mx-auto" />
        </div>

        {/* Instructions */}
        <div className="mt-8 md:mt-12 p-6 rounded-2xl glass border border-white/20 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span>📖</span> How to Play
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm md:text-base">
            <li className="flex items-start gap-2">&#8226; Click on character images to upload your own photos</li>
            <li className="flex items-start gap-2">&#8226; Edit names by typing in the input fields below each character</li>
            <li className="flex items-start gap-2">&#8226; Click "BATTLE!" to randomly select a winner</li>
            <li className="flex items-start gap-2">&#8226; Winner&apos;s score increases by 1 point</li>
            <li className="flex items-start gap-2">&#8226; No competitor can win 5 times in a row!</li>
            <li className="flex items-start gap-2">&#8226; Click "Reset Scores" to start fresh</li>
            <li className="flex items-start gap-2">&#8226; Add more competitors with "+ Add Competitor" (max 6)</li>
            <li className="flex items-start gap-2">&#8226; Remove competitors with the &times; button (minimum 2)</li>
            <li className="flex items-start gap-2">&#8226; Drag and drop cards to reorder (desktop)</li>
            <li className="flex items-start gap-2">&#8226; Swipe horizontally to see all competitors (mobile)</li>
            <li className="flex items-start gap-2">&#8226; Enable Auto Battle in Settings for continuous battles</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Settings Panel Component
interface SettingsPanelProps {
  soundEnabled: boolean;
  onSoundEnabledToggle: () => void;
  backgroundMusicEnabled: boolean;
  onBackgroundMusicEnabledToggle: () => void;
  backgroundMusicVolume: number;
  onBackgroundMusicVolumeChange: (value: number) => void;
  autoBattleEnabled: boolean;
  onAutoBattleEnabledToggle: () => void;
  autoBattleInterval: number;
  onAutoBattleIntervalChange: (value: number) => void;
  cardSize: "compact" | "normal" | "large";
  onCardSizeChange: (value: "compact" | "normal" | "large") => void;
}

function SettingsPanel({
  soundEnabled,
  onSoundEnabledToggle,
  backgroundMusicEnabled,
  onBackgroundMusicEnabledToggle,
  backgroundMusicVolume,
  onBackgroundMusicVolumeChange,
  autoBattleEnabled,
  onAutoBattleEnabledToggle,
  autoBattleInterval,
  onAutoBattleIntervalChange,
  cardSize,
  onCardSizeChange,
}: SettingsPanelProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 glass-strong border border-white/20">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
        <span>⚙️</span> Settings
      </h3>

      <div className="space-y-6">
        {/* Sound Effects */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-2xl">🔊</div>
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Sound Effects</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Play sounds for battles and wins</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={onSoundEnabledToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Background Music */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center text-2xl">🎵</div>
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Background Music</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Ambient procedural music during gameplay</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={backgroundMusicEnabled}
              onChange={onBackgroundMusicEnabledToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 dark:peer-focus:ring-pink-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
          </label>
        </div>

        {backgroundMusicEnabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Music Volume: {Math.round(backgroundMusicVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={backgroundMusicVolume}
              onChange={(e) => onBackgroundMusicVolumeChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-600 min-h-[44px]"
            />
          </div>
        )}

        {/* Auto Battle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-2xl">🤖</div>
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Auto Battle</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Automatically start new battles continuously</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={autoBattleEnabled}
              onChange={onAutoBattleEnabledToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {autoBattleEnabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Battle Interval: {autoBattleInterval / 1000}s
            </label>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={autoBattleInterval}
              onChange={(e) => onAutoBattleIntervalChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 min-h-[44px]"
            />
          </div>
        )}

        {/* Card Size */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-2xl">📏</div>
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Card Size</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Adjust competitor card display size</div>
            </div>
          </div>
          <select
            value={cardSize}
            onChange={(e) => onCardSizeChange(e.target.value as "compact" | "normal" | "large")}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px] min-w-[140px]"
          >
            <option value="compact">Compact</option>
            <option value="normal">Normal</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// Competitor Card Component
interface CompetitorCardProps {
  competitor: Competitor;
  index: number;
  isWinner: boolean;
  isAnimating: boolean;
  cardSize: string;
  colorIndex: number;
  onNameChange: (name: string) => void;
  onImageChange: (file: File) => void;
  onRemove: () => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  canRemove: boolean;
}

function CompetitorCard({
  competitor,
  index,
  isWinner,
  isAnimating,
  cardSize,
  colorIndex,
  onNameChange,
  onImageChange,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  canRemove,
}: CompetitorCardProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const theme = COLOR_THEMES[colorIndex];
  const cardBg = CARD_BG_GRADIENTS[colorIndex];

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
    onDragStart(e, index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
    onDragOver(e, index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(null);
    onDrop(e, index);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOverIndex(null);
    onDragEnd();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };

  return (
    <div
      className={`relative flex-shrink-0 ${cardSize} ${isWinner ? "ring-4 ring-yellow-400/50 animate-pulse" : ""} ${isDragging ? "opacity-50 rotate-2" : ""} ${dragOverIndex === index ? "ring-4 ring-purple-400/50" : ""} ${theme.border} ${cardBg} transition-all duration-200`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      role="listitem"
      aria-label={`${competitor.name}, Score: ${competitor.score}, Wins: ${competitor.wins}`}
    >
      {/* Winner Badge */}
      {isWinner && (
        <div className="absolute -top-3 -right-3 z-10 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full animate-bounce shadow-lg">
          🏆 WINNER
        </div>
      )}

      {/* Remove Button */}
      {canRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg flex items-center justify-center font-bold text-lg min-h-[44px] min-w-[44px] z-10"
          aria-label={`Remove ${competitor.name}`}
        >
          ×
        </button>
      )}

      {/* Image Upload */}
      <label className="relative w-full h-full cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="absolute inset-0 opacity-0 cursor-pointer"
          aria-label={`Upload image for ${competitor.name}`}
        />
        <div
          className="w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-transparent hover:border-purple-400/50 transition-colors"
          style={{ boxShadow: isWinner ? "0 0 20px rgba(234, 179, 8, 0.5)" : "none" }}
        >
          <img
            src={competitor.image}
            alt={`${competitor.name} avatar`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
            <span className="text-3xl opacity-0 hover:opacity-100 transition-opacity">📷</span>
          </div>
        </div>
      </label>

      {/* Name Input */}
      <input
        type="text"
        value={competitor.name}
        onChange={(e) => onNameChange(e.target.value)}
        className="mt-2 w-full px-3 py-2 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-white dark:text-gray-950 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base min-h-[44px]"
        maxLength={20}
        aria-label={`${competitor.name} name`}
      />

      {/* Stats */}
      <div className="mt-2 flex items-center justify-center gap-4 text-xs md:text-sm text-gray-900 dark:text-gray-950">
        <div className="flex items-center gap-1">
          <span>⚔️</span>
          <span className="font-mono font-bold">{competitor.score}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>🏆</span>
          <span className="font-mono font-bold">{competitor.wins}</span>
        </div>
      </div>
    </div>
  );
}