import React from 'react';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <section id="home">
        <div className={`${styles.container} ${styles.hero}`}>
          <p className={styles.badge}>
            <span className={styles.badgeDot}></span>
            En poste, mais à l&apos;écoute d&apos;opportunités
          </p>
          <h1 className={styles.heroTitle}>Julien Malcouronne</h1>
          <p className={styles.heroText}>
            Front‑End & Full‑Stack Developer — Je conçois des expériences web{' '}
            <span className={styles.semibold}>dynamiques</span>,{' '}
            <span className={styles.semibold}>accessibles</span> et{' '}
            <span className={styles.semibold}>durables</span>. Next.js · Nuxt · Design System ·
            PostgreSQL · Docker/K8s.
          </p>
          <div className={styles.ctaRow}></div>
        </div>
      </section>

      <section id="expertise">
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Mon expertise</h2>
          <p className={styles.sectionSubtitle}>
            Du design system à l&apos;infra, j&apos;aime livrer des produits soignés, performants et
            maintenables.
          </p>
          <div className={styles.grid4}>
            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>✨</div>
              <h3 className={styles.featureTitle}>Front‑End moderne</h3>
              <p className={styles.featureText}>
                Next.js, Nuxt, TypeScript, animations subtiles, accessibilité (WCAG), UX
                pragmatique.
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>🧩</div>
              <h3 className={styles.featureTitle}>Design System & Storybook</h3>
              <p className={styles.featureText}>
                Composants réutilisables, tokens, thèmes, documentation vivante, CI visuelle.
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>🗄️</div>
              <h3 className={styles.featureTitle}>Back‑End robuste</h3>
              <p className={styles.featureText}>
                API Node/Edge, PostgreSQL, migrations, sécurité, observabilité (Sentry).
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>⚙️</div>
              <h3 className={styles.featureTitle}>DevOps & CI/CD</h3>
              <p className={styles.featureText}>
                Docker multi‑stage, K8s, tests (Vitest/Playwright), qualité, déploiements fiables.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="projects" className={styles.projectsSection}>
        <div className={styles.container}>
          <div className={styles.projectsHead}>
            <div>
              <h2 className={styles.sectionTitle}>Projets sélectionnés</h2>
              <p className={styles.sectionSubtitle}>Quelques réalisations représentatives.</p>
            </div>
          </div>

          <div className={styles.grid3}>
            <article className={styles.projectCard}>
              <div className={`${styles.projectMedia} ${styles.mediaA}`}></div>
              <div className={styles.projectBody}>
                <h3 className={styles.projectTitle}>Portfolio interactif (Next.js + R3F)</h3>
                <p className={styles.projectText}>
                  Globe 3D, scoring gamifié, i18n, routes app dir, composants server/client.
                </p>
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
                    Code source
                  </a>
                </div>
              </div>
            </article>

            <article className={styles.projectCard}>
              <div className={`${styles.projectMedia} ${styles.mediaB}`}></div>
              <div className={styles.projectBody}>
                <h3 className={styles.projectTitle}>ClimateSeed Contribute Platform</h3>
                <p className={styles.projectText}>
                  UI complexes (matrices, tables), accessibilité, perf, sécurité, CI/CD.
                </p>
                <div className={styles.tagRow}>
                  <span className={styles.tag}>Nuxt 3</span>
                  <span className={styles.tag}>Vue 3</span>
                  <span className={styles.tag}>TypeScript</span>
                </div>
              </div>
            </article>

            <article className={styles.projectCard}>
              <div className={`${styles.projectMedia} ${styles.mediaC}`}></div>
              <div className={styles.projectBody}>
                <h3 className={styles.projectTitle}>ClimateSeed Carbon Footprint Calculator</h3>
                <p className={styles.projectText}>
                  Tech lead : Calculateur interactif, modèles d’émissions, UX claire, export &
                  partage.
                </p>
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
          <h2 className={styles.sectionTitle}>Mon approche</h2>
          <div className={styles.approachCard}>
            <p className={styles.approachText}>
              Je conçois des interfaces élégantes et accessibles, avec une architecture solide côté
              back‑end et une attention constante à la qualité (tests, CI/CD, observabilité). Mon
              objectif : livrer des produits fiables, durables et agréables à utiliser.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
