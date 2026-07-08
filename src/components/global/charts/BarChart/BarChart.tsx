'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

type TData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
};

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Single-series chart: no legend (axis labels carry identity), rounded bar ends,
// and neutral tick/grid colors that read on both light and dark surfaces.
const options = {
  responsive: true,
  maintainAspectRatio: false,
  elements: { bar: { borderRadius: 4 } },
  plugins: { legend: { display: false } },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#94a3b8' },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(148, 163, 184, 0.2)' },
      ticks: { color: '#94a3b8' },
    },
  },
};

export default function MyChart({ data }: { data: TData }) {
  return <Bar data={data} options={options} />;
}
