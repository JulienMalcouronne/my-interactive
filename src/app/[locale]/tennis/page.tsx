import { getTranslations } from 'next-intl/server';
import TennisClient from './TennisClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t('tennis') };
}

export default function TennisPage() {
  return <TennisClient />;
}
