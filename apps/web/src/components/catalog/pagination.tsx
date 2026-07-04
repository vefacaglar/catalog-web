import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}

export async function Pagination({ page, totalPages, basePath, searchParams }: PaginationProps) {
  const t = await getTranslations();
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    if (target > 1) params.set('page', String(target));
    else params.delete('page');
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <nav className="mt-8 flex items-center justify-center gap-4 text-sm">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className="rounded border px-3 py-1.5 hover:bg-zinc-50">
          ← {t('pagination.previous')}
        </Link>
      ) : (
        <span className="rounded border px-3 py-1.5 text-zinc-300">← {t('pagination.previous')}</span>
      )}
      <span className="text-zinc-600">{t('pagination.page', { page, total: totalPages })}</span>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className="rounded border px-3 py-1.5 hover:bg-zinc-50">
          {t('pagination.next')} →
        </Link>
      ) : (
        <span className="rounded border px-3 py-1.5 text-zinc-300">{t('pagination.next')} →</span>
      )}
    </nav>
  );
}
