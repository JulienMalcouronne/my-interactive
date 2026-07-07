import { afterEach, expect, test, vi } from 'vitest';
import { render } from '@testing-library/react';
import PseudonymDisplay from './PseudonymDisplay';

const { useUser } = vi.hoisted(() => ({ useUser: vi.fn() }));
vi.mock('./UserProvider', () => ({ useUser }));

afterEach(() => {
  vi.clearAllMocks();
});

test('renders the pseudonym as the input default value', () => {
  useUser.mockReturnValue({ name: 'SilverFox10' });

  const { getByRole } = render(<PseudonymDisplay />);

  expect((getByRole('textbox') as HTMLInputElement).value).toBe('SilverFox10');
});
