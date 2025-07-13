import { render, fireEvent } from '@testing-library/react';
import ResumeActions from './ResumeActions';
import { expect, test, vi } from 'vitest';

test('renders resume actions with print button', () => {
  const { getByText } = render(<ResumeActions />);
  const printButton = getByText('Imprimer / Générer PDF');
  expect(printButton).toBeInTheDocument();
});

test('print button is clickable', () => {
  window.print = vi.fn();
  const { getByText } = render(<ResumeActions />);
  const printButton = getByText('Imprimer / Générer PDF');
  fireEvent.click(printButton);
  expect(window.print).toHaveBeenCalled();
});
