# Bottle Puzzle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a 6×7 bottle puzzle game where players move bottles into adjacent empty spaces to create lines of exactly four matching bottles.

**Architecture:** The game will be a React component (`BottlePuzzle`) using TypeScript, with state managed via `useState`. The board will be represented as a 2D array of bottle colors. Movement logic will handle shifting bottles into empty cells, and win detection will scan rows, columns, and diagonals for exactly four consecutive matching colors.

**Tech Stack:** React 18+, TypeScript, Next.js (or create-react-app), Tailwind CSS (existing), Jest for testing.

**Spec:** /home/shivganesh/Public/shivganesh/competition/docs/superpowers/specs/2026-11-11-bottle-puzzle-design.md

---
## Global Constraints
- Board size: 6 rows × 7 columns.
- Win condition: exactly four matching bottles in a straight line (horizontal, vertical, or diagonal).
- No special bottles or power‑ups.
- Responsive UI for web and mobile.

---
## Task 1: Scaffold BottlePuzzle page

**Files:**
- Create: `src/app/games/bottle-puzzle/page.tsx`

**Steps:**
- [ ] Create directory `src/app/games/bottle-puzzle`.
- [ ] Create `page.tsx` with the following skeleton:

```tsx
'use client';

import { useState, useEffect } from 'react';

type Bottle = 'red' | 'blue' | 'green' | 'yellow';
type Board = Bottle[][];

export default function BottlePuzzle() {
  const [board, setBoard] = useState<Board>([]);
  const [currentPlayer, setCurrentPlayer] = useState<'red' | 'yellow'>('red');
  const [winner, setWinner] = useState<'red' | 'yellow' | 'draw' | null>(null);
  const [winningCells, setWinningCells] = useState<Set<string>>(new Set());

  // TODO: initialize board, implement move and win logic

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Bottle Puzzle</h1>
      {/* Board will be rendered here */}
    </div>
  );
}

export default BottlePuzzle;
```

- [ ] Verify the file compiles (no TypeScript errors).

---
## Task 2: Initialize board state

**Files:**
- `src/app/games/bottle-puzzle/page.tsx`

**Steps:**
- [ ] Define a helper function `initBoard(rows: number, cols: number): Board` that fills the board with random colors:

```tsx
const initBoard = (rows: number, cols: number): Board => {
  const colors: Bottle[] = ['red', 'blue', 'green', 'yellow'];
  const board: Board = [];
  for (let r = 0; r < rows; r++) {
    board[r] = [];
    for (let c = 0; c < cols; c++) {
      board[r][c] = colors[Math.floor(Math.random() * colors.length)];
    }
  }
  return board;
```

- [ ] Inside a `useEffect` hook, initialize the board with `setBoard(initBoard(6, 7))`.

- [ ] Add state for `currentPlayer`, `winner`, and `winningCells` (already present in skeleton).

- [ ] Ensure the initial render shows an empty board (no UI yet).

---
## Task 3: Implement bottle movement logic

**Files:**
- `src/app/games/bottle-puzzle/page.tsx`

**Steps:**
- [ ] Add a `moveBottle` function that attempts to move a bottle from `(row, col)` into an adjacent empty cell:

```tsx
const moveBottle = (row: number, col: number) => {
  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
    [-1, 1],
  ];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (
      newRow >= 0 &&
      newRow < 6 &&
      newCol >= 0 &&
      newCol < 7 &&
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
      setBoard(newBoard);
      return;
    }
  }
};
```

- [ ] Create a click handler `handleClick` that checks if the clicked cell contains a bottle (`board[row][col] !== 'empty'`) and then calls `moveBottle(row, col)`.

- [ ] Update the board state immutably via `setBoard`.

- [ ] Add a temporary console log or visual cue (e.g., change cell border) to confirm the move occurs.

---
## Task 4: Implement win detection

**Files:**
- `src/app/games/bottle-puzzle/page.tsx`

**Steps:**
- [ ] Add a `checkWin` function that scans the board for exactly four consecutive bottles of the same color in any direction:

```tsx
const checkWin = (b: Board, player: Bottle): boolean => {
  const lines = [
    // horizontal
    ...Array.from({ length: 6 }).map((_, r) =>
      Array.from({ length: 4 }).map((_, c) => [
        [r, c],
        [r, c + 1],
        [r, c + 2],
        [r, c + 3],
      ])
    ),
    // vertical
    ...Array.from({ length: 7 }).map((_, c) =>
      Array.from({ length: 4 }).map((_, r) => [
        [r, c],
        [r + 1, c],
        [r + 2, c],
        [r + 3, c],
      ])
    ),
    // diagonal \
    ...Array.from({ length: 3 }).map((_, r) =>
      Array.from({ length: 4 }).map((_, c) => [
        [r, c],
        [r + 1, c + 1],
        [r + 2, c + 2],
        [r + 3, c + 3],
      ])
    ),
    // diagonal /
    ...Array.from({ length: 3 }).map((_, r) =>
      Array.from({ length: 4 }).map((_, c) => [
        [r, c + 3],
        [r + 1, c + 2],
        [r + 2, c + 2],
        [r + 3, c],
      ])
    ),
  ];

  for (const line of lines) {
    const values = line.map(([r, c]) => b[r][c]);
    const first = values[0];
    if (first === 'empty') continue;
    const allSame = values.every((v) => v === first);
    if (allSame) {
      // Ensure the line is not part of a longer run (exactly 4)
      const left = c - 1 >= 0 ? b[r][c - 1] : 'empty';
      const right = c + 3 < 7 ? b[r][c + 3] : 'empty';
      const up = r - 1 >= 0 ? b[r - 1][c] : 'empty';
      const down = r + 3 < 6 ? b[r + 3][c] : 'empty';
      if (
        left === 'empty' || right === 'empty' ||
        up === 'empty' || down === 'empty'
      ) {
        return true;
      }
    }
  }
  return false;
};
```

- [ ] Call `checkWin` after each successful move (inside `moveBottle` after `setBoard`) and once after the initial board setup.

- [ ] If `checkWin` returns `true`, set `winner` to the current player and populate `winningCells` with the coordinates of the four cells.

---
## Task 5: UI rendering

**Files:**
- `src/app/games/bottle-puzzle/page.tsx`

**Steps:**
- [ ] Render the board as a 6×7 grid of `<button>` elements. Each cell should:
  - Display the bottle color (or be empty).
  - Have a click handler that calls `handleClick` with its coordinates.
  - Use Tailwind classes for styling (e.g., `bg-red-500`, `bg-blue-400`, `bg-gray-200` for empty).

```tsx
<div className="grid grid-cols-7 gap-1">
  {board.map((row, rowIndex) =>
    row.map((cell, colIndex) => (
      <button
        key={`${rowIndex}-${colIndex}`}
        className={`p-2 rounded-lg transition-colors ${
          cell === 'empty'
            ? 'bg-gray-200 dark:bg-gray-700'
            : `bg-${cell}-500 dark:bg-${cell}-500/80`
        }`}
        onClick={() => handleClick(rowIndex, colIndex)}
        disabled={winner !== null}
        aria-label={`Row ${rowIndex + 1}, Column ${colIndex + 1}`}
      >
        {cell === 'empty' ? null : <span className="text-2xl">{cell}</span>}
      </button>
    ))
  )}
</div>
```

- [ ] Show the current player at the top:

```tsx
<div className="mb-4 text-lg font-medium">
  Current Player: <span className="font-bold">{currentPlayer}</span>
</div>
```

- [ ] Display a win message when `winner` is set:

```tsx
{winner && (
  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
    <div className="flex items-center gap-2">
      <span className="text-4xl">{winner === 'draw' ? '🤝' : (winner === 'red' ? '🔴' : '🟡')}</span>
      <div className="text-2xl font-bold">
        {winner === 'draw' ? 'It\\'s a Draw!' : `${winner} Wins!`}
      </div>
    </div>
    <div className="mt-2 text-lg text-gray-600 dark:text-gray-400">
      Four in a row!
    </div>
  </div>
)}
```

- [ ] Add a "New Game" button that calls `resetGame` (implemented in Task 6).

---
## Task 6: Reset functionality

**Files:**
- `src/app/games/bottle-puzzle/page.tsx`

**Steps:**
- [ ] Implement `resetGame` function that restores the initial board state, clears `winner`, resets `currentPlayer` to `'red'`, and empties `winningCells`:

```tsx
const resetGame = () => {
  setBoard(initBoard(6, 7));
  setCurrentPlayer('red');
  setWinner(null);
  setWinningCells(new Set());
};
```

- [ ] Add a button labeled "New Game" that invokes `resetGame`:

```tsx
<button
  onClick={resetGame}
  className="mt-4 btn-primary px-6 py-3 rounded-lg shadow"
>
  New Game
</button>
```

- [ ] Ensure the button is disabled when a game is already won (`winner !== null`).

---
## Task 7: Testing

**Files:**
- `tests/src/app/games/bottle-puzzle/BottlePuzzle.test.tsx`

**Steps:**
- [ ] Create the test file with the following structure:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import BottlePuzzle from '@/app/games/bottle-puzzle/page';
import { act } from 'react-dom/test-utils';

describe('BottlePuzzle', () => {
  test('initial board has 6x7 cells filled', () => {
    render(<BottlePuzzle />);
    const cells = screen.getAllByRole('button');
    expect(cells).toHaveLength(6 * 7);
  });

  test('moveBottle moves a bottle to an adjacent empty cell', () => {
    const { rerender } = render(<BottlePuzzle />);
    // Assume initBoard places a 'red' bottle at (0,0) and an empty cell at (0,1)
    // Simulate the move
    fireEvent.click(screen.getByLabelText('Row 1, Column 1'));
    // Verify the board updated (you may need to expose board via a ref or state inspection)
  });

  test('checkWin detects exactly four in a line', () => {
    const { rerender } = render(<BottlePuzzle />);
    // Manually set a winning line via a helper or mock board state
    // Verify that winner is set
  });

  test('resetGame restores initial state', () => {
    const { rerender } = render(<BottlePuzzle />);
    // Perform a move, then call resetGame (expose via a ref or state inspection)
    // Verify board resets to initial random configuration
  });
});
```

- [ ] Run `npm test` (or the project's test command) and ensure all tests pass.

- [ ] Fix any failing tests by adjusting implementation code.

---
## Task 8: Final commit

**Steps:**
- [ ] Run the full test suite to confirm all tests pass.
- [ ] Perform a final visual inspection of the UI on both desktop and mobile viewports.
- [ ] Commit changes with a descriptive message:

```bash
git add src/app/games/bottle-puzzle page.tsx tests/src/app/games/bottle-puzzle/BottlePuzzle.test.tsx
git commit -m "feat: implement bottle puzzle game with 6x7 board, 4 colors, move and win logic"
```

- [ ] Push the commit to the main branch (or create a feature branch if required).

---
**Execution Choice**  
Plan complete and saved to `docs/superpowers/plans/2026-11-11-bottle-puzzle-plan.md`.  

**Two execution options:**  

1. **Subagent-Driven (recommended)** – I dispatch a fresh subagent per task, review between tasks, fast iteration.  
2. **Inline Execution** – Execute tasks in this session using `executing-plans`, batch execution with checkpoints for review.  

Which approach would you like to use?