import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import CurrentUserRow from '@/components/leaderboard/current-user-row';

type LeaderboardEntry = {
  id: number;
  uid: string;
  name: string;
  score: number;
};

async function fetchLeaderboard() {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

  const res = await fetch(`${protocol}://${host}/api/leaderboard`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch leaderboard');
  }

  return res.json();
}

export default async function Leaderboard() {
  const t = await getTranslations();

  const users: LeaderboardEntry[] = await fetchLeaderboard();

  const averageScore = users.length
    ? users.reduce((acc, user) => acc + user.score, 0) / users.length
    : 0;

  return (
    <div className="w-full overflow-x-auto p-8">
      <table className="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden shadow-md bg-white text-sm text-gray-900">
        <caption className="caption-top text-lg font-semibold p-4 text-left">
          {t('leaderboard')}
        </caption>
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
          <tr>
            <th scope="col" className="px-6 py-3 text-left">
              {t('rank')}
            </th>
            <th scope="col" className="px-6 py-3 text-left">
              {t('name')}
            </th>
            <th scope="col" className="px-6 py-3 text-left">
              {t('score')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user, index) => (
            <tr key={user.id} className="hover:bg-gray-50 transition">
              <td scope="row" className="px-6 py-4">
                {index + 1}
              </td>
              <td className="px-6 py-4">{user.name}</td>
              <td className="px-6 py-4">{user.score}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <CurrentUserRow users={users} />
          <tr className="hover:bg-gray-50 transition">
            <th scope="row" colSpan={2} className="px-6 py-4 text-left">
              {t('averageScore')}
            </th>
            <td className="px-6 py-4 font-bold"> {Math.round(averageScore)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
