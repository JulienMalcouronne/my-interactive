import React from 'react';

export default function Home() {
  return (
    <div className="overflow-auto">
      <section id="home">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur px-3 py-1 text-xs text-slate-600 dark:text-slate-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-500"></span>
            En poste, mais à l'écoute d'opportunités
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05] text-gray-700">
            Julien Malcouronne
          </h1>
          <p className="mt-5 max-w-2xl text-lg sm:text-xl text-gray-600 ">
            Front‑End & Full‑Stack Developer — je conçois des expériences web{' '}
            <span className="font-semibold">dynamiques</span>,{' '}
            <span className="font-semibold">accessibles</span> et{' '}
            <span className="font-semibold">durables</span>. Next.js · Nuxt · Design System ·
            PostgreSQL · Docker/K8s.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {/* <a
              href="#projects"
              className="inline-flex items-center justify-center rounded-xl bg-sky-600 text-white px-5 py-3 text-sm font-medium shadow-soft hover:bg-sky-700 active:scale-[.98]"
            >
              Voir mes projets
            </a>
            <a
              href="#cv"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-3 text-sm font-medium hover:shadow-soft active:scale-[.98]"
            >
              Découvrir mon CV
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-3 text-sm font-medium hover:shadow-soft active:scale-[.98]"
            >
              Me contacter
            </a> */}
          </div>
        </div>
      </section>

      <section id="expertise">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-700">
            Mon expertise
          </h2>
          <p className="mt-3 max-w-2xl text-gray-500">
            Du design system à l'infra, j'aime livrer des produits soignés, performants et
            maintenables.
          </p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <article className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900 shadow-soft">
              <div className="text-2xl">✨</div>
              <h3 className="mt-3 font-semibold">Front‑End moderne</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Next.js, Nuxt, TypeScript, animations subtiles, accessibilité (WCAG), UX
                pragmatique.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900 shadow-soft">
              <div className="text-2xl">🧩</div>
              <h3 className="mt-3 font-semibold">Design System & Storybook</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Composants réutilisables, tokens, thèmes, documentation vivante, CI visuelle.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900 shadow-soft">
              <div className="text-2xl">🗄️</div>
              <h3 className="mt-3 font-semibold">Back‑End robuste</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                API Node/Edge, PostgreSQL, migrations, sécurité, observabilité (Sentry).
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900 shadow-soft">
              <div className="text-2xl">⚙️</div>
              <h3 className="mt-3 font-semibold">DevOps & CI/CD</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Docker multi‑stage, K8s, tests (Vitest/Playwright), qualité, déploiements fiables.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="projects" className="mt-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-700">
                Projets sélectionnés
              </h2>
              <p className="mt-3 max-w-2xl text-gray-500">Quelques réalisations représentatives.</p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <article className="group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-soft">
              <div className="aspect-[16/9] bg-gradient-to-br from-sky-200 to-fuchsia-200 dark:from-sky-950 dark:to-fuchsia-900/50"></div>
              <div className="p-5">
                <h3 className="font-semibold group-hover:text-sky-600">
                  Portfolio interactif (Next.js + R3F)
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Globe 3D, scoring gamifié, i18n, routes app dir, composants server/client.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <span className="rounded-lg border border-slate-200 dark:border-slate-800 px-2 py-1">
                    Next.js
                  </span>
                  <span className="rounded-lg border border-slate-200 dark:border-slate-800 px-2 py-1">
                    TypeScript
                  </span>
                  <span className="rounded-lg border border-slate-200 dark:border-slate-800 px-2 py-1">
                    React Three Fiber
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <a
                    href="https://github.com/JulienMalcouronne/my-interactive"
                    target="_blank"
                    className="text-sm font-medium text-sky-600 hover:underline"
                  >
                    Code source
                  </a>
                </div>
              </div>
            </article>

            <article className="group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-soft">
              <div className="aspect-[16/9] bg-gradient-to-br from-emerald-200 to-cyan-200 dark:from-emerald-950 dark:to-cyan-900/50"></div>
              <div className="p-5">
                <h3 className="font-semibold group-hover:text-sky-600">
                  ClimateSeed Contribute Platform
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  UI complexes (matrices, tables), accessibilité, perf, sécurité, CI/CD.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <span className="rounded-lg border border-slate-200 dark:border-slate-800 px-2 py-1">
                    Nuxt 3
                  </span>
                  <span className="rounded-lg border border-slate-200 dark:border-slate-800 px-2 py-1">
                    Vue 3
                  </span>
                  <span className="rounded-lg border border-slate-200 dark:border-slate-800 px-2 py-1">
                    TypeScript
                  </span>
                </div>
              </div>
            </article>

            <article className="group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-soft">
              <div className="aspect-[16/9] bg-gradient-to-br from-amber-200 to-rose-200 dark:from-amber-950 dark:to-rose-900/50"></div>
              <div className="p-5">
                <h3 className="font-semibold group-hover:text-sky-600">
                  ClimateSeed Carbon Footprint Calculator
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Tech lead : Calculateur interactif, modèles d’émissions, UX claire, export &
                  partage.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <span className="rounded-lg border border-slate-200 dark:border-slate-800 px-2 py-1">
                    Vue 3
                  </span>
                  <span className="rounded-lg border border-slate-200 dark:border-slate-800 px-2 py-1">
                    TypeScript
                  </span>
                  <span className="rounded-lg border border-slate-200 dark:border-slate-800 px-2 py-1">
                    Vitest
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section id="approach" className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-700">
            Mon approche
          </h2>
          <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-soft">
            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-200">
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
