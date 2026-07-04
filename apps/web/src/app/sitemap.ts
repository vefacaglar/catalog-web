import type { MetadataRoute } from 'next';

import { routing } from '@/i18n/routing';
import { getCategoryTree, getProducts } from '@/lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    entries.push(
      { url: `${SITE_URL}/${locale}`, changeFrequency: 'weekly', priority: 1 },
      { url: `${SITE_URL}/${locale}/products`, changeFrequency: 'daily', priority: 0.9 },
    );

    const [categories, products] = await Promise.all([
      getCategoryTree(locale),
      getProducts({ locale, pageSize: 100 }),
    ]);

    const flatCategories = categories.flatMap((c) => [c, ...c.children]);
    for (const category of flatCategories) {
      entries.push({
        url: `${SITE_URL}/${locale}/categories/${category.slug}`,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
    for (const product of products.items) {
      entries.push({
        url: `${SITE_URL}/${locale}/products/${product.slug}`,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  return entries;
}
