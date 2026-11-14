# Bottle Puzzle Game Design

## Overview
A casual puzzle game where the player matches bottles by moving them into adjacent empty spaces to create lines of exactly four matching bottles.

## Game Objective
Match exactly four bottles of the same color in a straight line (horizontal, vertical, or diagonal) to win the level.

## Board Layout
- **Dimensions**: 6 rows × 7 columns (6×7 grid)
- **Initial State**: Each column is fully populated with bottles (no empty spaces at start)

## Bottle Types
- **Colors**: 4 simple colors (e.g., red, blue, green, yellow)
- **Appearance**: Each color has a distinct visual representation; no special effects or power‑ups

## Mechanics
- **Movement**: The player can move a bottle into an adjacent empty cell (up, down, left, or right). Bottles fall into empty spaces like in classic drop‑down mechanics.
- **Swapping**: Only bottles adjacent to an empty space can be moved; no direct swapping of two bottles is allowed.
- **Turn‑based**: Players take turns moving one bottle per turn.

## Win Condition
- **Exact Match**: A line of exactly four bottles of the same color in a straight line (horizontal, vertical, or diagonal) triggers a win.
- **Longer Lines**: Lines longer than four do not count as a win (they must be reduced to exactly four).

## Platform
- **Web and Mobile**: Responsive design for both browser (web) and mobile devices (iOS/Android).

## UI/UX Considerations
- **Board Representation**: Grid layout with clear visual distinction between bottle colors.
- **Feedback**: Visual and haptic feedback when a move is made and when a win is achieved.
- **Reset Button**: Option to restart the current level or game.
- **Accessibility**: Proper ARIA labels and high‑contrast modes.

## Implementation Notes
- Reuse the existing grid and movement logic from the Match Columns game as a foundation.
- Extend the board dimensions to 6×7.
- Adjust win detection to require exactly four in a line.
- Ensure mobile‑friendly controls (column taps for movement).
- Test edge cases: full columns, no possible moves, and win detection on all orientations.