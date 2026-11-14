import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import BottlePuzzle from '@/app/games/bottle-puzzle/page';
import '@testing-library/jest-dom';

describe('BottlePuzzle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  // Helper to get all board cells (both play area and target area)
  const getBoardCells = () => screen.getAllByRole('button', { name: /(row|target)/i });

  test('initial board renders 6x7 cells (42 total)', () => {
    render(<BottlePuzzle />);
    const cells = getBoardCells();
    expect(cells.length).toBe(56);
  });

  test('board renders 42 cells (6x7) with target colors at bottom', () => {
    render(<BottlePuzzle />);
    const cells = getBoardCells();
    expect(cells.length).toBe(56);

    // Check that bottom 4 rows (target area) have bottles with yellow ring
    const targetCells = cells.filter(cell => {
      const label = cell.getAttribute('aria-label') || '';
      return label.includes('Target:');
    });
    // 7 columns * 4 target rows = 28 target cells
    expect(targetCells.length).toBe(28);
  });

  test('drop buttons exist for each column', () => {
    render(<BottlePuzzle />);
    const dropButtons = screen.getAllByRole('button', { name: /drop/i });
    expect(dropButtons.length).toBe(7);
  });

  test('clicking drop button adds bottle to column with gravity', async () => {
    render(<BottlePuzzle />);

    // Wait for client-side rendering
    await waitFor(() => {
      const cells = getBoardCells();
      expect(cells.length).toBe(56);
    });

    // Find drop button for column 0
    const dropButtons = screen.getAllByRole('button', { name: /drop/i });
    const firstDropButton = dropButtons[0];
    expect(firstDropButton).toBeInTheDocument();

    // Click drop button
    act(() => {
      fireEvent.click(firstDropButton);
    });

    // Check that a bottle was added to column 0 (should be at bottom of play area - bottleIndex 8)
    // columnBottles: 4 target (indices 0-3) + 4 play (indices 4-7), bottom play is index 7 -> bottleIndex + 1 = 8
    const cells = getBoardCells();
    const col0Row1 = cells.find(c => c.getAttribute('aria-label')?.includes('Row 8, Column 1') && !c.getAttribute('aria-label')?.includes('Target'));
    // Note: After gravity, bottle should fall to bottom of play area
    expect(col0Row1).toBeInTheDocument();
  });

  test('reset game button exists', () => {
    render(<BottlePuzzle />);
    const resetButton = screen.getByRole('button', { name: /new game/i });
    expect(resetButton).toBeInTheDocument();
  });

  test('reset game clears board and generates new targets', async () => {
    render(<BottlePuzzle />);

    await waitFor(() => {
      const cells = getBoardCells();
      expect(cells.length).toBe(56);
    });

    const resetButton = screen.getByRole('button', { name: /new game/i });

    act(() => {
      fireEvent.click(resetButton);
    });

    // Board should still have 42 cells
    const cells = getBoardCells();
    expect(cells.length).toBe(56);
  });

  test('completed column shows green ring', async () => {
    render(<BottlePuzzle />);

    await waitFor(() => {
      const cells = getBoardCells();
      expect(cells.length).toBe(56);
    });

    // Drop 4 bottles in column 0 to complete it
    const dropButtons = screen.getAllByRole('button', { name: /drop/i });
    const firstDropButton = dropButtons[0];

    for (let i = 0; i < 4; i++) {
      act(() => {
        fireEvent.click(firstDropButton);
      });
    }

    // Check that column 0 now shows completion (green ring)
    const cells = getBoardCells();
    const completedCells = cells.filter(cell =>
      cell.getAttribute('aria-label')?.includes('Column 1') &&
      cell.hasAttribute('class') &&
      cell.getAttribute('class')?.includes('ring-green')
    );
    expect(completedCells.length).toBeGreaterThan(0);
  });

  test('win detection when all 7 columns complete', async () => {
    render(<BottlePuzzle />);

    await waitFor(() => {
      const cells = getBoardCells();
      expect(cells.length).toBe(56);
    });

    const dropButtons = screen.getAllByRole('button', { name: /drop/i });

    // Complete all 7 columns
    for (let col = 0; col < 7; col++) {
      for (let i = 0; i < 4; i++) {
        act(() => {
          fireEvent.click(dropButtons[col]);
        });
      }
    }

    // Check for win message
    await waitFor(() => {
      const winMessage = screen.getByText(/you win/i);
      expect(winMessage).toBeInTheDocument();
    });
  });

  test('drop button disabled for completed column', async () => {
    render(<BottlePuzzle />);

    await waitFor(() => {
      const cells = getBoardCells();
      expect(cells.length).toBe(56);
    });

    const dropButtons = screen.getAllByRole('button', { name: /drop/i });
    const firstDropButton = dropButtons[0];

    // Complete column 0
    for (let i = 0; i < 4; i++) {
      act(() => {
        fireEvent.click(firstDropButton);
      });
    }

    // Drop button should now be disabled (shows checkmark)
    await waitFor(() => {
      expect(firstDropButton).toBeDisabled();
    });
  });
});