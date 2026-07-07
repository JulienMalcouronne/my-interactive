import { afterEach, expect, test, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { renderWithIntl } from '@/test/renderWithIntl';
import ScoreHeader from './ScoreHeader';

const { useUser } = vi.hoisted(() => ({ useUser: vi.fn() }));
vi.mock('./UserProvider', () => ({ useUser }));

afterEach(() => {
  vi.clearAllMocks();
});

test('shows the score and triggers the multiplier click', () => {
  const increaseMultiplierClick = vi.fn();
  useUser.mockReturnValue({ score: 42, multiplier: 2, increaseMultiplierClick });

  const { getByText, getByRole } = renderWithIntl(<ScoreHeader />);

  expect(getByText(/Score actuel 42/)).toBeInTheDocument();
  expect(getByText(/2×/)).toBeInTheDocument();

  const button = getByRole('button');
  expect(button).not.toBeDisabled();
  fireEvent.click(button);
  expect(increaseMultiplierClick).toHaveBeenCalledTimes(1);
});

test('disables the button once the max multiplier is reached', () => {
  useUser.mockReturnValue({ score: 0, multiplier: 5, increaseMultiplierClick: vi.fn() });

  const { getByRole } = renderWithIntl(<ScoreHeader />);

  expect(getByRole('button')).toBeDisabled();
});
