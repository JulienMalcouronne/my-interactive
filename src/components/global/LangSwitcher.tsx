'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const availableLocales = ['en', 'fr'];

  const handleChange = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    // `segments` always keeps its leading segment, so the `|| '/'` guard is a
    // defensive fallback that cannot be reached in practice.
    /* v8 ignore next */
    const newPath = segments.join('/') || '/';
    router.push(newPath);
  };

  return (
    <select
      value={locale}
      onChange={(e) => handleChange(e.target.value)}
      className="bg-black text-white border border-gray-500 p-1 rounded"
    >
      {availableLocales.map((loc) => (
        <option key={loc} value={loc}>
          {loc.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
