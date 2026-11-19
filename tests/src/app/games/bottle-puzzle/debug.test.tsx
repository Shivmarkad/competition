import { render, screen, fireEvent, act } from '@testing-library/react';
import BottlePuzzle from '@/app/games/bottle-puzzle/page';

describe('debug swap', () => {
  test('perform swap and log state', async () => {
    (globalThis as any).__bp_dbg = true;
    const { container } = render(<BottlePuzzle />);
    const wrappers = container.querySelectorAll<HTMLElement>('[data-bottle-idx]');
    console.log('wrappers:', wrappers.length);
    const fromEl = wrappers[0].querySelector<HTMLElement>('[data-color]')!;
    console.log('fromEl data-color:', fromEl.getAttribute('data-color'));

    const mockTarget = document.createElement('div');
    mockTarget.setAttribute('data-bottle-idx', '1');
    mockTarget.closest = (sel: string) => sel === '[data-bottle-idx]' ? mockTarget : null;
    const orig = (document as any).elementFromPoint;
    (document as any).elementFromPoint = () => mockTarget;

    fireEvent.mouseDown(fromEl, { clientX: 100, clientY: 100 });

    const dbg = container.querySelector('div:last-child');
    console.log('dbg text:', dbg?.textContent);

    fireEvent.mouseUp(window, { clientX: 100, clientY: 100 });
    await act(async () => { await new Promise(r => setTimeout(r, 0)); });
    (document as any).elementFromPoint = orig;

    const after = Array.from(container.querySelectorAll<HTMLElement>('[data-bottle-idx] > [data-color]')).map(e => e.getAttribute('data-color')!);
    console.log('after swap colors:', after);
  });
});
