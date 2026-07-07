import { expect, test } from 'vitest';
import { renderWithIntl } from '@/test/renderWithIntl';
import Footer from './Footer';

test('renders footer', () => {
  const { getByText } = renderWithIntl(<Footer />);

  expect(getByText('Julien Malcouronne')).toBeInTheDocument();
  expect(getByText('Développeur Front-End')).toBeInTheDocument();
  expect(getByText('© 2025 – Fait avec Next.js')).toBeInTheDocument();
});

test('renders footer with navigation links', () => {
  const { getByText } = renderWithIntl(<Footer />);

  expect(getByText('Accueil')).toBeInTheDocument();
  expect(getByText('Terre')).toBeInTheDocument();
  expect(getByText('CV')).toBeInTheDocument();
  expect(getByText('Classement')).toBeInTheDocument();
});

test('Links are correct', () => {
  const { getByText } = renderWithIntl(<Footer />);

  const links = [
    { text: 'Terre', href: '/earth' },
    { text: 'CV', href: '/resume' },
    { text: 'Classement', href: '/leaderboard' },
  ];

  links.forEach((link) => {
    const linkElement = getByText(link.text);
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', `${link.href}`);
  });
});

test('uses the localized resume file name per locale', () => {
  const fr = renderWithIntl(<Footer />, 'fr');
  expect(fr.getByText('Télécharger le CV')).toHaveAttribute(
    'href',
    '/documents/CV_JULIEN_MALCOURONNE.pdf'
  );
  fr.unmount();

  const en = renderWithIntl(<Footer />, 'en');
  expect(en.getByText('Download Resume')).toHaveAttribute(
    'href',
    '/documents/RESUME_JULIEN_MALCOURONNE.pdf'
  );
});
