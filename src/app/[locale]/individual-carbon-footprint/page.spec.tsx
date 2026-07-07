import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { renderWithIntl } from '@/test/renderWithIntl';
import IndividualCarbon from './page';

beforeEach(() => {
  vi.spyOn(window, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('shows the vehicle-type field only for the car transport mode', () => {
  const { container } = renderWithIntl(<IndividualCarbon />);

  expect(container.querySelector('select[name="carType"]')).not.toBeNull();

  fireEvent.change(container.querySelector('select[name="transportMode"]')!, {
    target: { value: 'bus' },
  });
  expect(container.querySelector('select[name="carType"]')).toBeNull();

  // switching back brings it back
  fireEvent.change(container.querySelector('select[name="transportMode"]')!, {
    target: { value: 'car' },
  });
  expect(container.querySelector('select[name="carType"]')).not.toBeNull();
});

test('handles number and checkbox inputs then submits to compute the footprint', () => {
  const { container } = renderWithIntl(<IndividualCarbon />);

  fireEvent.change(container.querySelector('input[name="dailyCommuteKm"]')!, {
    target: { value: '10' },
  });
  fireEvent.click(container.querySelector('input[name="isWellInsulated"]')!);

  const checkbox = container.querySelector('input[name="isWellInsulated"]') as HTMLInputElement;
  expect(checkbox.checked).toBe(true);

  fireEvent.submit(container.querySelector('form')!);

  expect(window.alert).toHaveBeenCalledTimes(1);
  const total = (window.alert as ReturnType<typeof vi.fn>).mock.calls[0][0];
  expect(typeof total).toBe('number');
  expect(Number.isFinite(total)).toBe(true);
});
