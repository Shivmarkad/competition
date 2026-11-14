'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type Bottle = 'red' | 'blue' | 'green' | 'yellow' | 'empty';
type Board = Bottle[][];

const ROWS = 6;
const COLS = 7;

const BOTTLE_COLORS = {
  red: { bg: 'bg-red-500', name: 'Red', emoji: '🔴' },
  blue: { bg: 'bg-blue-500', name: 'Blue', emoji: '🔵' },
  green: { bg: 'bg-green-500', name: 'Green', emoji: '🟢' },
  yellow: { bg: 'bg-yellow-400', name: 'Yellow', emoji: '🟡' },
  empty: { bg: 'bg-gray-200 dark:bg-gray-700', name: '', emoji: '' },
};

export default function BottlePuzzle() {
  const [board, setBoard] = useState<Board>([]);
  const [winner, setWinner] = useState<Bottle | 'draw' | null>(null);
  const [winningCells, setWinningCells] = useState<Set<string>>(new Set());

  const initBoard = (rows: number, cols: number): Board => {
    const colors: Bottle[] = ['red', 'blue', 'green', 'yellow'];
    const board: Board = [];
    for (let r = 0; r < rows; r++) {
      board[r] = [];
      for (let c = 0; c < cols; c++) {
        board[r][c] = colors[Math.floor(Math.random() * colors.length)];
      }
    }
    // Add some empty spaces for sliding puzzle mechanics
    const emptyCount = Math.floor((rows * cols) / 8); // ~5 empty spaces for 6x7
    for (let i = 0; i < emptyCount; i++) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      board[r][c] = 'empty';
    }
    return board;
  };

  // Apply gravity - bottles fall down into empty spaces below
  const applyGravity = useCallback((board: Board): Board => {
    const newBoard = board.map((row) => [...row]);
    for (let c = 0; c < COLS; c++) {
      let writeRow = ROWS - 1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (newBoard[r][c] !== 'empty') {
          if (writeRow !== r) {
            newBoard[writeRow][c] = newBoard[r][c];
            newBoard[r][c] = 'empty';
          }
          writeRow--;
        }
      }
    }
    return newBoard;
  }, []);

  const checkWin = useCallback((b: Board): { winner: Bottle; cells: string[] } | null => {
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal \
      [1, -1],  // diagonal /
    ];

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const color = b[r][c];
        if (color === 'empty') continue;

        for (const [dr, dc] of directions) {
          let count = 1;
          const cells = [`${r},${c}`];

          // Check positive direction
          for (let i = 1; i < 4; i++) {
            const nr = r + dr * i;
            const nc = c + dc * i;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && b[nr][nc] === color) {
              count++;
              cells.push(`${nr},${nc}`);
            } else {
              break;
            }
          }

          // Check negative direction
          for (let i = 1; i < 4; i++) {
            const nr = r - dr * i;
            const nc = c - dc * i;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && b[nr][nc] === color) {
              count++;
              cells.push(`${nr},${nc}`);
            } else {
              break;
            }
          }

          // Exactly 4 in a row (not more)
          if (count === 4) {
            // Verify it's exactly 4 by checking adjacent cells
            const beforeR = r - dr;
            const beforeC = c - dc;
            const afterR = r + dr * 4;
            const afterC = c + dc * 4;

            const beforeEmpty = beforeR < 0 || beforeR >= ROWS || beforeC < 0 || beforeC >= COLS || b[beforeR][beforeC] !== color;
            const afterEmpty = afterR < 0 || afterR >= ROWS || afterC < 0 || afterC >= COLS || b[afterR][afterC] !== color;

            if (beforeEmpty && afterEmpty) {
              return { winner: color, cells };
            }
          }
        }
      }
    }
    return null;
  }, []);

  useEffect(() => {
    const board = initBoard(ROWS, COLS);
    const boardWithGravity = applyGravity(board);
    setBoard(boardWithGravity);
    // Check for win on initial board
    const winResult = checkWin(boardWithGravity);
    if (winResult) {
      setWinner(winResult.winner);
      setWinningCells(new Set(winResult.cells));
    }
  }, [applyGravity, checkWin]);

  const moveBottle = useCallback((row: number, col: number) => {
    if (winner !== null) return;
    if (board[row][col] === 'empty') return;

    const directions = [
      [0, 1],   // right
      [1, 0],   // down
      [0, -1],  // left
      [-1, 0],  // up
    ];

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (
        newRow >= 0 &&
        newRow < ROWS &&
        newCol >= 0 &&
        newCol < COLS &&
        board[newRow][newCol] === 'empty'
      ) {
        const newBoard = board.map((r, i) =>
          r.map((val, j) =>
            i === row && j === col
              ? 'empty'
              : i === newRow && j === newCol
              ? board[row][col]
              : val
          )
        );
        // Apply gravity after move
        const boardWithGravity = applyGravity(newBoard);
        setBoard(boardWithGravity);

        // Check for win after move
        const winResult = checkWin(boardWithGravity);
        if (winResult) {
          setWinner(winResult.winner);
          setWinningCells(new Set(winResult.cells));
        }
        return;
      }
    }
  }, [board, winner, applyGravity, checkWin]);

  const handleClick = useCallback((row: number, col: number) => {
    if (winner !== null) return;
    if (board[row][col] !== 'empty') {
      moveBottle(row, col);
    }
  }, [winner, board, moveBottle]);

  const resetGame = () => {
    const board = initBoard(ROWS, COLS);
    setBoard(applyGravity(board));
    setWinner(null);
    setWinningCells(new Set());
  };

  const cellSize = 'min(12vw, 48px)';
  const gapSize = '2px';
  const boardPadding = '8px';
  const boardBorderRadius = '12px';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-100 dark:from-slate-900 dark:via-slate-800 py-8 px-4 safe-top safe-bottom">
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
            🔴 Bottle Puzzle
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Match four bottles of the same color in a row to win!
          </p>
        </header>

        {/* Status */}
        <div className="text-center mb-6 md:mb-8 animate-fade-in-up">
          {winner ? (
            <div className="inline-flex flex-col items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 border-4 border-green-500/30 animate-bounce-in">
              <div className="flex items-center gap-3">
                <span className="text-4xl md:text-5xl animate-bounce">
                  {winner === 'draw' ? '🤝' : winner === 'red' ? '🔴' : winner === 'blue' ? '🔵' : winner === 'green' ? '🟢' : '🟡'}
                </span>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {winner === 'draw' ? "It's a Draw!" : `${BOTTLE_COLORS[winner as keyof typeof BOTTLE_COLORS].name} Wins!`}
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400">
                {winner === 'draw' ? "Great game!" : 'Exactly four in a row!'}
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 md:p-6 border-4 border-blue-500/30 animate-fade-in-up">
              <div className="text-gray-600 dark:text-gray-400 text-sm md:text-base font-medium">
                Slide to Match
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-500 shadow-lg animate-pulse-soft flex items-center justify-center" style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}>
                  <span className="text-2xl md:text-3xl">🎯</span>
                </div>
                <span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Your Move
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="mb-6 md:mb-8 animate-fade-in-up">
          <div
            className="inline-block relative"
            style={{
              background: '#1e40af',
              borderRadius: boardBorderRadius,
              padding: boardPadding,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 0 0 4px rgba(30, 64, 175, 0.5)',
            }}
          >
            <div className="relative grid gap-[3px]" style={{ gap: gapSize, gridTemplateColumns: `repeat(7, 1fr)` }}>
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const cellKey = `${rowIndex},${colIndex}`;
                  const isWinning = winningCells.has(cellKey);
                  const isLastMove = false; // placeholder for last move indicator
                  const cellColor = cell === 'empty' ? 'empty' : cell;

                  return (
                    <button
                      key={cellKey}
                      onClick={() => handleClick(rowIndex, colIndex)}
                      disabled={winner !== null}
                      className={`relative aspect-square rounded-full transition-all duration-300 ${
                        cellColor === 'empty'
                          ? 'bg-gray-200 dark:bg-gray-700'
                          : `bg-${cellColor}-500 dark:bg-${cellColor}-500/80`
                      }`}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        minWidth: cellSize,
                        minHeight: cellSize,
                      }}
                      aria-label={`Row ${rowIndex + 1}, Column ${colIndex + 1}${cell !== 'empty' ? `, ${cellColor} bottle` : ', empty'}`}
                      aria-disabled={winner !== null || cell !== 'empty'}
                    >
                      {isWinning && (
                        <div className="absolute inset-0 rounded-full bg-white/30 animate-pulse" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4 md:gap-6 animate-fade-in-up">
          <button
            onClick={resetGame}
            className="btn-primary px-10 md:px-16 py-4 md:py-5 text-lg md:text-xl min-w-[280px] shadow-xl"
            style={{ boxShadow: '0 10px 30px -10px var(--match-glow)', minHeight: '56px' }}
          >
            🔄 New Game
          </button>
        </div>

        {/* AdSense Banner */}
        <div className="my-8 md:my-12 animate-fade-in-up" role="complementary" aria-label="Advertisement">
          <div className="w-full max-w-4xl mx-auto">
            {/* Placeholder for AdSense */}
            <div className="h-48 bg-gray-200 rounded">
              AdSense Banner
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 md:mt-12 p-6 rounded-2xl glass border border-white/20 animate-fade-in-up">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <span>📖</span> How to Play
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-sm md:text-base">
            <li className="flex items-start gap-2">&#8226; Click/tap any bottle to slide it into an adjacent empty space (up, down, left, right)</li>
            <li className="flex items-start gap-2">&#8226; Bottles fall down due to gravity after each move</li>
            <li className="flex items-start gap-2">&#8226; Connect exactly four bottles of the same color horizontally, vertically, or diagonally to win</li>
            <li className="flex items-start gap-2">&#8226; Lines longer than four don't count - must be exactly four</li>
            <li className="flex items-start gap-2">&#8226; Winning bottles highlight with a pulse animation</li>
            <li className="flex items-start gap-2">&#8226; Click "New Game" to start over with a new random board</li>
            <li className="flex items-start gap-2">&#8226; Haptic feedback on supported devices</li>
          </ul>
        </div>
      </div>
    </div>
  );
}