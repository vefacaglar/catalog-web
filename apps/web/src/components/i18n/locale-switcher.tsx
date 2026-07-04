'use client';

import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import { routing } from '@/i18n/routing';
import { Link, usePathname } from '@/i18n/navigation';
import { useAlternateLinks } from './alternate-links';

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const alternates = useAlternateLinks();

  return (
    <div className="flex items-center gap-1 text-sm">
      {routing.locales.map((target) => {
        const isActive = target === locale;
        const href = alternates?.[target] ?? `${pathname}${qs(searchParams)}`;
        return (
          <Link
            key={target}
            href={href}
            locale={target}
            className={
              isActive
                ? 'rounded bg-zinc-900 px-2 py-1 font-semibold text-white'
                : 'rounded px-2 py-1 text-zinc-600 hover:bg-zinc-100'
            }
          >
            {target.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}

function qs(params: URLSearchParams): string {
  const s = params.toString();
  return s ? `?${s}` : '';
}
