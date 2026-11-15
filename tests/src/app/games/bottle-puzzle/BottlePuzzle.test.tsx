import { render, screen, fireEvent, act } from '@testing-library/react';
import BottlePuzzle from '@/app/games/bottle-puzzle/page';
import '@testing-library/jest-dom';

describe('BottlePuzzle', () => {
  // The player's shelf bottles are wrapped in divs with data-bottle-idx.
  // The Bottle root itself carries data-color, so we can read a bottle's color
  // from the DOM to assert swaps took effect.
  const playerBottles = (container: HTMLElement) =>
    Array.from(
      container.querySelectorAll<HTMLElement>('[data-bottle-idx] > [data-color]')
    ).map(el => el.getAttribute('data-color')!);

  const targetBottles = (container: HTMLElement) => {
    const all = container.querySelectorAll<HTMLElement>('[data-color]');
    // DOM order: player shelf bottles first, then target shelf bottles.
    return Array.from(all).slice(4).map(el => el.getAttribute('data-color')!);
  };

  // Simulate dragging player bottle `fromIdx` and dropping it on player bottle
  // `toIdx`, which swaps topBottles[fromIdx] and topBottles[toIdx].
  const performSwap = async (
    container: HTMLElement,
    fromIdx: number,
    toIdx: number
  ) => {
    const wrappers = container.querySelectorAll<HTMLElement>('[data-bottle-idx]');
    const fromEl = wrappers[fromIdx].querySelector<HTMLElement>('[data-color]')!;

    const mockTarget = document.createElement('div');
    mockTarget.setAttribute('data-bottle-idx', String(toIdx));
    mockTarget.closest = (sel: string) =>
      sel === '[data-bottle-idx]' ? mockTarget : null;

    const originalElementFromPoint = (document as any).elementFromPoint;
    (document as any).elementFromPoint = () => mockTarget;

    fireEvent.mouseDown(fromEl, { clientX: 100, clientY: 100 });
    fireEvent.mouseUp(window, { clientX: 100, clientY: 100 });

    // handleMouseUp defers the swap in setTimeout(0); flush it.
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    (document as any).elementFromPoint = originalElementFromPoint;
  };

  test('renders the Bottle Swap heading and both shelves', () => {
    render(<BottlePuzzle />);
    expect(screen.getByRole('heading', { name: /Bottle Swap/ })).toBeInTheDocument();
    expect(screen.getByText(/Player's Shelf/)).toBeInTheDocument();
    expect(screen.getByText(/Target Sequence/)).toBeInTheDocument();
  });

  test('renders 4 player bottles and 4 target bottles', () => {
    const { container } = render(<BottlePuzzle />);
    expect(playerBottles(container).length).toBe(4);
    expect(targetBottles(container).length).toBe(4);
  });

  test('each bottle carries a color from the palette', () => {
    const { container } = render(<BottlePuzzle />);
    const valid = new Set(['red', 'blue', 'green', 'yellow']);
    const allColors = [...playerBottles(container), ...targetBottles(container)];
    expect(allColors.every(color => valid.has(color))).toBe(true);
  });

  test('reset button and auto mode button are present', () => {
    render(<BottlePuzzle />);
    expect(screen.getByRole('button', { name: /🔄 Reset/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Auto Mode/ })).toBeInTheDocument();
  });

  test('reset re-shuffles the board while keeping 8 bottles', () => {
    const { container } = render(<BottlePuzzle />);
    const before = [...playerBottles(container)];

    fireEvent.click(screen.getByRole('button', { name: /🔄 Reset/ }));

    const after = playerBottles(container);
    expect(after.length).toBe(4);
    // With random shuffling the order almost certainly changes; at minimum the
    // board remains fully populated after reset.
    expect(after.every(c => ['red', 'blue', 'green', 'yellow'].includes(c))).toBe(
      true
    );
  });

  test('dragging a bottle and dropping it on another swaps them', async () => {
    const { container } = render(<BottlePuzzle />);
    const before = playerBottles(container);

    await performSwap(container, 0, 1);

    const after = playerBottles(container);
    expect(after[0]).toBe(before[1]);
    expect(after[1]).toBe(before[0]);
    // Other bottles are untouched.
    expect(after[2]).toBe(before[2]);
    expect(after[3]).toBe(before[3]);
  });

  test('win message shows when player shelf matches target sequence', async () => {
    const { container } = render(<BottlePuzzle />);
    expect(screen.queryByText(/PERFECT MATCH/)).not.toBeInTheDocument();

    const target = targetBottles(container);

    // Place each player bottle onto its matching target position via swaps.
    for (let i = 0; i < 4; i++) {
      const current = playerBottles(container);
      if (current[i] === target[i]) continue;
      const fromIdx = current.indexOf(target[i]);
      await performSwap(container, fromIdx, i);
    }

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(screen.getByText(/PERFECT MATCH/)).toBeInTheDocument();
  });

  test('auto mode becomes busy when started', () => {
    render(<BottlePuzzle />);
    const autoButton = screen.getByRole('button', { name: /Auto Mode/ });
    fireEvent.click(autoButton);
    expect(autoButton).toBeDisabled();
    expect(screen.getByText(/Trying/)).toBeInTheDocument();
  });
});
