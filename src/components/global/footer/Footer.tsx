import Link from "next/link";

export default function Footer() {
  return (
    <footer className="sticky bottom-0 bg-neutral-900 text-white text-sm px-6 py-3 no-print">
      <div className="max-w-screen-xl mx-auto flex flex-wrap justify-between items-start gap-y-4">
        <div className="space-y-1">
          <p className="font-bold">Julien Malcouronne</p>
          <p>Développeur Front-End</p>
          <p className="text-xs text-gray-400">© 2025 – Made with Next.js</p>
        </div>

        <div className="space-y-1">
          <p className="font-bold">Navigation</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            <li>
              <Link href="/">Accueil</Link>
            </li>
            <li>
              <Link href="/earth">Terre</Link>
            </li>
            <li>
              <Link href="individual-carbon-footprint">
                Empreinte carbone individuel
              </Link>
            </li>
            <li>
              <Link href="/resume">CV</Link>
            </li>

            <li>
              <Link href="/leaderboard">Leaderboard</Link>
            </li>
          </ul>
        </div>

        <div className="space-y-1">
          <p className="font-bold">Contact</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            <li>
              <Link href="mailto:malcouronnejulien@gmail.com">Email</Link>
            </li>
            <li>
              <Link href="https://github.com/JulienMalcouronne" target="_blank">
                GitHub
              </Link>
            </li>
            <li>
              <Link
                href="https://www.linkedin.com/in/julien-malcouronne/"
                target="_blank"
              >
                LinkedIn
              </Link>
            </li>
            <li>
              <Link href="/documents/CV_MALCOURONNE_JULIEN.pdf" target="_blank">
                Télécharger le CV
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
