import { afterEach, expect, test, vi } from 'vitest';
import { renderWithIntl } from '@/test/renderWithIntl';
import MainNavbar from './MainNavbar';

const { usePathname } = vi.hoisted(() => ({ usePathname: vi.fn() }));
vi.mock('next/navigation', () => ({
  usePathname,
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => {
  vi.clearAllMocks();
});

test('renders every navigation entry', () => {
  usePathname.mockReturnValue('/fr');
  const { getByText } = renderWithIntl(<MainNavbar />);

  ['Accueil', 'Terre', 'Empreinte carbone individuelle', 'CV', 'Classement'].forEach((label) => {
    expect(getByText(label)).toBeInTheDocument();
  });
});

test('highlights the active route and right-aligns the leaderboard item', () => {
  usePathname.mockReturnValue('/fr/terre');
  const { getByText } = renderWithIntl(<MainNavbar />);

  const activeLink = getByText('Terre');
  expect(activeLink).toHaveClass('text-green-400');

  const inactiveLink = getByText('Accueil');
  expect(inactiveLink).toHaveClass('text-gray-400');

  // leaderboard item carries the right-align modifier on its <li>
  expect(getByText('Classement').closest('li')).toHaveClass('flex-1', 'text-right');
});
