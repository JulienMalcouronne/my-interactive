import { getTranslations } from 'next-intl/server';
import EarthClient from './EarthClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t('earth') };
}

export default function EarthPage() {
  return <EarthClient />;
}
