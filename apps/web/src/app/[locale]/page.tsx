import type { Locale } from '@catalog/contracts';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ProductCard } from '@/components/catalog/product-card';
import { Link } from '@/i18n/navigation';
import { getCategoryTree, getProducts } from '@/lib/api';

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const [featured, categories] = await Promise.all([
    getProducts({ locale, featured: true, pageSize: 8 }),
    getCategoryTree(locale),
  ]);

  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-zinc-900 px-6 py-12 text-center text-white sm:py-16">
        <h1 className="text-3xl font-bold sm:text-4xl">{t('home.heroTitle')}</h1>
        <p className="mx-auto mt-3 max-w-xl text-zinc-300">{t('home.heroSubtitle')}</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-200"
        >
          {t('home.browseProducts')}
        </Link>
      </section>

      <section>
        <h2 className="text-xl font-bold">{t('home.categoriesTitle')}</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="rounded-xl border border-zinc-200 p-4 text-sm font-semibold hover:border-zinc-400"
            >
              {category.name}
              {category.children.length > 0 && (
                <span className="mt-1 block text-xs font-normal text-zinc-500">
                  {category.children.map((c) => c.name).join(', ')}
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {featured.items.length > 0 && (
        <section>
          <h2 className="text-xl font-bold">{t('home.featuredTitle')}</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
