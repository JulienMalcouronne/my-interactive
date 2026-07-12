import React from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import styles from './page.module.css';

type Props = { params: Promise<{ locale: string }> };

export default async function Home({ params }: Props) {
  const { locale } = await params;
  // Opt into static rendering: without this, next-intl reads headers() (a
  // dynamic API) and the statically-generated home crashes at request time.
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className={styles.page}>
      <section id="home">
        <div className={`${styles.container} ${styles.hero}`}>
          <p className={styles.badge}>
            <span className={styles.badgeDot}></span>
            {t('homeAvailability')}
          </p>
          <h1 className={styles.heroTitle}>Julien Malcouronne</h1>
          <p className={styles.heroText}>
            {t.rich('homeTagline', {
              b: (chunks) => <span className={styles.semibold}>{chunks}</span>,
            })}
          </p>
          <div className={styles.ctaRow}></div>
        </div>
      </section>

      <section id="expertise">
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>{t('homeExpertiseTitle')}</h2>
          <p className={styles.sectionSubtitle}>{t('homeExpertiseSubtitle')}</p>
          <div className={styles.grid4}>
            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>✨</div>
              <h3 className={styles.featureTitle}>{t('homeFeatureFrontTitle')}</h3>
              <p className={styles.featureText}>{t('homeFeatureFrontText')}</p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>🧩</div>
              <h3 className={styles.featureTitle}>{t('homeFeatureDsTitle')}</h3>
              <p className={styles.featureText}>{t('homeFeatureDsText')}</p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>🗄️</div>
              <h3 className={styles.featureTitle}>{t('homeFeatureBackTitle')}</h3>
              <p className={styles.featureText}>{t('homeFeatureBackText')}</p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>⚙️</div>
              <h3 className={styles.featureTitle}>{t('homeFeatureDevopsTitle')}</h3>
              <p className={styles.featureText}>{t('homeFeatureDevopsText')}</p>
            </article>
          </div>
        </div>
      </section>

      <section id="projects" className={styles.projectsSection}>
        <div className={styles.container}>
          <div className={styles.projectsHead}>
            <div>
              <h2 className={styles.sectionTitle}>{t('homeProjectsTitle')}</h2>
              <p className={styles.sectionSubtitle}>{t('homeProjectsSubtitle')}</p>
            </div>
          </div>

          <div className={styles.grid3}>
            <article className={styles.projectCard}>
              <div className={`${styles.projectMedia} ${styles.mediaA}`}></div>
              <div className={styles.projectBody}>
                <h3 className={styles.projectTitle}>{t('homeProject1Title')}</h3>
                <p className={styles.projectText}>{t('homeProject1Text')}</p>
                <div className={styles.tagRow}>
                  <span className={styles.tag}>Next.js</span>
                  <span className={styles.tag}>TypeScript</span>
                  <span className={styles.tag}>React Three Fiber</span>
                </div>
                <div className={styles.linkRow}>
                  <a
                    href="https://github.com/JulienMalcouronne/my-interactive"
                    target="_blank"
                    className={styles.sourceLink}
                  >
                    {t('sourceCode')}
                  </a>
                </div>
              </div>
            </article>

            <article className={styles.projectCard}>
              <div className={`${styles.projectMedia} ${styles.mediaB}`}></div>
              <div className={styles.projectBody}>
                <h3 className={styles.projectTitle}>ClimateSeed Contribute Platform</h3>
                <p className={styles.projectText}>{t('homeProject2Text')}</p>
                <div className={styles.tagRow}>
                  <span className={styles.tag}>Nuxt 4</span>
                  <span className={styles.tag}>Vue 3</span>
                  <span className={styles.tag}>TypeScript</span>
                </div>
              </div>
            </article>

            <article className={styles.projectCard}>
              <div className={`${styles.projectMedia} ${styles.mediaC}`}></div>
              <div className={styles.projectBody}>
                <h3 className={styles.projectTitle}>ClimateSeed Carbon Footprint Calculator</h3>
                <p className={styles.projectText}>{t('homeProject3Text')}</p>
                <div className={styles.tagRow}>
                  <span className={styles.tag}>Vue 3</span>
                  <span className={styles.tag}>TypeScript</span>
                  <span className={styles.tag}>Vitest</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="approach" className={styles.approachSection}>
        <div className={styles.containerNarrow}>
          <h2 className={styles.sectionTitle}>{t('homeApproachTitle')}</h2>
          <div className={styles.approachCard}>
            <p className={styles.approachText}>{t('homeApproachText')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
