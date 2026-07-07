import { fireEvent } from '@testing-library/react';
import { renderWithIntl } from '@/test/renderWithIntl';
import ResumeActions from './ResumeActions';
import { expect, test, vi } from 'vitest';

test('renders resume actions with print button', () => {
  const { getByText } = renderWithIntl(<ResumeActions />);
  const printButton = getByText('Imprimer / Générer un PDF');
  expect(printButton).toBeInTheDocument();
});

test('print button is clickable', () => {
  window.print = vi.fn();
  const { getByText } = renderWithIntl(<ResumeActions />);
  const printButton = getByText('Imprimer / Générer un PDF');
  fireEvent.click(printButton);
  expect(window.print).toHaveBeenCalled();
});
