import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

export default function NotFoundPage() {
  const t = useTranslations('notFound');

  return (
    <div className="py-24 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <h2 className="mt-2 text-xl font-semibold">{t('title')}</h2>
      <p className="mt-2 text-zinc-600">{t('description')}</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700"
      >
        {t('backHome')}
      </Link>
    </div>
  );
}
