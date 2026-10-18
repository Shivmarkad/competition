"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

type CellValue = "empty" | "red" | "yellow";
type Board = CellValue[][];

const ROWS = 6;
const COLS = 7;
const COLORS = {
  red: "bg-red-500",
  yellow: "bg-yellow-400",
  empty: "bg-gray-200 dark:bg-gray-700",
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

      // Check for winner
      if (checkWinner(newBoard, row, col, currentPlayer)) {
        setWinner(currentPlayer);
      } else if (newBoard.every((row) => row.every((cell) => cell !== "empty"))) {
        setWinner("draw");
      } else {
        setCurrentPlayer(currentPlayer === "red" ? "yellow" : "red");
      }
    },
    [board, currentPlayer, winner, checkWinner]
  );

  const resetGame = useCallback(() => {
    setBoard(
      Array(ROWS)
        .fill(null)
        .map(() => Array(COLS).fill("empty"))
    );
    setCurrentPlayer("red");
    setWinner(null);
    setWinningCells(new Set());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
        >
          ← Back to Games
        </Link>

        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
            🔴 Match Columns
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Connect 4 pieces in a row to win!
          </p>
        </header>

        {/* Current Player / Winner Display */}
        <div className="text-center mb-8">
          {winner ? (
            <div className="inline-block bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border-4 border-green-500 animate-bounce">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {winner === "draw" ? "🤝 It's a Draw!" : `🎉 ${winner === "red" ? "Red" : "Yellow"} Wins!`}
              </div>
            </div>
          ) : (
            <div className="inline-block bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border-4 border-gray-300 dark:border-gray-600">
              <div className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                Current Player
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className={`w-12 h-12 rounded-full ${COLORS[currentPlayer]} shadow-lg`} />
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                  {currentPlayer}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="bg-blue-600 dark:bg-blue-800 rounded-3xl shadow-2xl p-6 mb-8">
          <div className="grid grid-cols-7 gap-3">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const cellKey = `${rowIndex},${colIndex}`;
                const isWinning = winningCells.has(cellKey);
                return (
                  <button
                    key={cellKey}
                    onClick={() => dropPiece(colIndex)}
                    disabled={winner !== null}
                    className={`aspect-square rounded-full ${COLORS[cell]} ${
                      isWinning ? "ring-4 ring-white animate-pulse" : ""
                    } transition-all transform hover:scale-110 disabled:hover:scale-100 shadow-lg`}
                    aria-label={`Drop piece in column ${colIndex + 1}`}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={resetGame}
            className="px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-lg rounded-full shadow-lg hover:from-amber-700 hover:to-orange-700 transition-all transform hover:scale-105 active:scale-95"
          >
            🔄 New Game
          </button>
        </div>

        {/* Instructions */}
        <div className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            How to Play
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li>• Click on any column to drop your piece</li>
            <li>• Pieces fall to the lowest available spot</li>
            <li>• Connect 4 pieces horizontally, vertically, or diagonally to win</li>
            <li>• Red goes first, then players alternate turns</li>
            <li>• Click "New Game" to start over</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
