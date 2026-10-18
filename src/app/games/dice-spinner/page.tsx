"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface Die {
  id: number;
  value: number;
  isRolling: boolean;
}

export default function DiceSpinner() {
  const [dice, setDice] = useState<Die[]>([
    { id: 1, value: 1, isRolling: false },
  ]);
  const [isRolling, setIsRolling] = useState(false);
  const [total, setTotal] = useState(1);

  const rollDice = useCallback(() => {
    setIsRolling(true);
    setDice((prev) =>
      prev.map((die) => ({ ...die, isRolling: true }))
    );

    // Animate for 1 second with random values
    const animationInterval = setInterval(() => {
      setDice((prev) =>
        prev.map((die) => ({
          ...die,
          value: Math.floor(Math.random() * 6) + 1,
        }))
      );
    }, 100);

    // Stop after 1 second and set final values
    setTimeout(() => {
      clearInterval(animationInterval);
      const finalDice = dice.map((die) => ({
        ...die,
        value: Math.floor(Math.random() * 6) + 1,
        isRolling: false,
      }));
      setDice(finalDice);
      setTotal(finalDice.reduce((sum, die) => sum + die.value, 0));
      setIsRolling(false);
    }, 1000);
  }, [dice]);

  const addDie = useCallback(() => {
    if (dice.length >= 10) return;
    const newDie: Die = {
      id: Math.max(...dice.map((d) => d.id)) + 1,
      value: 1,
      isRolling: false,
    };
    setDice((prev) => [...prev, newDie]);
    setTotal((prev) => prev + 1);
  }, [dice]);

  const removeDie = useCallback((id: number) => {
    if (dice.length <= 1) return;
    setDice((prev) => {
      const updated = prev.filter((die) => die.id !== id);
      setTotal(updated.reduce((sum, die) => sum + die.value, 0));
      return updated;
    });
  }, [dice.length]);

  const getDieFace = (value: number) => {
    const faces: Record<number, string> = {
      1: "⚀",
      2: "⚁",
      3: "⚂",
      4: "⚃",
      5: "⚄",
      6: "⚅",
    };
    return faces[value] || "⚀";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
        >
          ← Back to Games
        </Link>

        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
            🎲 Dice Spinner
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Roll multiple dice and see your total score!
          </p>
        </header>

        {/* Total Display */}
        <div className="text-center mb-12">
          <div className="inline-block bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-4 border-emerald-500">
            <div className="text-gray-600 dark:text-gray-400 text-lg mb-2">
              Total
            </div>
            <div className="text-6xl font-bold text-emerald-600 dark:text-emerald-400">
              {total}
            </div>
          </div>
        </div>

        {/* Dice Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
          {dice.map((die) => (
            <div
              key={die.id}
              className="relative aspect-square"
            >
              <div
                className={`w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center text-8xl border-4 border-emerald-500 transition-all ${
                  die.isRolling ? "animate-spin" : ""
                }`}
              >
                {getDieFace(die.value)}
              </div>
              {dice.length > 1 && (
                <button
                  onClick={() => removeDie(die.id)}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center font-bold shadow-lg"
                  aria-label="Remove die"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={rollDice}
            disabled={isRolling}
            className="px-12 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xl rounded-full shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          >
            {isRolling ? "🎲 Rolling..." : "🎲 Roll Dice"}
          </button>

          <div className="flex gap-4">
            <button
              onClick={addDie}
              disabled={dice.length >= 10}
              className="px-6 py-3 bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Add Die
            </button>
            <span className="px-6 py-3 text-gray-600 dark:text-gray-400 font-medium">
              {dice.length} / 10 dice
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            How to Play
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li>• Click "Roll Dice" to roll all dice at once</li>
            <li>• Add up to 10 dice with "+ Add Die"</li>
            <li>• Remove dice with the × button (minimum 1)</li>
            <li>• Total score is calculated automatically</li>
            <li>• Perfect for board games and decision making!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
