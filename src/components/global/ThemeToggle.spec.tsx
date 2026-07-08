import { afterEach, expect, test, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';

afterEach(() => {
  document.documentElement.removeAttribute('data-theme');
  localStorage.clear();
  vi.restoreAllMocks();
});

test('defaults to light (moon icon) when no theme attribute is present', () => {
  const { getByRole } = render(<ThemeToggle />);
  const button = getByRole('button');

  expect(button).toHaveTextContent('🌙');
  expect(button).toHaveAttribute('aria-label', 'Activate dark theme');
});

test('reflects an existing light attribute', () => {
  document.documentElement.setAttribute('data-theme', 'light');
  const { getByRole } = render(<ThemeToggle />);

  expect(getByRole('button')).toHaveTextContent('🌙');
});

test('reads the current dark theme from the document on mount', () => {
  document.documentElement.setAttribute('data-theme', 'dark');
  const { getByRole } = render(<ThemeToggle />);

  expect(getByRole('button')).toHaveTextContent('☀️');
  expect(getByRole('button')).toHaveAttribute('aria-label', 'Activate light theme');
});

test('toggles the document attribute and persists the choice', () => {
  const { getByRole } = render(<ThemeToggle />);
  const button = getByRole('button');

  fireEvent.click(button);
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  expect(localStorage.getItem('theme')).toBe('dark');
  expect(button).toHaveTextContent('☀️');

  fireEvent.click(button);
  expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  expect(localStorage.getItem('theme')).toBe('light');
  expect(button).toHaveTextContent('🌙');
});

test('swallows storage errors when persisting the theme', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('storage unavailable');
  });

  const { getByRole } = render(<ThemeToggle />);
  expect(() => fireEvent.click(getByRole('button'))).not.toThrow();
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
});
