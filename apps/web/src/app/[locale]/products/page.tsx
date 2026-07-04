import type { Locale } from '@catalog/contracts';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Pagination } from '@/components/catalog/pagination';
import { ProductCard } from '@/components/catalog/product-card';
import { Link } from '@/i18n/navigation';
import { getCategoryTree, getProducts } from '@/lib/api';

interface ProductsPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ category?: string; search?: string; page?: string }>;
}

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const [result, categories] = await Promise.all([
    getProducts({ locale, category: sp.category, search: sp.search, page }),
    getCategoryTree(locale),
  ]);

  const flatCategories = categories.flatMap((c) => [c, ...c.children]);

  return (
    <div>
      <h1 className="text-2xl font-bold">{t('products.title')}</h1>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <nav className="flex flex-wrap gap-2 lg:flex-col">
            <CategoryFilterLink
              label={t('products.allCategories')}
              href="/products"
              active={!sp.category}
            />
            {flatCategories.map((category) => (
              <CategoryFilterLink
                key={category.id}
                label={category.name}
                href={`/products?category=${category.slug}`}
                active={sp.category === category.slug}
              />
            ))}
          </nav>

          <form action="/products" className="mt-4 flex gap-2 lg:flex-col">
            {sp.category && <input type="hidden" name="category" value={sp.category} />}
            <input
              type="search"
              name="search"
              defaultValue={sp.search ?? ''}
              placeholder={t('products.searchPlaceholder')}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
            >
              {t('products.search')}
            </button>
          </form>
        </aside>

        <div className="flex-1">
          <p className="text-sm text-zinc-500">
            {t('products.resultCount', { count: result.total })}
          </p>
          {result.items.length === 0 ? (
            <p className="mt-8 rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500">
              {t('products.empty')}
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {result.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            basePath="/products"
            searchParams={{ category: sp.category, search: sp.search }}
          />
        </div>
      </div>
    </div>
  );
}

function CategoryFilterLink({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? 'rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white'
          : 'rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:border-zinc-400'
      }
    >
      {label}
    </Link>
  );
}
