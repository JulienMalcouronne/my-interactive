import { randomUUID } from 'crypto';
import { useTranslations } from 'next-intl';

// import BarChart from '@/components/global/charts/BarChart/BarChart';

export default function Leaderboard() {
  // const data = {
  //   labels: ['Red', 'Blue', 'Yellow'],
  //   datasets: [
  //     {
  //       label: 'Rank',
  //       data: [12, 19, 3],
  //       backgroundColor: ['red', 'blue', 'yellow'],
  //     },
  //   ],
  // };

  const t = useTranslations();

  const users = [
    { id: randomUUID(), name: 'user 1', score: 3000 },
    { id: randomUUID(), name: 'User 2', score: 2000 },
  ];

  return (
    <div className="h-screen">
      {/* <h1>Leaderboard</h1> */}
      <div className="w-full overflow-x-auto p-6">
        <table className="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden shadow-md bg-white text-sm text-gray-900">
          <caption className="caption-top text-lg font-semibold p-4 text-left">
            {t('leaderboard')}
          </caption>
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left">{t('rank')}</th>
              <th className="px-6 py-3 text-left">{t('id')}</th>
              <th className="px-6 py-3 text-left">{t('name')}</th>
              <th className="px-6 py-3 text-left">{t('score')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user, index) => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4">{user.id}</td>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
