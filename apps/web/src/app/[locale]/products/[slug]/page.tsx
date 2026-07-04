import type { Locale } from '@catalog/contracts';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { ContactCta } from '@/components/contact/contact-cta';
import { SetAlternateLinks } from '@/components/i18n/alternate-links';
import { Link } from '@/i18n/navigation';
import { getProductBySlug } from '@/lib/api';
import { imageUrl } from '@/lib/image';

interface ProductDetailPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { locale, slug } = await params;
  const product = await getProductBySlug(locale, slug);
  if (!product) return {};

  // hreflang: her iki dildeki slug'larla alternatifler
  const languages = Object.fromEntries(
    Object.entries(product.slugs).map(([loc, s]) => [loc, `${SITE_URL}/${loc}/products/${s}`]),
  );

  return {
    title: product.name,
    description: product.description?.slice(0, 160) ?? undefined,
    alternates: {
      canonical: `${SITE_URL}/${locale}/products/${product.slug}`,
      languages,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const product = await getProductBySlug(locale, slug);
  if (!product) notFound();

  const alternates = Object.fromEntries(
    Object.entries(product.slugs).map(([loc, s]) => [loc, `/products/${s}`]),
  );

  const cover = product.images[0] ?? null;
  const rest = product.images.slice(1);

  return (
    <div>
      <SetAlternateLinks links={alternates} />

      <nav className="flex flex-wrap items-center gap-1 text-sm text-zinc-500">
        <Link href="/products" className="hover:underline">
          {t('nav.products')}
        </Link>
        {product.breadcrumb.map((crumb) => (
          <span key={crumb.id} className="flex items-center gap-1">
            <span>/</span>
            <Link href={`/categories/${crumb.slug}`} className="hover:underline">
              {crumb.name}
            </Link>
          </span>
        ))}
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100">
            {cover ? (
              <Image
                src={imageUrl(cover.filePath, 'gallery')}
                alt={cover.alt ?? product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-400">
                {t('product.noImage')}
              </div>
            )}
          </div>
          {rest.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {rest.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100"
                >
                  <Image
                    src={imageUrl(image.filePath, 'thumb')}
                    alt={image.alt ?? product.name}
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-zinc-500">
              {product.category.name}
            </p>
            <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
            {product.sku && (
              <p className="mt-2 text-sm text-zinc-500">
                {t('product.sku')}: <span className="font-mono">{product.sku}</span>
              </p>
            )}
          </div>

          {product.description && (
            <p className="whitespace-pre-line leading-relaxed text-zinc-700">
              {product.description}
            </p>
          )}

          <ContactCta
            productName={product.name}
            productUrl={`${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/${locale}/products/${product.slug}`}
          />
        </div>
      </div>
    </div>
  );
}
