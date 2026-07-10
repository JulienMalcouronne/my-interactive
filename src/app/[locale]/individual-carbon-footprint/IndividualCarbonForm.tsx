'use client';

import type { IIndividualCarbonFields } from '@/interfaces';
import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import styles from './page.module.css';

export default function IndividualCarbonForm() {
  const t = useTranslations();
  const router = useRouter();

  const [form, setForm] = useState<IIndividualCarbonFields>({
    transportMode: 'car',
    carType: 'essence',
    dailyCommuteKm: 0,
    commuteDaysPerWeek: 5,
    carpoolSize: 1,
    shortFlightsPerYear: 0,
    mediumFlightsPerYear: 0,
    longFlightsPerYear: 0,
    meatConsumption: 'medium',
    homeSize: 50,
    heating: 'gas',
    isWellInsulated: false,
    hasRenewableElectricity: false,
    peopleInHousehold: 1,
    clothesPerYear: 10,
    devicesPerYear: 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target;
    let newValue: string | number | boolean = value;

    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      newValue = Number(value);
    }

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Best-effort persistence of the result; the page still shows even if it fails.
    try {
      await fetch('/api/carbon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } catch {
      // ignore network failures
    }
    router.push({
      pathname: '/individual-footprint-result',
      query: { data: JSON.stringify(form) },
    });
  };

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t('calculateCarbonFootprint')}</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div>
            <label htmlFor="transportMode" className={styles.label}>
              {t('transportMode')}
            </label>
            <select
              id="transportMode"
              name="transportMode"
              value={form.transportMode}
              onChange={handleChange}
              className={styles.field}
            >
              <option value="car">{t('car')}</option>
              <option value="bus">{t('bus')}</option>
              <option value="metro">{t('metro')}</option>
              <option value="train">{t('train')}</option>
              <option value="bike">{t('bike')}</option>
              <option value="walk">{t('walk')}</option>
              <option value="telework">{t('telework')}</option>
            </select>
          </div>

          {form.transportMode === 'car' && (
            <>
              <div>
                <label htmlFor="carType" className={styles.label}>
                  {t('vehicleType')}
                </label>
                <select
                  id="carType"
                  name="carType"
                  value={form.carType}
                  onChange={handleChange}
                  className={styles.field}
                >
                  <option value="essence">{t('gas')}</option>
                  <option value="diesel">{t('diesel')}</option>
                  <option value="electric">{t('electric')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="carpoolSize" className={styles.label}>
                  {t('carpoolSize')}
                </label>
                <input
                  id="carpoolSize"
                  type="number"
                  name="carpoolSize"
                  min={1}
                  value={form.carpoolSize}
                  onChange={handleChange}
                  className={styles.field}
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="dailyCommuteKm" className={styles.label}>
              {t('dailyCommuteKm')}
            </label>
            <input
              id="dailyCommuteKm"
              type="number"
              name="dailyCommuteKm"
              min={0}
              value={form.dailyCommuteKm}
              onChange={handleChange}
              className={styles.field}
            />
          </div>

          <div>
            <label htmlFor="commuteDaysPerWeek" className={styles.label}>
              {t('commuteDaysPerWeek')}
            </label>
            <input
              id="commuteDaysPerWeek"
              type="number"
              name="commuteDaysPerWeek"
              min={0}
              max={7}
              value={form.commuteDaysPerWeek}
              onChange={handleChange}
              className={styles.field}
            />
          </div>

          <div>
            <label htmlFor="shortFlightsPerYear" className={styles.label}>
              {t('shortFlyPerYear')}
            </label>
            <input
              id="shortFlightsPerYear"
              type="number"
              name="shortFlightsPerYear"
              min={0}
              value={form.shortFlightsPerYear}
              onChange={handleChange}
              className={styles.field}
            />
          </div>

          <div>
            <label htmlFor="mediumFlightsPerYear" className={styles.label}>
              {t('mediumFlyPerYear')}
            </label>
            <input
              id="mediumFlightsPerYear"
              type="number"
              name="mediumFlightsPerYear"
              min={0}
              value={form.mediumFlightsPerYear}
              onChange={handleChange}
              className={styles.field}
            />
          </div>

          <div>
            <label htmlFor="longFlightsPerYear" className={styles.label}>
              {t('longFlyPerYear')}
            </label>
            <input
              id="longFlightsPerYear"
              type="number"
              name="longFlightsPerYear"
              min={0}
              value={form.longFlightsPerYear}
              onChange={handleChange}
              className={styles.field}
            />
          </div>

          <div>
            <label htmlFor="meatConsumption" className={styles.label}>
              {t('meatConsumption')}
            </label>
            <select
              id="meatConsumption"
              name="meatConsumption"
              value={form.meatConsumption}
              onChange={handleChange}
              className={styles.field}
            >
              <option value="high">{t('high')}</option>
              <option value="medium">{t('average')}</option>
              <option value="low">{t('low')}</option>
              <option value="none">{t('none')}</option>
            </select>
          </div>

          <div>
            <label htmlFor="homeSize" className={styles.label}>
              {t('homeSurface')}
            </label>
            <input
              id="homeSize"
              type="number"
              name="homeSize"
              min={1}
              value={form.homeSize}
              onChange={handleChange}
              className={styles.field}
            />
          </div>

          <div>
            <label htmlFor="heating" className={styles.label}>
              {t('heating')}
            </label>
            <select
              id="heating"
              name="heating"
              value={form.heating}
              onChange={handleChange}
              className={styles.field}
            >
              <option value="gas">{t('gas')}</option>
              <option value="electric">{t('electric')}</option>
              <option value="fuel">{t('fuel')}</option>
            </select>
          </div>

          <div>
            <label className={styles.checkboxLabel}>
              <input
                className={styles.checkbox}
                type="checkbox"
                name="isWellInsulated"
                checked={form.isWellInsulated}
                onChange={handleChange}
              />
              {t('homeWellIsolated')}
            </label>
          </div>

          <div>
            <label className={styles.checkboxLabel}>
              <input
                className={styles.checkbox}
                type="checkbox"
                name="hasRenewableElectricity"
                checked={form.hasRenewableElectricity}
                onChange={handleChange}
              />
              {t('renewableElectricity')}
            </label>
          </div>

          <div>
            <label htmlFor="peopleInHousehold" className={styles.label}>
              {t('nbPeopleLivingAtHome')}
            </label>
            <input
              id="peopleInHousehold"
              type="number"
              name="peopleInHousehold"
              min={1}
              value={form.peopleInHousehold}
              onChange={handleChange}
              className={styles.field}
            />
          </div>

          <div>
            <label htmlFor="clothesPerYear" className={styles.label}>
              {t('clothesBoughtPerYear')}
            </label>
            <input
              id="clothesPerYear"
              type="number"
              name="clothesPerYear"
              min={0}
              value={form.clothesPerYear}
              onChange={handleChange}
              className={styles.field}
            />
          </div>

          <div>
            <label htmlFor="devicesPerYear" className={styles.label}>
              {t('electronicalGoodsPurchasedPerYear')}
            </label>
            <input
              id="devicesPerYear"
              type="number"
              name="devicesPerYear"
              min={0}
              value={form.devicesPerYear}
              onChange={handleChange}
              className={styles.field}
            />
          </div>

          <button type="submit" className={styles.submit}>
            {t('calculateMyCarbonFootprint')}
          </button>
        </form>
      </div>
    </main>
  );
}
