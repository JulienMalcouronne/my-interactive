import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ScoreProvider, { useUser } from './UserProvider';

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }));
vi.mock('next/navigation', () => ({ usePathname }));
vi.mock('@/lib', () => ({ generatePseudonym: () => 'FixedName' }));

function Consumer() {
  const { name, score, multiplier, uid, bumpScore, increaseMultiplierClick } = useUser();
  return (
    <div>
      <span data-testid="name">{name}</span>
      <span data-testid="score">{score}</span>
      <span data-testid="multiplier">{multiplier}</span>
      <span data-testid="uid">{uid}</span>
      <button onClick={() => bumpScore(3)}>bump</button>
      <button onClick={increaseMultiplierClick}>inc</button>
    </div>
  );
}

const okVisit = () => ({
  ok: true,
  json: () => Promise.resolve({ name: 'Neo', score: 7, multiplier: '2', uid: 'u1' }),
});

let fetchMock: ReturnType<typeof vi.fn>;

const flush = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

const renderProvider = async () => {
  const utils = render(
    <ScoreProvider>
      <Consumer />
    </ScoreProvider>
  );
  await flush();
  return utils;
};

beforeEach(() => {
  vi.useFakeTimers();
  usePathname.mockReturnValue('/fr');
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
  fetchMock = vi.fn((url: string) => {
    if (url === '/api/visit') return Promise.resolve(okVisit());
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  act(() => {
    vi.runOnlyPendingTimers();
  });
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete window.increaseMultiplier;
  delete window.hiddenSetScore;
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
});

const setHidden = (hidden: boolean) =>
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => (hidden ? 'hidden' : 'visible'),
  });

const userPatchCalls = () => fetchMock.mock.calls.filter(([url]) => url === '/api/users');

describe('initial visit fetch', () => {
  test('hydrates the context from the API response', async () => {
    await renderProvider();

    expect(screen.getByTestId('name')).toHaveTextContent('Neo');
    expect(screen.getByTestId('score')).toHaveTextContent('7');
    expect(screen.getByTestId('multiplier')).toHaveTextContent('2');
    expect(screen.getByTestId('uid')).toHaveTextContent('u1');
  });

  test('defaults score to 0 and multiplier to 1 when the response omits them', async () => {
    fetchMock.mockImplementation((url: string) =>
      url === '/api/visit'
        ? Promise.resolve({ ok: true, json: () => Promise.resolve({ name: 'Neo', uid: 'u1' }) })
        : Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    );

    await renderProvider();

    expect(screen.getByTestId('score')).toHaveTextContent('0');
    expect(screen.getByTestId('multiplier')).toHaveTextContent('1');
  });

  test('falls back to the generated pseudonym when the response is not ok', async () => {
    fetchMock.mockImplementation((url: string) =>
      url === '/api/visit'
        ? Promise.resolve({ ok: false, json: () => Promise.resolve({}) })
        : Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    );

    await renderProvider();

    expect(screen.getByTestId('name')).toHaveTextContent('FixedName');
  });

  test('falls back to the pseudonym when the fetch throws', async () => {
    fetchMock.mockImplementation((url: string) =>
      url === '/api/visit' ? Promise.reject(new Error('offline')) : Promise.resolve({ ok: true })
    );

    await renderProvider();

    expect(screen.getByTestId('name')).toHaveTextContent('FixedName');
    expect(console.error).toHaveBeenCalled();
  });
});

describe('console cheat hooks', () => {
  test('increaseMultiplier and hiddenSetScore mutate the state', async () => {
    await renderProvider();

    act(() => window.increaseMultiplier?.());
    expect(screen.getByTestId('multiplier')).toHaveTextContent('10');

    act(() => window.hiddenSetScore?.(50));
    expect(screen.getByTestId('score')).toHaveTextContent('57');

    // undefined argument is a no-op
    act(() => window.hiddenSetScore?.(undefined as unknown as number));
    expect(screen.getByTestId('score')).toHaveTextContent('57');

    // going over 500 resets the score to 0
    act(() => window.hiddenSetScore?.(600));
    expect(screen.getByTestId('score')).toHaveTextContent('0');
    expect(console.log).toHaveBeenCalledWith('Sorry you have been too greedy');
  });
});

describe('score intervals', () => {
  test('the 1s interval adds the multiplier each tick', async () => {
    await renderProvider();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // base 7 + 2 (multiplier) * 2 ticks = 11
    expect(screen.getByTestId('score')).toHaveTextContent('11');
  });

  test('the periodic interval (30s) persists the user state without keepalive', async () => {
    await renderProvider();

    await act(async () => {
      vi.advanceTimersByTime(30000);
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/users',
      expect.objectContaining({ method: 'PATCH', keepalive: false })
    );
  });

  test('the periodic save swallows errors', async () => {
    fetchMock.mockImplementation((url: string) =>
      url === '/api/visit' ? Promise.resolve(okVisit()) : Promise.reject(new Error('patch failed'))
    );

    await renderProvider();

    await act(async () => {
      vi.advanceTimersByTime(30000);
      await Promise.resolve();
    });

    expect(console.error).toHaveBeenCalledWith('Failed to patch user state', expect.any(Error));
  });
});

describe('persistence on hide / close', () => {
  test('flushes with keepalive when the tab becomes hidden', async () => {
    await renderProvider();

    setHidden(true);
    act(() => document.dispatchEvent(new Event('visibilitychange')));

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/users',
      expect.objectContaining({ method: 'PATCH', keepalive: true })
    );
  });

  test('does not save while the tab stays visible', async () => {
    await renderProvider();

    setHidden(false);
    act(() => document.dispatchEvent(new Event('visibilitychange')));

    expect(userPatchCalls()).toHaveLength(0);
  });

  test('skips a redundant save when the score has not changed', async () => {
    await renderProvider();

    setHidden(true);
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    act(() => document.dispatchEvent(new Event('visibilitychange')));

    expect(userPatchCalls()).toHaveLength(1);
  });

  test('flushes on unmount', async () => {
    const { unmount } = await renderProvider();

    act(() => unmount());

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/users',
      expect.objectContaining({ method: 'PATCH', keepalive: true })
    );
  });
});

describe('navigation and manual actions', () => {
  test('changing the pathname bumps the score', async () => {
    const { rerender } = await renderProvider();

    usePathname.mockReturnValue('/fr/terre');
    await act(async () => {
      rerender(
        <ScoreProvider>
          <Consumer />
        </ScoreProvider>
      );
    });

    // base 7 + 5 * multiplier(2) = 17
    expect(screen.getByTestId('score')).toHaveTextContent('17');
  });

  test('bumpScore and increaseMultiplierClick update the context', async () => {
    await renderProvider();

    fireEvent.click(screen.getByText('bump'));
    expect(screen.getByTestId('score')).toHaveTextContent('10');

    fireEvent.click(screen.getByText('inc'));
    expect(screen.getByTestId('multiplier')).toHaveTextContent('3');
  });

  test('increaseMultiplierClick is capped at the max multiplier', async () => {
    await renderProvider();

    act(() => window.increaseMultiplier?.()); // multiplier -> 10 (already above max)
    fireEvent.click(screen.getByText('inc'));
    expect(screen.getByTestId('multiplier')).toHaveTextContent('10');
  });
});

describe('cleanup and misuse', () => {
  test('removes the window hooks on unmount', async () => {
    const { unmount } = await renderProvider();
    expect(window.increaseMultiplier).toBeTypeOf('function');

    act(() => {
      unmount();
    });

    expect(window.increaseMultiplier).toBeUndefined();
    expect(window.hiddenSetScore).toBeUndefined();
  });

  test('useUser throws when used outside of the provider', () => {
    expect(() => render(<Consumer />)).toThrow('useUser must be used within a <ScoreProvider>');
  });
});
