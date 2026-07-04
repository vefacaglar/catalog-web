import { getTranslations } from 'next-intl/server';

const PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '';

export async function Footer() {
  const t = await getTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-zinc-600 sm:flex-row">
        <p>
          © {year} {t('common.siteName')}. {t('footer.rights')}
        </p>
        {PHONE && (
          <p>
            {t('footer.contact')}:{' '}
            <a href={`tel:${PHONE}`} className="font-semibold text-zinc-900 hover:underline">
              {PHONE}
            </a>
          </p>
        )}
      </div>
    </footer>
  );
}
