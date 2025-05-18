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
              <a href="/">Accueil</a>
            </li>
            <li>
              <a href="/earth">Terre</a>
            </li>
            <li>
              <a href="/resume">CV</a>
            </li>
            <li>
              <a href="/leaderboard">Leaderboard</a>
            </li>
          </ul>
        </div>

        <div className="space-y-1">
          <p className="font-bold">Contact</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            <li>
              <a href="mailto:malcouronnejulien@gmail.com">Email</a>
            </li>
            <li>
              <a href="https://github.com/tonprofil" target="_blank">
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/julien-malcouronne/"
                target="_blank"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a href="/documents/CV_MALCOURONNE_JULIEN.pdf" target="_blank">
                Télécharger le CV
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
