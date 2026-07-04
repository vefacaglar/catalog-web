import { getTranslations } from 'next-intl/server';

const PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '';

interface ContactCtaProps {
  productName: string;
  productUrl: string;
}

/** Telefonla satış modeli: ürün sayfasındaki ana aksiyon arama / WhatsApp */
export async function ContactCta({ productName, productUrl }: ContactCtaProps) {
  const t = await getTranslations();
  if (!PHONE) return null;

  const waNumber = PHONE.replace(/[^0-9]/g, '');
  const waText = encodeURIComponent(
    t('product.whatsappMessage', { name: productName, url: productUrl }),
  );

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
      <h2 className="text-base font-semibold text-zinc-900">{t('product.contactTitle')}</h2>
      <p className="mt-1 text-sm text-zinc-600">{t('product.contactSubtitle')}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <a
          href={`tel:${PHONE}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          {t('common.callUs')}: {PHONE}
        </a>
        <a
          href={`https://wa.me/${waNumber}?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-emerald-600 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
        >
          {t('common.whatsapp')}
        </a>
      </div>
    </div>
  );
}
