import Link from "next/link";
import { useTranslations } from "next-intl";

export default function MainNavbar() {
  const t = useTranslations();

  return (
    <nav className="gap-4 p-4 bg-black">
      <ul className="flex gap-4">
        <li>
          <Link href={"/"}>{t("home")}</Link>
        </li>
        <li>
          <Link href={"earth"}>Terre</Link>
        </li>
        <li>
          <Link href={"individual-carbon-footprint"}>
            Empreinte carbone individuel
          </Link>
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
