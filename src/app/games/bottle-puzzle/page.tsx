'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

type BottleColor = 'red' | 'blue' | 'green' | 'yellow';

const COLORS: BottleColor[] = ['red', 'blue', 'green', 'yellow'];

const BOTTLE_STYLES: Record<BottleColor, { bg: string; light: string; dark: string; border: string }> = {
  red: { bg: '#ef4444', light: '#f87171', dark: '#991b1b', border: '#7f1d1d' },
  blue: { bg: '#3b82f6', light: '#60a5fa', dark: '#1e40af', border: '#1e3a8a' },
  green: { bg: '#22c55e', light: '#4ade80', dark: '#15803d', border: '#166534' },
  yellow: { bg: '#eab308', light: '#facc15', dark: '#854d0e', border: '#713f12' },
};

export default function BottlePuzzle() {
  const [topBottles, setTopBottles] = useState<BottleColor[]>([]);
  const [targetBottles, setTargetBottles] = useState<BottleColor[]>([]);
  const [winner, setWinner] = useState(false);

  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [charPos, setCharPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [autoModeEnabled, setAutoModeEnabled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const autoModeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs keep the latest drag values without forcing the effect to re-subscribe
  // listeners on every mouse move (dragPos used to be in the effect deps, which
  // tore down and re-added mousemove/mouseup listeners constantly).
  const dragPosRef = useRef({ x: 0, y: 0 });
  const draggingIdxRef = useRef<number | null>(null);

  const initGame = () => {
    const shuffledTargets = [...COLORS].sort(() => Math.random() - 0.5);
    setTargetBottles(shuffledTargets);
    const shuffledTop = [...shuffledTargets].sort(() => Math.random() - 0.5);
    setTopBottles(shuffledTop);
    setWinner(false);
    setDraggingIdx(null);
    setIsDragging(false);
  };

  useEffect(() => {
    initGame();
    // Initial character position
    setCharPos({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight - 100 : 0 });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseDown = (idx: number, e: any) => {
    if (winner || autoModeEnabled) return;

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.clientX !== undefined) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return;
    }

    setDraggingIdx(idx);
    draggingIdxRef.current = idx;
    setIsDragging(true);
    dragPosRef.current = { x: clientX, y: clientY };
    setDragPos({ x: clientX, y: clientY });
    setCharPos({ x: clientX, y: clientY - 50 });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      if (isDragging) {
        dragPosRef.current = { x: clientX, y: clientY };
        setDragPos({ x: clientX, y: clientY });
        setCharPos({ x: clientX, y: clientY - 60 });
      } else {
        // Character subtly follows the mouse when not dragging
        setCharPos(prev => ({
          x: prev.x + (clientX - prev.x) * 0.1,
          y: prev.y + (clientY - prev.y) * 0.1
        }));
      }
    };

    const handleMouseUp = () => {
      if (!isDragging) return;

      // Capture the source index before clearing the ref; the deferred
      // setTimeout(0) swap runs after draggingIdxRef.current has been nulled,
      // so we must not read the ref inside the callback.
      const sourceIdx = draggingIdxRef.current;
      if (sourceIdx !== null) {
        setTimeout(() => {
          const currentDragPos = dragPosRef.current;
          const element = document.elementFromPoint(currentDragPos.x, currentDragPos.y);
          const bottleWrapper = element?.closest('[data-bottle-idx]');

          if (bottleWrapper) {
            const targetIdx = parseInt(bottleWrapper.getAttribute('data-bottle-idx') || '-1', 10);

            if (targetIdx !== -1 && targetIdx !== sourceIdx) {
              setTopBottles(prevTop => {
                const newTop = [...prevTop];
                [newTop[sourceIdx], newTop[targetIdx]] = [newTop[targetIdx], newTop[sourceIdx]];

                if (newTop.every((color, i) => color === targetBottles[i])) {
                  setWinner(true);
                }
                return newTop;
              });
            }
          }
        }, 0);
      }

      setDraggingIdx(null);
      draggingIdxRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, targetBottles]);

  // Automatic random swaps on an interval, exactly like the battle game's Auto Battle.
  // Keeps swapping random bottles until the player shelf matches the target sequence,
  // then stops automatically. Disabled while dragging or after a win.
  const runAutoMode = useCallback(() => {
    if (!autoModeEnabled || winner || isDragging) return;

    const currentTop = topBottles;
    if (currentTop.every((color, i) => color === targetBottles[i])) {
      setWinner(true);
      return;
    }

    const idx1 = Math.floor(Math.random() * 4);
    let idx2 = Math.floor(Math.random() * 4);
    while (idx1 === idx2) {
      idx2 = Math.floor(Math.random() * 4);
    }

    const sourceEl = document.querySelector(`[data-bottle-idx="${idx1}"]`);
    if (sourceEl) {
      const rect = sourceEl.getBoundingClientRect();
      setCharPos({ x: rect.left + rect.width / 2, y: rect.top - 60 });
    }

    setDraggingIdx(idx1);
    setIsDragging(true);
    const startRect = sourceEl?.getBoundingClientRect() || { left: 0, top: 0, width: 64, height: 130 };
    setDragPos({ x: startRect.left + startRect.width / 2, y: startRect.top + startRect.height / 2 });
    setCharPos({ x: startRect.left + startRect.width / 2, y: startRect.top - 60 });

    setTimeout(() => {
      const targetEl = document.querySelector(`[data-bottle-idx="${idx2}"]`);
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        setDragPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
        setCharPos({ x: rect.left + rect.width / 2, y: rect.top - 60 });
      }

      setTopBottles(prevTop => {
        const newTop = [...prevTop];
        [newTop[idx1], newTop[idx2]] = [newTop[idx2], newTop[idx1]];
        if (newTop.every((color, i) => color === targetBottles[i])) {
          setWinner(true);
        }
        return newTop;
      });

      setDraggingIdx(null);
      setIsDragging(false);
    }, 700);
  }, [autoModeEnabled, winner, isDragging, topBottles, targetBottles]);

  useEffect(() => {
    if (!autoModeEnabled) {
      if (autoModeTimerRef.current) {
        clearInterval(autoModeTimerRef.current);
        autoModeTimerRef.current = null;
      }
      return;
    }

    autoModeTimerRef.current = setInterval(runAutoMode, 1200);
    return () => {
      if (autoModeTimerRef.current) {
        clearInterval(autoModeTimerRef.current);
        autoModeTimerRef.current = null;
      }
    };
  }, [autoModeEnabled, runAutoMode]);

  const Bottle = ({ color, isTarget, isDragging, onStart, index }: {
    color: BottleColor;
    isTarget: boolean;
    isDragging: boolean;
    onStart?: (idx: number, e: any) => void;
    index?: number;
  }) => {
    const style = BOTTLE_STYLES[color];

    return (
      <div
        data-color={color}
        onMouseDown={(e) => onStart?.(index!, e)}
        onTouchStart={(e) => onStart?.(index!, e)}
        className={`relative transition-all duration-200 ${isDragging ? 'opacity-0 pointer-events-none' : 'hover:scale-105'} ${isTarget ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
        style={{ width: isMobile ? '48px' : '64px', height: isMobile ? '96px' : '130px' }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 rounded-t-sm"
          style={{
            background: `linear-gradient(90deg, ${style.dark}, ${style.bg}, ${style.dark})`,
            border: `1px solid ${style.border}`
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-4/5 rounded-b-2xl"
          style={{
            background: `linear-gradient(90deg, ${style.dark} 0%, ${style.light} 50%, ${style.dark} 100%)`,
            border: `2px solid ${style.border}`,
            boxShadow: 'inset -6px 0 10px rgba(0,0,0,0.4), 0 8px 15px rgba(0,0,0,0.2)',
          }}
        >
          <div className="absolute left-2 top-2 w-2 h-1/2 bg-white/30 rounded-full blur-[1px]" />
        </div>
        {isTarget && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target</div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-[#fdfcf0] dark:bg-slate-950 py-8 px-4 ${isMobile ? 'py-6' : 'py-8'} overflow-hidden relative select-none`}>
      <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-blue-200/20 rounded-full blur-3xl" />

      <div className={`max-w-xl mx-auto flex flex-col items-center relative ${isMobile ? 'gap-12' : 'gap-16'}`}>
        <Link href="/" className="self-start px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm font-medium">
          ← Back to Games
        </Link>

        <div className={`text-center space-y-4 z-10 ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
          <h1 className={`font-black text-gray-900 dark:text-white tracking-tight ${isMobile ? 'text-4xl' : 'text-5xl'}`}>
            <span className="text-blue-500">🍾</span> Bottle Swap
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
            Drag the bottles to match the target colors!
          </p>
        </div>

        {/* Character always visible */}
        <div
          className="fixed pointer-events-none transition-all duration-300 ease-out z-50 text-5xl"
          style={{
            left: charPos.x,
            top: charPos.y,
            transform: 'translate(-50%, -100%)',
            opacity: 1,
          }}
        >
          👨‍🔬
        </div>

        {/* Dragged Bottle + Hands */}
        {isDragging && draggingIdx !== null && (
          <div
            className="fixed pointer-events-none z-40 transition-transform duration-75"
            style={{
              left: dragPos.x,
              top: dragPos.y,
              transform: 'translate(-50%, -50%) scale(1.1)',
              filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.3))'
            }}
          >
            {/* Left Hand */}
            <div className="absolute -left-10 top-1/2 -translate-y-1/2 text-3xl animate-bounce">🖐️</div>
            {/* Right Hand */}
            <div className="absolute -right-10 top-1/2 -translate-y-1/2 text-3xl animate-bounce scale-x-[-1]">🖐️</div>

            {/* debug */}
            {typeof window !== 'undefined' && typeof (globalThis as any).__bp_dbg !== 'undefined' && (
              <div>{`dbg draggingIdx=${draggingIdx} topBottles=${JSON.stringify(topBottles)} isDragging=${isDragging} color=${topBottles[draggingIdx ?? -1]}`}</div>
            )}
            <Bottle
              color={topBottles[draggingIdx]}
              isTarget={false}
              isDragging={false}
              index={draggingIdx}
            />
          </div>
        )}

        {winner && (
          <div className="bg-green-500 text-white px-8 py-4 rounded-2xl font-black text-2xl animate-bounce shadow-2xl z-10 border-4 border-white">
            🎉 PERFECT MATCH!
          </div>
        )}

        <div className={`flex flex-col items-center relative z-10 ${isMobile ? 'gap-16' : 'gap-28'}`}>
          <div className={`flex gap-6 md:gap-10 p-6 md:p-10 bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl border-8 border-white dark:border-gray-800 relative`}>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-tighter">
              Player's Shelf
            </div>
            {topBottles.map((color, i) => (
              <div
                key={`top-wrap-${i}`}
                data-bottle-idx={i}
                className="relative"
              >
                <Bottle
                  color={color}
                  isTarget={false}
                  isDragging={draggingIdx === i}
                  index={i}
                  onStart={handleMouseDown}
                />
              </div>
            ))}
          </div>

          <div className={`flex gap-6 md:gap-10 p-6 md:p-10 bg-gray-100 dark:bg-gray-800/50 rounded-[40px] border-4 border-dashed border-gray-300 dark:border-gray-700 relative`}>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-400 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-tighter">
              Target Sequence
            </div>
            {targetBottles.map((color, i) => (
              <Bottle
                key={`target-${i}`}
                color={color}
                isTarget={true}
                isDragging={false}
                index={i}
              />
            ))}
          </div>
        </div>

        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'gap-4'} items-center ${isMobile ? 'w-full' : ''}`}>
          <button
            onClick={initGame}
            className={`w-full md:w-auto px-8 py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-md active:scale-95 ${isMobile ? 'text-base' : ''}`}
          >
            🔄 Reset
          </button>
          <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={autoModeEnabled}
              onChange={(e) => setAutoModeEnabled(e.target.checked)}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              🤖 Auto Mode {winner ? '(solved!)' : autoModeEnabled ? '(running...)' : ''}
            </span>
          </label>
        </div>

        <div className="max-w-md text-center text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-900/50 p-6 md:p-8 rounded-2xl backdrop-blur-sm border border-white/20">
          <p className="font-bold mb-2 text-gray-700 dark:text-gray-300">How to play:</p>
          <div className="space-y-2">
            <p>1. 🖱️ <span className="font-semibold">Drag</span> a bottle from the top shelf.</p>
            <p>2. 🎯 <span className="font-semibold">Drop</span> it on another bottle to swap.</p>
            <p>3. ✨ <span className="font-semibold">Align</span> colors with the target row to win!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
