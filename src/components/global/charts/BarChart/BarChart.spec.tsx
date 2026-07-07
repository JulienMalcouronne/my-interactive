import { expect, test, vi } from 'vitest';
import { render } from '@testing-library/react';

vi.mock('react-chartjs-2', () => ({
  Bar: ({ data }: { data: { labels: string[] } }) => (
    <div data-testid="bar-chart">{data.labels.join(',')}</div>
  ),
}));

import BarChart from './BarChart';

test('forwards the data to the underlying Bar chart', () => {
  const data = {
    labels: ['Transport', 'Food'],
    datasets: [{ label: 'CO2', data: [10, 20] }],
  };

  const { getByTestId } = render(<BarChart data={data} />);

  expect(getByTestId('bar-chart')).toHaveTextContent('Transport,Food');
});
