import { getLocale, getTranslations } from 'next-intl/server';
import { buildCarbonDistribution, calculateCO2, PUBLIC_SERVICES_KG } from '@/lib';
import type { ICarbonDistribution } from '@/lib';
import type { IIndividualCarbonFields } from '@/interfaces';
import pool from '@/lib/db';
import BarChart from '@/components/global/charts/BarChart/BarChart';
import { Link } from '@/i18n/navigation';
import styles from './page.module.css';

type Props = { searchParams: Promise<{ data?: string }> };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  // Per-visitor result — not worth indexing.
  return { title: t('resultTitle'), robots: { index: false } };
}

const SUSTAINABLE_TARGET = 2000;
const FRENCH_AVERAGE = 9000;
const MIN_PARTICIPANTS = 3;
const USER_BAR = '#22c55e';
const OTHER_BAR = '#94a3b8';

function parseForm(data?: string): IIndividualCarbonFields | null {
  if (!data) return null;
  try {
    return JSON.parse(data) as IIndividualCarbonFields;
  } catch {
    return null;
  }
}

async function loadDistribution(userTotalKg: number): Promise<ICarbonDistribution | null> {
  try {
    const { rows } = await pool.query(
      'SELECT carbon_total FROM users WHERE carbon_total IS NOT NULL'
    );
    return buildCarbonDistribution(
      rows.map((row) => Number(row.carbon_total)),
      userTotalKg
    );
  } catch (error) {
    console.error('Failed to load carbon distribution', error);
    return null;
  }
}

export default async function IndividualFootprintResult({ searchParams }: Props) {
  const t = await getTranslations();
  const locale = await getLocale();
  const { data } = await searchParams;
  const form = parseForm(data);

  // Footprints read better in tonnes.
  const toTonnes = (kg: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(kg / 1000);

  if (!form) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p className={styles.empty}>{t('noResultData')}</p>
          <Link href="/individual-carbon-footprint" className={styles.retake}>
            {t('retakeTest')}
          </Link>
        </div>
      </div>
    );
  }

  const breakdown = calculateCO2(form);
  const combinedTotal = breakdown.total + PUBLIC_SERVICES_KG;
  // The user is placed among the stored totals, which also include the baseline.
  const distribution = await loadDistribution(combinedTotal);

  const distributionData = distribution && {
    labels: distribution.buckets.map((bucket) => bucket.label),
    datasets: [
      {
        label: t('distributionTitle'),
        data: distribution.buckets.map((bucket) => bucket.count),
        backgroundColor: distribution.buckets.map((bucket) =>
          bucket.isUser ? USER_BAR : OTHER_BAR
        ),
      },
    ],
  };

  const chartData = {
    labels: [
      t('catTransport'),
      t('catFlights'),
      t('catFood'),
      t('catHeating'),
      t('catClothes'),
      t('catDevices'),
    ],
    datasets: [
      {
        label: t('perYearUnit'),
        data: [
          breakdown.transport / 1000,
          breakdown.flights / 1000,
          breakdown.food / 1000,
          breakdown.heating / 1000,
          breakdown.clothes / 1000,
          breakdown.devices / 1000,
        ],
        backgroundColor: '#22c55e',
      },
    ],
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t('resultTitle')}</h1>

        <div className={styles.summary}>
          <div className={`${styles.tile} ${styles.tilePrimary}`}>
            <span className={styles.tileValue}>{toTonnes(breakdown.total)} t</span>
            <span className={styles.tileLabel}>{t('yourFootprintLabel')}</span>
          </div>
          <div className={styles.tile}>
            <span className={styles.tileValue}>~{toTonnes(PUBLIC_SERVICES_KG)} t</span>
            <span className={styles.tileLabel}>🏛️ {t('publicServicesLabel')}</span>
          </div>
          <div className={`${styles.tile} ${styles.tileAccent}`}>
            <span className={styles.tileValue}>{toTonnes(combinedTotal)} t</span>
            <span className={styles.tileLabel}>{t('totalWithPublicServices')}</span>
          </div>
          <div className={styles.tile}>
            <span className={styles.tileValue}>{toTonnes(SUSTAINABLE_TARGET)} t</span>
            <span className={styles.tileLabel}>{t('sustainableTargetLabel')}</span>
          </div>
          <div className={styles.tile}>
            <span className={styles.tileValue}>~{toTonnes(FRENCH_AVERAGE)} t</span>
            <span className={styles.tileLabel}>{t('frenchAverageLabel')}</span>
          </div>
        </div>

        <p className={styles.note}>{t('publicServicesNote')}</p>

        <div className={styles.charts}>
          <figure className={styles.chartCard}>
            <figcaption className={styles.chartTitle}>{t('breakdownTitle')}</figcaption>
            <div className={styles.chartWrap}>
              <BarChart data={chartData} />
            </div>
          </figure>

          {distribution && distributionData && (
            <figure className={styles.chartCard}>
              <figcaption className={styles.chartTitle}>{t('distributionTitle')}</figcaption>
              {distribution.participants >= MIN_PARTICIPANTS ? (
                <>
                  <p className={styles.percentile}>
                    {t('distributionPercentile', { percent: distribution.betterThanPercent })}{' '}
                    <span className={styles.percentileCount}>
                      ({t('distributionParticipants', { count: distribution.participants })})
                    </span>
                  </p>
                  <div className={styles.chartWrap}>
                    <BarChart data={distributionData} />
                  </div>
                </>
              ) : (
                <p className={styles.empty}>{t('notEnoughData')}</p>
              )}
            </figure>
          )}
        </div>

        <div className={styles.footer}>
          <Link href="/individual-carbon-footprint" className={styles.retake}>
            {t('retakeTest')}
          </Link>

          <details className={styles.methodology}>
            <summary className={styles.methodologySummary}>{t('methodologyTitle')}</summary>
            <p className={styles.methodologyText}>{t('methodologyIntro')}</p>
            <ul className={styles.methodologyList}>
              <li>{t('methodologyTransport')}</li>
              <li>{t('methodologyFlights')}</li>
              <li>{t('methodologyFood')}</li>
              <li>{t('methodologyHousing')}</li>
              <li>{t('methodologyGoods')}</li>
            </ul>
            <p className={styles.methodologyCaveat}>{t('methodologyCaveat')}</p>
          </details>
        </div>
      </div>
    </div>
  );
}
