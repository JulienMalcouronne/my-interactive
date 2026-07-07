import { afterEach, expect, test, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { renderWithIntl } from '@/test/renderWithIntl';
import LanguageSwitcher from './LangSwitcher';

const { usePathname, push } = vi.hoisted(() => ({ usePathname: vi.fn(), push: vi.fn() }));
vi.mock('next/navigation', () => ({
  usePathname,
  useRouter: () => ({ push }),
}));

afterEach(() => {
  vi.clearAllMocks();
});

test('renders the current locale and the available options', () => {
  usePathname.mockReturnValue('/fr/terre');
  const { getByRole, getByText } = renderWithIntl(<LanguageSwitcher />);

  expect((getByRole('combobox') as HTMLSelectElement).value).toBe('fr');
  expect(getByText('EN')).toBeInTheDocument();
  expect(getByText('FR')).toBeInTheDocument();
});

test('swaps the locale segment and navigates', () => {
  usePathname.mockReturnValue('/fr/terre');
  const { getByRole } = renderWithIntl(<LanguageSwitcher />);

  fireEvent.change(getByRole('combobox'), { target: { value: 'en' } });

  expect(push).toHaveBeenCalledWith('/en/terre');
});
