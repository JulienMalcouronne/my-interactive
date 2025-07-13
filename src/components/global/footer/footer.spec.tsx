import { expect, test } from 'vitest';
import { render } from '@testing-library/react';
import Footer from './Footer';

test('renders footer', () => {
  const { getByText } = render(<Footer />);

  expect(getByText('Julien Malcouronne')).toBeInTheDocument();
  expect(getByText('Développeur Front-End')).toBeInTheDocument();
  expect(getByText('© 2025 – Made with Next.js')).toBeInTheDocument();
});

test('renders footer with navigation links', () => {
  const { getByText } = render(<Footer />);

  expect(getByText('Accueil')).toBeInTheDocument();
  expect(getByText('Terre')).toBeInTheDocument();
  expect(getByText('CV')).toBeInTheDocument();
  expect(getByText('Leaderboard')).toBeInTheDocument();
});

test('Links are correct', () => {
  const { getByText } = render(<Footer />);

  const links = [
    { text: 'Terre', href: '/earth' },
    { text: 'CV', href: '/resume' },
    { text: 'Leaderboard', href: '/leaderboard' },
  ];

  links.forEach((link) => {
    const linkElement = getByText(link.text);
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', `${link.href}`);
  });
});
