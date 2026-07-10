import { getTranslations } from 'next-intl/server';
import IndividualCarbonForm from './IndividualCarbonForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t('carbonFootprint') };
}

export default function IndividualCarbonPage() {
  return <IndividualCarbonForm />;
}
