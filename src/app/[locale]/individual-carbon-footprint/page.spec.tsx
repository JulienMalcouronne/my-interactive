import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderWithIntl } from '@/test/renderWithIntl';
import IndividualCarbon from './page';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('@/i18n/navigation', () => ({ useRouter: () => ({ push }) }));

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

test('shows the car-only fields (vehicle type, carpool) only for the car transport mode', () => {
  const { container } = renderWithIntl(<IndividualCarbon />);

  expect(container.querySelector('select[name="carType"]')).not.toBeNull();
  expect(container.querySelector('input[name="carpoolSize"]')).not.toBeNull();

  fireEvent.change(container.querySelector('select[name="transportMode"]')!, {
    target: { value: 'bus' },
  });
  expect(container.querySelector('select[name="carType"]')).toBeNull();
  expect(container.querySelector('input[name="carpoolSize"]')).toBeNull();

  // switching back brings them back
  fireEvent.change(container.querySelector('select[name="transportMode"]')!, {
    target: { value: 'car' },
  });
  expect(container.querySelector('select[name="carType"]')).not.toBeNull();
});

test('handles inputs, persists the result, then navigates with the encoded form', async () => {
  const { container } = renderWithIntl(<IndividualCarbon />);

  fireEvent.change(container.querySelector('input[name="dailyCommuteKm"]')!, {
    target: { value: '10' },
  });
  fireEvent.change(container.querySelector('input[name="commuteDaysPerWeek"]')!, {
    target: { value: '3' },
  });
  fireEvent.click(container.querySelector('input[name="isWellInsulated"]')!);
  fireEvent.click(container.querySelector('input[name="hasRenewableElectricity"]')!);

  const insulated = container.querySelector('input[name="isWellInsulated"]') as HTMLInputElement;
  expect(insulated.checked).toBe(true);

  fireEvent.submit(container.querySelector('form')!);

  await waitFor(() => expect(push).toHaveBeenCalledTimes(1));

  expect(fetch).toHaveBeenCalledWith('/api/carbon', expect.objectContaining({ method: 'POST' }));

  const arg = push.mock.calls[0][0];
  expect(arg.pathname).toBe('/individual-footprint-result');

  const payload = JSON.parse(arg.query.data);
  expect(payload).toMatchObject({
    dailyCommuteKm: 10,
    commuteDaysPerWeek: 3,
    isWellInsulated: true,
    hasRenewableElectricity: true,
  });
});
