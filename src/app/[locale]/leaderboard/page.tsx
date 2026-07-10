import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import CurrentUserRow from '@/components/leaderboard/current-user-row';
import styles from './page.module.css';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t('leaderboard') };
}

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
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <caption className={styles.caption}>{t('leaderboard')}</caption>
        <thead className={styles.thead}>
          <tr>
            <th scope="col" className={styles.headCell}>
              {t('rank')}
            </th>
            <th scope="col" className={styles.headCell}>
              {t('name')}
            </th>
            <th scope="col" className={styles.headCell}>
              {t('score')}
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id} className={styles.row}>
              <td scope="row" className={styles.cell}>
                {index + 1}
              </td>
              <td className={styles.cell}>{user.name}</td>
              <td className={styles.cell}>{user.score}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <CurrentUserRow users={users} />
          <tr className={styles.row}>
            <th scope="row" colSpan={2} className={styles.footRowHead}>
              {t('averageScore')}
            </th>
            <td className={styles.footScore}> {Math.round(averageScore)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
