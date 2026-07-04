import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/components/i18n/locale-switcher';

const PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '';

export async function Header() {
  const t = await getTranslations();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight">
          {t('common.siteName')}
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-700 sm:flex">
          <Link href="/" className="hover:text-zinc-950">
            {t('nav.home')}
          </Link>
          <Link href="/products" className="hover:text-zinc-950">
            {t('nav.products')}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {PHONE && (
            <a
              href={`tel:${PHONE}`}
              className="hidden items-center gap-2 rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 sm:flex"
            >
              <PhoneIcon />
              {t('common.callUs')}
            </a>
          )}
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.36 11.36 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.57 1 1 0 0 1-.25 1.02l-2.2 2.2Z" />
    </svg>
  );
}
