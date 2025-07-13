import React from 'react';
import { UserIcon, MapPinIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import ResumeActions from '@/components/resume/ResumeActions';
import { useTranslations } from 'next-intl';

export default function Resume() {
  const t = useTranslations();
  const numberOfYears = new Date().getFullYear() - 2021;

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans text-gray-800">
      <ResumeActions />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <aside className="space-y-6 print:order-2">
          <div>
            <h2 className="text-lg font-bold uppercase border-b pb-1 mb-2">{t('contact')}</h2>
            <ul className="text-sm space-y-1">
              <li className="flex items-center gap-2">
                <UserIcon className="size-4" />
                <span>Julien Malcouronne</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPinIcon className="size-4" />
                49100 Angers
              </li>
              <li className="flex items-center gap-2">
                <EnvelopeIcon className="size-4" />
                <a href="mailto:malcouronnejulien@gmail.com" className="font-bold">
                  malcouronnejulien@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold uppercase border-b pb-1 mb-2">
              {t('lang', { count: 2 })}
            </h2>
            <ul className="text-sm space-y-1">
              <li>
                {t('french')} : {t('motherTongue')}
              </li>
              <li>{t('english')} : C1</li>
              <li>{t('swedish')} : A1</li>
              <li>{t('spanish')} : A1</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold uppercase border-b pb-1 mb-2">
              {t('skill', { count: 2 })}
            </h2>
            <ul className="text-sm space-y-1">
              <li>Javascript, Typescript</li>
              <li>Vue.js, React, Next.js, Nuxt.js</li>
              <li>NestJS, ExpressJS</li>
              <li>Vitest, Playwright, Cypress</li>
              <li>Ruby, Python, Rust</li>
              <li>SQL, Docker, Git</li>
              <li>Figma, InDesign, Whimsical</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold uppercase border-b pb-1 mb-2">
              {t('interest', { count: 2 })}
            </h2>
            <ul className="text-sm space-y-1">
              <li>{t('latinDances')}</li>
              <li>{t('travel', { count: 2 })}</li>
            </ul>
          </div>
        </aside>

        <div className="md:col-span-2 space-y-8 print:order-1">
          <section>
            <h1 className="text-3xl font-bold mb-1">Julien Malcouronne</h1>
            <p className="text-lg text-gray-600">
              {t('techLeadFront')} | {t('webDev')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold border-b pb-1 mb-2 uppercase">{t('profil')}</h2>
            <p className="text-sm">{t('techLeadSection', { count: numberOfYears })}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold border-b pb-1 mb-2 uppercase">
              {t('experience', { count: 2 })}
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-bold">{t('techLeadFront')} – ClimateSeed</h3>
                <p className="italic text-xs">Juin 2023 – {t('today')}</p>
                <ul className="list-disc list-inside">
                  <li>{t('manageTeam')}</li>
                  <li>{t('architectOpti')}</li>
                  <li>{t('coordinateProduct')}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold">{t('frontendDeveloper')} – ClimateSeed</h3>
                <p className="italic text-xs">Mars 2022 – Mai 2023</p>
                <ul className="list-disc list-inside">
                  <li>{t('devInterfaces')}</li>
                  <li>{t('apiIntegration')}</li>
                  <li>{t('teamWork')}</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold border-b pb-1 mb-2 uppercase">
              {t('complementaryExperiences')}
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-bold">{t('businessDeveloper')}</h3>
                <p className="italic text-xs">2016 – 2021</p>
                <ul className="list-disc list-inside">
                  <li>{t('commercialStrategy')}</li>
                  <li>{t('partnershipManagement')}</li>
                  <li>{t('marketAnalysis')}</li>
                  <li>{t('contractNegociation')}</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold border-b pb-1 mb-2 uppercase">
              {t('trainee', { count: 2 })}
            </h2>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Le Wagon – {t('webDevelopment')} (2021)</li>
              <li>Montpellier Business School – {t('masterSalesBusiness')} (2016 – 2020)</li>
              <li>
                {t('linkopingUniversity')} (Suède) – {t('businessAdministration')} (2017 – 2018)
              </li>
              <li>IUT Cergy – DUT {t('salesTechnics')} (2014 – 2016)</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
