"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { AdSenseBanner } from "@/components/ads";

interface Die {
  id: number;
  value: number;
  isRolling: boolean;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
}

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export default function DiceSpinner() {
  const [dice, setDice] = useState<Die[]>([
    { id: 1, value: 1, isRolling: false, rotationX: 0, rotationY: 0, rotationZ: 0 },
  ]);
  const [isRolling, setIsRolling] = useState(false);
  const [total, setTotal] = useState(1);
  const [lastRollTotal, setLastRollTotal] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Haptic feedback for mobile
  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  const rollDice = useCallback(() => {
    setIsRolling(true);
    triggerHaptic();

    // Generate random target rotations for each die
    setDice((prev) =>
      prev.map((die) => ({
        ...die,
        isRolling: true,
        rotationX: Math.random() * 720 + 360,
        rotationY: Math.random() * 720 + 360,
        rotationZ: Math.random() * 720 + 360,
      }))
    );

    // Animate with intermediate random values
    const animationInterval = setInterval(() => {
      setDice((prev) =>
        prev.map((die) => ({
          ...die,
          value: Math.floor(Math.random() * 6) + 1,
        }))
      );
    }, 80);

    // Stop after ~1 second and set final values
    setTimeout(() => {
      clearInterval(animationInterval);
      const finalDice = dice.map((die) => ({
        ...die,
        value: Math.floor(Math.random() * 6) + 1,
        isRolling: false,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
      }));
      setDice(finalDice);
      const newTotal = finalDice.reduce((sum, die) => sum + die.value, 0);
      setTotal(newTotal);
      setLastRollTotal(newTotal);
      setIsRolling(false);

      // Trigger confetti for high rolls
      if (newTotal >= dice.length * 5) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }

      // Success haptic
      if ('vibrate' in navigator) {
        navigator.vibrate([30, 20, 30]);
      }
    }, 1000);
  }, [dice, triggerHaptic]);

  const addDie = useCallback(() => {
    if (dice.length >= 10) return;
    triggerHaptic();
    const newDie: Die = {
      id: Math.max(...dice.map((d) => d.id)) + 1,
      value: 1,
      isRolling: false,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
    };
    setDice((prev) => [...prev, newDie]);
    setTotal((prev) => prev + 1);
  }, [dice, triggerHaptic]);

  const removeDie = useCallback((id: number) => {
    if (dice.length <= 1) return;
    triggerHaptic();
    setDice((prev) => {
      const updated = prev.filter((die) => die.id !== id);
      setTotal(updated.reduce((sum, die) => sum + die.value, 0));
      return updated;
    });
  }, [dice.length, triggerHaptic]);

  const resetAll = useCallback(() => {
    triggerHaptic();
    setDice([{ id: 1, value: 1, isRolling: false, rotationX: 0, rotationY: 0, rotationZ: 0 }]);
    setTotal(1);
    setLastRollTotal(null);
  }, [triggerHaptic]);

  const getDieFace = (value: number) => DICE_FACES[value - 1] || "⚀";

  // Generate confetti pieces
  const confettiPieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'][Math.floor(Math.random() * 7)],
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1,
    size: 6 + Math.random() * 10,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4 safe-top safe-bottom">
      <div className="container">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 md:mb-8 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 min-h-[48px]"
        >
          ← Back to Games
        </Link>

        {/* Header */}
        <header className="text-center mb-8 md:mb-12 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-dice mb-3">
            🎲 Dice Spinner
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Roll multiple 3D dice with realistic physics. Perfect for board games and battles!
          </p>
        </header>

        {/* Total Display */}
        <div className="text-center mb-8 md:mb-12 animate-fade-in-up stagger-1">
          <div className="inline-flex flex-col items-center gap-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 border-4 border-emerald-500/30 min-w-[200px]">
            <div className="text-gray-600 dark:text-gray-400 text-lg md:text-xl font-medium">
              Total Score
            </div>
            <div className="text-5xl md:text-7xl lg:text-8xl font-bold text-gradient-dice font-mono animate-bounce-in">
              {total}
            </div>
            {lastRollTotal !== null && lastRollTotal !== total && (
              <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium animate-fade-in">
                Last roll: {lastRollTotal}
              </div>
            )}
          </div>
        </div>

        {/* Confetti */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
            {confettiPieces.map((piece) => (
              <div
                key={piece.id}
                className="absolute top-0 w-2 h-2 rounded transform"
                style={{
                  left: `${piece.left}%`,
                  backgroundColor: piece.color,
                  animation: `confetti-burst ${piece.duration}s ease-out ${piece.delay}s forwards`,
                  width: `${piece.size}px`,
                  height: `${piece.size}px`,
                  borderRadius: Math.random() > 0.5 ? '50%' : '0',
                }}
              />
            ))}
          </div>
        )}

        {/* Dice Grid */}
        <div className="mb-8 md:mb-12 animate-fade-in-up stagger-2">
          <div
            className="grid gap-4 md:gap-6"
            style={{
              gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '80px' : '100px'}, 1fr))`,
            }}
            role="list"
            aria-label="Dice"
          >
            {dice.map((die) => (
              <div
                key={die.id}
                className="relative group"
                role="listitem"
              >
                <div
                  className="relative aspect-square cursor-pointer"
                  style={{
                    perspective: '1000px',
                  }}
                >
                  <div
                    className="w-full h-full relative transform-style-3d transition-all duration-1000 cubic-bezier(0.68, -0.55, 0.265, 1.55)"
                    style={{
                      transform: `rotateX(${die.rotationX}deg) rotateY(${die.rotationY}deg) rotateZ(${die.rotationZ}deg)`,
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    {/* 3D Cube Faces */}
                    <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl border-2 border-emerald-500/30 shadow-lg flex items-center justify-center text-5xl md:text-7xl lg:text-8xl" style={{ transform: 'translateZ(50px)' }}>
                      {getDieFace(die.value)}
                    </div>
                    <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl border-2 border-emerald-500/30 shadow-lg" style={{ transform: 'rotateY(180deg) translateZ(50px)' }} />
                    <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl border-2 border-emerald-500/30 shadow-lg" style={{ transform: 'rotateY(90deg) translateZ(50px)' }} />
                    <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl border-2 border-emerald-500/30 shadow-lg" style={{ transform: 'rotateY(-90deg) translateZ(50px)' }} />
                    <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl border-2 border-emerald-500/30 shadow-lg" style={{ transform: 'rotateX(90deg) translateZ(50px)' }} />
                    <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl border-2 border-emerald-500/30 shadow-lg" style={{ transform: 'rotateX(-90deg) translateZ(50px)' }} />
                  </div>

                  {/* Rolling indicator */}
                  {die.isRolling && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 animate-pulse pointer-events-none" />
                  )}
                </div>

                {dice.length > 1 && (
                  <button
                    onClick={() => removeDie(die.id)}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg flex items-center justify-center font-bold text-lg min-h-[44px] min-w-[44px] group-hover:scale-110"
                    aria-label="Remove die"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4 md:gap-6 animate-fade-in-up stagger-3">
          <button
            onClick={rollDice}
            disabled={isRolling}
            className="btn-primary px-10 md:px-16 py-4 md:py-5 text-lg md:text-xl min-w-[280px] shadow-xl"
            style={{ boxShadow: '0 10px 30px -10px var(--dice-glow)', minHeight: '56px' }}
          >
            {isRolling ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Rolling...
              </span>
            ) : (
              "🎲 Roll Dice"
            )}
          </button>

          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <button
              onClick={addDie}
              disabled={dice.length >= 10}
              className="btn-secondary px-6 py-3 text-emerald-600 dark:text-emerald-400 border-emerald-500/50 min-h-[48px]"
            >
              + Add Die
            </button>
            <button
              onClick={resetAll}
              disabled={dice.length === 1 && total === 1}
              className="btn-secondary px-6 py-3 min-h-[48px]"
            >
              🔄 Reset
            </button>
            <span className="px-6 py-3 text-gray-600 dark:text-gray-400 font-medium min-h-[48px] flex items-center">
              {dice.length} / 10 dice
            </span>
          </div>
        </div>

        {/* AdSense Banner */}
        <div className="my-8 md:my-12 animate-fade-in-up" role="complementary" aria-label="Advertisement">
          <AdSenseBanner className="w-full max-w-4xl mx-auto" />
        </div>

        {/* Instructions */}
        <div className="mt-8 md:mt-12 p-6 rounded-2xl glass border border-white/20 animate-fade-in-up stagger-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span>📖</span> How to Play
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm md:text-base">
            <li className="flex items-start gap-2">• Click "Roll Dice" to roll all dice at once with 3D animation</li>
            <li className="flex items-start gap-2">• Add up to 10 dice with "+ Add Die"</li>
            <li className="flex items-start gap-2">• Remove dice with the × button (minimum 1)</li>
            <li className="flex items-start gap-2">• Total score is calculated automatically</li>
            <li className="flex items-start gap-2">• High rolls trigger confetti celebration!</li>
            <li className="flex items-start gap-2">• Haptic feedback on supported devices</li>
            <li className="flex items-start gap-2">• Perfect for board games, D&D, and decision making!</li>
          </ul>
        </div>
      </div>

      {/* Mobile dice styles */}
      <style jsx global>{`
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        @media (pointer: coarse) {
          .dice-face {
            font-size: clamp(2rem, 8vw, 4rem);
          }
        }
      `}</style>
    </div>
  );
}