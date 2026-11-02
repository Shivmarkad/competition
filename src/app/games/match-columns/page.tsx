"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { AdSenseBanner } from "@/components/ads";

type CellValue = "empty" | "red" | "yellow";
type Board = CellValue[][];

const ROWS = 6;
const COLS = 7;

const PLAYER_COLORS = {
  red: { bg: "bg-red-500", glow: "shadow-red-500/50", name: "Red", emoji: "🔴" },
  yellow: { bg: "bg-yellow-400", glow: "shadow-yellow-400/50", name: "Yellow", emoji: "🟡" },
  empty: { bg: "bg-gray-200 dark:bg-gray-700", glow: "", name: "", emoji: "" },
};

export default function MatchColumns() {
  const [board, setBoard] = useState<Board>(() =>
    Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill("empty"))
  );
  const [currentPlayer, setCurrentPlayer] = useState<"red" | "yellow">("red");
  const [winner, setWinner] = useState<"red" | "yellow" | "draw" | null>(null);
  const [winningCells, setWinningCells] = useState<Set<string>>(new Set());
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [columnHover, setColumnHover] = useState<number | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = { light: 10, medium: 30, heavy: [20, 10, 20] };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  const checkWinner = useCallback((board: Board, row: number, col: number, player: CellValue): boolean => {
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal \
      [1, -1],  // diagonal /
    ];

    for (const [dx, dy] of directions) {
      let count = 1;
      const cells = [`${row},${col}`];

      // Check positive direction
      for (let i = 1; i < 4; i++) {
        const newRow = row + dx * i;
        const newCol = col + dy * i;
        if (
          newRow >= 0 &&
          newRow < ROWS &&
          newCol >= 0 &&
          newCol < COLS &&
          board[newRow][newCol] === player
        ) {
          count++;
          cells.push(`${newRow},${newCol}`);
        } else {
          break;
        }
      }

      // Check negative direction
      for (let i = 1; i < 4; i++) {
        const newRow = row - dx * i;
        const newCol = col - dy * i;
        if (
          newRow >= 0 &&
          newRow < ROWS &&
          newCol >= 0 &&
          newCol < COLS &&
          board[newRow][newCol] === player
        ) {
          count++;
          cells.push(`${newRow},${newCol}`);
        } else {
          break;
        }
      }

      if (count >= 4) {
        setWinningCells(new Set(cells));
        return true;
      }
    }

    return false;
  }, []);

  const dropPiece = useCallback(
    (col: number) => {
      if (winner) return;

      // Find the lowest empty row in this column
      let row = -1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] === "empty") {
          row = r;
          break;
        }
      }

      if (row === -1) return; // Column is full

      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = currentPlayer;
      setBoard(newBoard);
      setLastMove({ row, col });
      triggerHaptic('medium');

      // Check for winner
      if (checkWinner(newBoard, row, col, currentPlayer)) {
        setWinner(currentPlayer);
        setShowConfetti(true);
        triggerHaptic('heavy');
      } else if (newBoard.every((row) => row.every((cell) => cell !== "empty"))) {
        setWinner("draw");
        triggerHaptic('heavy');
      } else {
        setCurrentPlayer(currentPlayer === "red" ? "yellow" : "red");
      }
    },
    [board, currentPlayer, winner, checkWinner, triggerHaptic]
  );

  const resetGame = useCallback(() => {
    triggerHaptic('light');
    setBoard(
      Array(ROWS)
        .fill(null)
        .map(() => Array(COLS).fill("empty"))
    );
    setCurrentPlayer("red");
    setWinner(null);
    setWinningCells(new Set());
    setLastMove(null);
    setShowConfetti(false);
  }, [triggerHaptic]);

  // Generate confetti pieces
  const confettiPieces = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: winner === 'red'
      ? ['#ef4444', '#f87171', '#fca5a5', '#fecaca'][Math.floor(Math.random() * 4)]
      : ['#fde047', '#facc15', '#eab308', '#ca8a04'][Math.floor(Math.random() * 4)],
    delay: Math.random() * 0.8,
    duration: 1.5 + Math.random() * 1.5,
    size: 8 + Math.random() * 12,
  })), [winner]);

  // Calculate board dimensions for responsive sizing
  const cellSize = isMobile ? 'min(12vw, 48px)' : 'min(10vw, 56px)';
  const gapSize = isMobile ? '2px' : '3px';
  const boardPadding = isMobile ? '8px' : '12px';
  const boardBorderRadius = isMobile ? '12px' : '16px';

  const currentPlayerInfo = PLAYER_COLORS[currentPlayer];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4 safe-top safe-bottom">
      <div className="container">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 md:mb-8 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 min-h-[48px]"
        >
          ← Back to Games
        </Link>

        {/* Header */}
        <header className="text-center mb-6 md:mb-8 animate-fade-in-up">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-match mb-3">
            🔴 Match Columns
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Classic Connect-4 gameplay. Drop pieces and connect four to win!
          </p>
        </header>

        {/* Current Player / Winner Display */}
        <div className="text-center mb-6 md:mb-8 animate-fade-in-up stagger-1">
          {winner ? (
            <div className="inline-flex flex-col items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 border-4 border-green-500/30 animate-bounce-in">
              <div className="flex items-center gap-3">
                <span className="text-4xl md:text-5xl animate-bounce">{winner === "draw" ? "🤝" : (winner === "red" ? "🔴" : "🟡")}</span>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {winner === "draw" ? "It's a Draw!" : `${PLAYER_COLORS[winner].name} Wins!`}
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400">
                {winner === "draw" ? "Great game!" : `Four in a row!`}
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6 border-4 border-current/30 animate-fade-in-up" style={{ borderColor: currentPlayerInfo.bg.replace('bg-', '') }}>
              <div className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-medium">
                Current Player
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-full ${currentPlayerInfo.bg} shadow-lg animate-pulse-soft flex items-center justify-center`}
                  style={{ boxShadow: `0 0 20px ${currentPlayer === 'red' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(234, 179, 8, 0.5)'}` }}
                >
                  <span className="text-2xl md:text-3xl">{currentPlayerInfo.emoji}</span>
                </div>
                <span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                  {currentPlayerInfo.name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="mb-6 md:mb-8 animate-fade-in-up stagger-2" role="region" aria-label="Game board">
          <div
            className="inline-block relative"
            style={{
              background: '#1e40af',
              borderRadius: boardBorderRadius,
              padding: boardPadding,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 0 0 4px rgba(30, 64, 175, 0.5)',
            }}
          >
            {/* Column hover indicators */}
            <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none flex gap-[3px] px-[3px]" style={{ gap: gapSize, padding: gapSize }}>
              {Array.from({ length: COLS }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="flex-1 h-full transition-all duration-200"
                  style={{
                    backgroundColor: columnHover === colIndex ? (currentPlayer === 'red' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)') : 'transparent',
                    borderRadius: '8px',
                  }}
                />
              ))}
            </div>

            <div
              className="relative grid gap-[3px]"
              style={{
                gap: gapSize,
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              }}
              role="grid"
              aria-label="Connect 4 board"
            >
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const cellKey = `${rowIndex},${colIndex}`;
                  const isWinning = winningCells.has(cellKey);
                  const isLastMove = lastMove?.row === rowIndex && lastMove?.col === colIndex;
                  const cellColor = PLAYER_COLORS[cell];

                  return (
                    <button
                      key={cellKey}
                      onClick={() => dropPiece(colIndex)}
                      onMouseEnter={() => !winner && setColumnHover(colIndex)}
                      onMouseLeave={() => setColumnHover(null)}
                      disabled={winner !== null || board[0][colIndex] !== "empty"}
                      className={`relative aspect-square rounded-full transition-all duration-300 ${
                        cellColor.bg
                      } ${isWinning ? "animate-pulse ring-4 ring-white/80" : ""} ${
                        isLastMove && !winner ? "ring-2 ring-white/50 scale-105" : ""
                      } ${winner ? "cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"} shadow-inner`}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        minWidth: cellSize,
                        minHeight: cellSize,
                      }}
                      aria-label={`Row ${rowIndex + 1}, Column ${colIndex + 1}${cell !== 'empty' ? `, ${PLAYER_COLORS[cell].name} piece` : ', empty'}`}
                      aria-disabled={winner !== null || board[0][colIndex] !== "empty"}
                    >
                      {/* Piece drop animation for new pieces */}
                      {isLastMove && !winner && (
                        <div className="absolute inset-0 rounded-full animate-piece-drop" style={{ backgroundColor: 'inherit' }} />
                      )}

                      {/* Winning line indicator */}
                      {isWinning && (
                        <div className="absolute inset-0 rounded-full bg-white/30 animate-pulse" />
                      )}

                      {/* Column number hint on hover (desktop) */}
                      {!isMobile && rowIndex === 0 && !winner && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-white/70 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          Col {colIndex + 1}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Confetti */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
            {confettiPieces.map((piece) => (
              <div
                key={piece.id}
                className="absolute top-0 w-2 h-2 transform"
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

        {/* Controls */}
        <div className="flex flex-col items-center gap-4 md:gap-6 animate-fade-in-up stagger-3">
          <button
            onClick={resetGame}
            className="btn-primary px-10 md:px-16 py-4 md:py-5 text-lg md:text-xl min-w-[280px] shadow-xl"
            style={{ boxShadow: '0 10px 30px -10px var(--match-glow)', minHeight: '56px' }}
          >
            🔄 New Game
          </button>

          {/* Column buttons for mobile */}
          {isMobile && !winner && (
            <div className="flex gap-2 flex-wrap justify-center px-2" role="group" aria-label="Column selectors">
              {Array.from({ length: COLS }).map((_, colIndex) => (
                <button
                  key={colIndex}
                  onClick={() => dropPiece(colIndex)}
                  disabled={board[0][colIndex] !== "empty"}
                  className="btn-secondary px-3 py-2 text-sm min-h-[44px] min-w-[44px] disabled:opacity-50"
                  aria-label={`Drop in column ${colIndex + 1}`}
                >
                  {colIndex + 1}
                </button>
              ))}
            </div>
          )}
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
            <li className="flex items-start gap-2">• Click/tap any column to drop your piece</li>
            <li className="flex items-start gap-2">• Pieces fall to the lowest available spot</li>
            <li className="flex items-start gap-2">• Connect 4 pieces horizontally, vertically, or diagonally to win</li>
            <li className="flex items-start gap-2">• Red goes first, then players alternate turns</li>
            <li className="flex items-start gap-2">• Winning pieces highlight with a pulse animation</li>
            <li className="flex items-start gap-2">• Click "New Game" to start over</li>
            <li className="flex items-start gap-2">• Haptic feedback on supported devices</li>
            <li className="flex items-start gap-2">• Column hover preview on desktop</li>
          </ul>
        </div>
      </div>

      <style jsx global>{`
        @keyframes confetti-burst {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) scale(0) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}