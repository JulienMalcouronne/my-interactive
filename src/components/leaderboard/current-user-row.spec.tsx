import { afterEach, expect, test, vi } from 'vitest';
import { render } from '@testing-library/react';
import CurrentUserRow from './current-user-row';

const { useUser } = vi.hoisted(() => ({ useUser: vi.fn() }));
vi.mock('../global/UserProvider', () => ({ useUser }));

const renderInTable = (users: { uid: string; score: number }[]) =>
  render(
    <table>
      <tbody>
        <CurrentUserRow users={users} />
      </tbody>
    </table>
  );

afterEach(() => {
  vi.clearAllMocks();
});

test('shows the current user rank and score when present', () => {
  useUser.mockReturnValue({ uid: 'b' });

  const { getByText } = renderInTable([
    { uid: 'a', score: 30 },
    { uid: 'b', score: 20 },
  ]);

  expect(getByText('My rank: 2')).toBeInTheDocument();
  expect(getByText('20')).toBeInTheDocument();
});

test('falls back to dashes when the user is not in the list', () => {
  useUser.mockReturnValue({ uid: 'zzz' });

  const { getByText } = renderInTable([{ uid: 'a', score: 30 }]);

  expect(getByText('My rank: —')).toBeInTheDocument();
  expect(getByText('—')).toBeInTheDocument();
});
