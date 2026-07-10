import React from 'react';
import { UserIcon, MapPinIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { getTranslations } from 'next-intl/server';
import ResumeActions from '@/components/resume/ResumeActions';
import { useTranslations } from 'next-intl';
import styles from './page.module.css';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t('cv') };
}

export default function Resume() {
  const t = useTranslations();
  const numberOfYears = new Date().getFullYear() - 2021;

  return (
    <div className={styles.resume}>
      <ResumeActions />

      <div className={styles.grid}>
        <aside className={styles.aside}>
          <div>
            <h2 className={styles.sideHeading}>{t('contact')}</h2>
            <ul className={styles.sideList}>
              <li className={styles.contactItem}>
                <UserIcon className={styles.icon} />
                <span>Julien Malcouronne</span>
              </li>
              <li className={styles.contactItem}>
                <MapPinIcon className={styles.icon} />
                49100 Angers
              </li>
              <li className={styles.contactItem}>
                <PhoneIcon className={styles.icon} />
                <span>+33 6 95 34 46 37</span>
              </li>
              <li className={styles.contactItem}>
                <EnvelopeIcon className={styles.icon} />
                <a href="mailto:malcouronnejulien@gmail.com" className={styles.bold}>
                  malcouronnejulien@gmail.com
                </a>
              </li>
              <li className={styles.contactItem}>
                <svg
                  className={styles.icon}
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.867 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.529 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.339-2.221-.253-4.555-1.112-4.555-4.951 0-1.093.39-1.987 1.029-2.686-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.545 1.378.202 2.397.1 2.65.64.699 1.028 1.593 1.028 2.686 0 3.848-2.337 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.417-.012 2.747 0 .268.18.579.688.481C19.135 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                  />
                </svg>
                <a
                  href="https://github.com/JulienMalcouronne"
                  className={styles.bold}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  github.com/JulienMalcouronne
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className={styles.sideHeading}>{t('lang', { count: 2 })}</h2>
            <ul className={styles.sideList}>
              <li>
                {t('french')} : {t('motherTongue')}
              </li>
              <li>{t('english')} : C1</li>
              <li>{t('swedish')} : A1</li>
              <li>{t('spanish')} : A1</li>
            </ul>
          </div>

          <div>
            <h2 className={styles.sideHeading}>{t('skill', { count: 2 })}</h2>
            <ul className={styles.sideList}>
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
            <h2 className={styles.sideHeading}>{t('interest', { count: 2 })}</h2>
            <ul className={styles.sideList}>
              <li>{t('latinDances')}</li>
              <li>{t('padel')}</li>
              <li>{t('tennis')}</li>
              <li>{t('travel', { count: 2 })}</li>
            </ul>
          </div>
        </aside>

        <div className={styles.main}>
          <section>
            <h1 className={styles.name}>Julien Malcouronne</h1>
            <p className={styles.subtitle}>
              {t('leadDeveloper')} | {t('fullStackDev')}
            </p>
          </section>

          <section>
            <h2 className={styles.mainHeading}>{t('profil')}</h2>
            <p className={styles.profileText}>{t('techLeadSection', { count: numberOfYears })}</p>
          </section>

          <section>
            <h2 className={styles.mainHeading}>{t('experience', { count: 2 })}</h2>
            <div className={styles.expList}>
              <div>
                <h3 className={styles.jobTitle}>{t('leadDeveloper')} – ClimateSeed</h3>
                <p className={styles.jobDate}>Septembre 2025 – {t('today')}</p>
                <ul className={styles.bullets}>
                  <li>{t('leadDevFullStack')}</li>
                  <li>{t('leadDevBackendRust')}</li>
                  <li>{t('leadDevTechLeadership')}</li>
                </ul>
              </div>
              <div>
                <h3 className={styles.jobTitle}>{t('techLeadFront')} – ClimateSeed</h3>
                <p className={styles.jobDate}>Juin 2023 – Septembre 2025</p>
                <ul className={styles.bullets}>
                  <li>{t('manageTeam')}</li>
                  <li>{t('nuxtSsr')}</li>
                  <li>{t('architectOpti')}</li>
                  <li>{t('coordinateProduct')}</li>
                </ul>
              </div>
              <div>
                <h3 className={styles.jobTitle}>{t('frontendDeveloper')} – ClimateSeed</h3>
                <p className={styles.jobDate}>Mars 2022 – Mai 2023</p>
                <ul className={styles.bullets}>
                  <li>{t('devInterfaces')}</li>
                  <li>{t('apiIntegration')}</li>
                  <li>{t('teamWork')}</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className={styles.mainHeading}>{t('complementaryExperiences')}</h2>
            <div className={styles.expList}>
              <div>
                <h3 className={styles.jobTitle}>{t('businessDeveloper')}</h3>
                <p className={styles.jobDate}>2016 – 2021</p>
                <ul className={styles.bullets}>
                  <li>{t('commercialStrategy')}</li>
                  <li>{t('partnershipManagement')}</li>
                  <li>{t('marketAnalysis')}</li>
                  <li>{t('contractNegociation')}</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className={styles.mainHeading}>{t('trainee', { count: 2 })}</h2>
            <ul className={styles.traineeList}>
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
