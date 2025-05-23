import Link from "next/link";

export default function MainNavbar() {
  return (
    <nav className="gap-4 p-4 bg-black">
      <ul className="flex gap-4">
        <li>
          <Link href={"/"}>Accueil</Link>
        </li>
        <li>
          <Link href={"earth"}>Terre</Link>
        </li>
        <li>
          <Link href={"individual-carbon-footprint"}>Empreinte carbone individuel</Link>
        </li>
        <li>
          <Link href={"resume"}>CV</Link>
        </li>
        <li className="flex-1 text-right">
          <Link href={"leaderboard"}>Leaderboard</Link>
        </li>
      </ul>
    </nav>
  );
}
