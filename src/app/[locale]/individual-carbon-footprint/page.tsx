'use client';

import type { ICarbonInput, IIndividualCarbonFields } from '@/interfaces';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function IndividualCarbon() {
  const t = useTranslations();

  const basicInputs: ICarbonInput[] = [
    {
      label: t('kmByCarPerWeek'),
      name: 'carKmPerWeek',
      type: 'number',
      min: 0,
    },
    {
      label: t('shortFlyPerYear'),
      name: 'shortFlightsPerYear',
      type: 'number',
      min: 0,
    },
    {
      label: t('longFlyPerYear'),
      name: 'longFlightsPerYear',
      type: 'number',
      min: 0,
    },
    {
      label: t('homeSurface'),
      name: 'homeSize',
      type: 'number',
      min: 1,
    },
    {
      label: t('nbPeopleLivingAtHome'),
      name: 'peopleInHousehold',
      type: 'number',
      min: 1,
    },
    {
      label: t('clothesBoughtPerYear'),
      name: 'clothesPerYear',
      type: 'number',
      min: 0,
    },
    {
      label: t('electronicalGoodsPurchasedPerYear'),
      name: 'devicesPerYear',
      type: 'number',
      min: 0,
    },
  ] as const;

  const router = useRouter();
  const [form, setForm] = useState<IIndividualCarbonFields>({
    carKmPerWeek: 0,
    carType: 'essence',
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
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;
    let newValue: string | number | boolean = value;

    if (type === 'checkbox') {
      newValue = (target as HTMLInputElement).checked;
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
    // todo
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="bg-neutral-900 bg-opacity-90 p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-6">{t('calculateCarbonFootprint')}</h1>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {basicInputs.map(({ label, name, type, min }) => (
            <div key={name}>
              <label className="block mb-1 text-sm text-white font-semibold">{label}</label>
              <input
                type={type}
                name={name}
                min={min}
                value={form[name as keyof IIndividualCarbonFields] as string | number}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded border border-neutral-700 bg-neutral-800 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          ))}

          <div>
            <label className="block mb-1 text-sm text-white font-semibold">
              {t('vehicleType')}
            </label>
            <select
              name="carType"
              value={form.carType}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border border-neutral-700 bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="essence">{t('gas')}</option>
              <option value="diesel">{t('diesel')}</option>
              <option value="electric">{t('electric')}</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm text-white font-semibold">
              {t('meatConsumption')}
            </label>
            <select
              name="meatConsumption"
              value={form.meatConsumption}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border border-neutral-700 bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="high">{t('high')}</option>
              <option value="medium">{t('average')}</option>
              <option value="low">{t('low')}</option>
              <option value="none">{t('none')}</option>
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
