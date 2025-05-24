import React from "react";
import {
  UserIcon,
  MapPinIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import ResumeActions from "@/components/resume/ResumeActions";

export default function Resume() {
  return (
    <div className="max-w-4xl mx-auto p-8 font-sans text-gray-800">
      <ResumeActions />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <aside className="space-y-6 print:order-2">
          <div>
            <h2 className="text-lg font-bold uppercase border-b pb-1 mb-2">
              Contact
            </h2>
            <ul className="text-sm space-y-1">
              <li className="flex items-center gap-2">
                <UserIcon className="size-4" />
                <span>Julien Malcouronne</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPinIcon className="size-4" />
                92100 Boulogne-Billancourt
              </li>
              <li className="flex items-center gap-2">
                <EnvelopeIcon className="size-4" />
                <a
                  href="mailto:malcouronnejulien@gmail.com"
                  className="font-bold"
                >
                  malcouronnejulien@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold uppercase border-b pb-1 mb-2">
              Langues
            </h2>
            <ul className="text-sm space-y-1">
              <li>Français : Langue maternelle</li>
              <li>Anglais : C1</li>
              <li>Suédois : A1</li>
              <li>Espagnol : A1</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold uppercase border-b pb-1 mb-2">
              Compétences
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
              Intérêts
            </h2>
            <ul className="text-sm space-y-1">
              <li>Danses latines : Kizomba, Bachata</li>
              <li>Voyages</li>
            </ul>
          </div>
        </aside>

        <div className="md:col-span-2 space-y-8 print:order-1">
          <section>
            <h1 className="text-3xl font-bold mb-1">Julien Malcouronne</h1>
            <p className="text-lg text-gray-600">
              Tech Lead Front-End | Développeur Web
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold border-b pb-1 mb-2 uppercase">
              Profil
            </h2>
            <p className="text-sm">
              Développeur front-end avec plus de 3 ans d’expérience, passionné
              par la création d’interfaces web performantes et élégantes.
              Actuellement Tech Lead chez ClimateSeed, je combine expertise
              technique et coordination d'équipe pour livrer des solutions
              robustes et évolutives.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold border-b pb-1 mb-2 uppercase">
              Expériences
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-bold">Tech Lead Frontend – ClimateSeed</h3>
                <p className="italic text-xs">Juin 2023 – Aujourd’hui</p>
                <ul className="list-disc list-inside">
                  <li>
                    Encadrement d'une équipe front, revue de code, formation
                  </li>
                  <li>Architecture applicative, optimisation performance</li>
                  <li>Coordination avec design/produit</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold">
                  Développeur Frontend – ClimateSeed
                </h3>
                <p className="italic text-xs">Mars 2022 – Mai 2023</p>
                <ul className="list-disc list-inside">
                  <li>Développement d’interfaces Vue.js</li>
                  <li>Intégration d’API REST, tests unitaires</li>
                  <li>Collaboration en équipe pluridisciplinaire</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold border-b pb-1 mb-2 uppercase">
              Expériences complémentaires
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-bold">Business Developer</h3>
                <p className="italic text-xs">2016 – 2021</p>
                <ul className="list-disc list-inside">
                  <li>
                    Élaboration et mise en œuvre de stratégies commerciales
                  </li>
                  <li>
                    Gestion de relations clients et partenaires stratégiques
                  </li>
                  <li>Analyse de marché et identification d’opportunités</li>
                  <li>Négociation de contrats et partenariats durables</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold border-b pb-1 mb-2 uppercase">
              Formations
            </h2>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Le Wagon – Développement Web (2021)</li>
              <li>
                Montpellier Business School – Master Vente & International
                Business (2016 – 2020)
              </li>
              <li>
                Linköping University (Suède) – Business Administration (2017 –
                2018)
              </li>
              <li>
                IUT Cergy – DUT Techniques de Commercialisation (2014 – 2016)
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
