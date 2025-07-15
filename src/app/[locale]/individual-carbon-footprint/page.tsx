'use client';

import type { IIndividualCarbonFields } from '@/interfaces';
import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { calculateCO2 } from '@/lib';

export default function IndividualCarbon() {
  const t = useTranslations();

  const [form, setForm] = useState<IIndividualCarbonFields>({
    transportMode: 'car',
    carType: 'essence',
    dailyCommuteKm: 0,
    shortFlightsPerYear: 0,
    longFlightsPerYear: 0,
    meatConsumption: 'medium',
    homeSize: 50,
    heating: 'gas',
    isWellInsulated: false,
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const total = calculateCO2(form);
    alert(total);
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="bg-neutral-900 bg-opacity-90 p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-6">{t('calculateCarbonFootprint')}</h1>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 text-sm text-white font-semibold">
              {t('transportMode')}
            </label>
            <select
              name="transportMode"
              value={form.transportMode}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border border-neutral-700 bg-neutral-800 text-white"
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
            <div>
              <label className="block mb-1 text-sm text-white font-semibold">
                {t('vehicleType')}
              </label>
              <select
                name="carType"
                value={form.carType}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded border border-neutral-700 bg-neutral-800 text-white"
              >
                <option value="essence">{t('gas')}</option>
                <option value="diesel">{t('diesel')}</option>
                <option value="electric">{t('electric')}</option>
              </select>
            </div>
          )}

          <div>
            <label className="block mb-1 text-sm text-white font-semibold">
              {t('dailyCommuteKm')}
            </label>
            <input
              type="number"
              name="dailyCommuteKm"
              min={0}
              value={form.dailyCommuteKm}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border border-neutral-700 bg-neutral-800 text-white"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-white font-semibold">
              {t('shortFlyPerYear')}
            </label>
            <input
              type="number"
              name="shortFlightsPerYear"
              min={0}
              value={form.shortFlightsPerYear}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border border-neutral-700 bg-neutral-800 text-white"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-white font-semibold">
              {t('longFlyPerYear')}
            </label>
            <input
              type="number"
              name="longFlightsPerYear"
              min={0}
              value={form.longFlightsPerYear}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border border-neutral-700 bg-neutral-800 text-white"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-white font-semibold">
              {t('meatConsumption')}
            </label>
            <select
              name="meatConsumption"
              value={form.meatConsumption}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border border-neutral-700 bg-neutral-800 text-white"
            >
              <option value="high">{t('high')}</option>
              <option value="medium">{t('average')}</option>
              <option value="low">{t('low')}</option>
              <option value="none">{t('none')}</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm text-white font-semibold">
              {t('homeSurface')}
            </label>
            <input
              type="number"
              name="homeSize"
              min={1}
              value={form.homeSize}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border border-neutral-700 bg-neutral-800 text-white"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-white font-semibold">{t('heating')}</label>
            <select
              name="heating"
              value={form.heating}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border border-neutral-700 bg-neutral-800 text-white"
            >
              <option value="gas">{t('gas')}</option>
              <option value="electric">{t('electric')}</option>
              <option value="fuel">{t('fuel')}</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-white cursor-pointer">
              <input
                className="cursor-pointer"
                type="checkbox"
                name="isWellInsulated"
                checked={form.isWellInsulated}
                onChange={handleChange}
              />
              {t('homeWellIsolated')}
            </label>
          </div>

          <div>
            <label className="block mb-1 text-sm text-white font-semibold">
              {t('nbPeopleLivingAtHome')}
            </label>
            <input
              type="number"
              name="peopleInHousehold"
              min={1}
              value={form.peopleInHousehold}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border border-neutral-700 bg-neutral-800 text-white"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-white font-semibold">
              {t('clothesBoughtPerYear')}
            </label>
            <input
              type="number"
              name="clothesPerYear"
              min={0}
              value={form.clothesPerYear}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border border-neutral-700 bg-neutral-800 text-white"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-white font-semibold">
              {t('electronicalGoodsPurchasedPerYear')}
            </label>
            <input
              type="number"
              name="devicesPerYear"
              min={0}
              value={form.devicesPerYear}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border border-neutral-700 bg-neutral-800 text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded shadow transition cursor-pointer"
          >
            {t('calculateMyCarbonFootprint')}
          </button>
        </form>
      </div>
    </main>
  );
}
