'use client';

import type { ICarbonInput, IIndividualCarbonFields } from '@/interfaces';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const basicInputs: ICarbonInput[] = [
  {
    label: 'Kilomètres en voiture par semaine:',
    name: 'carKmPerWeek',
    type: 'number',
    min: 0,
  },
  {
    label: 'Vols courts par an:',
    name: 'shortFlightsPerYear',
    type: 'number',
    min: 0,
  },
  {
    label: 'Vols longs par an:',
    name: 'longFlightsPerYear',
    type: 'number',
    min: 0,
  },
  {
    label: 'Surface du logement (m²):',
    name: 'homeSize',
    type: 'number',
    min: 1,
  },
  {
    label: 'Nombre de personnes dans le foyer:',
    name: 'peopleInHousehold',
    type: 'number',
    min: 1,
  },
  {
    label: 'Vêtements achetés par an:',
    name: 'clothesPerYear',
    type: 'number',
    min: 0,
  },
  {
    label: 'Appareils électroniques achetés par an:',
    name: 'devicesPerYear',
    type: 'number',
    min: 0,
  },
] as const;

export default function IndividualCarbon() {
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
        <h1 className="text-2xl font-bold text-white mb-6">Calculez votre empreinte carbone</h1>
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
            <label className="block mb-1 text-sm text-white font-semibold">Type de voiture:</label>
            <select
              name="carType"
              value={form.carType}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border border-neutral-700 bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="essence">Essence</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Électrique</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm text-white font-semibold">
              Consommation de viande:
            </label>
            <select
              name="meatConsumption"
              value={form.meatConsumption}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border border-neutral-700 bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="high">Élevée</option>
              <option value="medium">Moyenne</option>
              <option value="low">Faible</option>
              <option value="none">Aucune</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                name="isWellInsulated"
                checked={form.isWellInsulated}
                onChange={handleChange}
              />
              Logement bien isolé
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded shadow transition"
          >
            Calculer mon empreinte
          </button>
        </form>
      </div>
    </main>
  );
}
