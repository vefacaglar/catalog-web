import type { Locale } from '@catalog/contracts';
import { setRequestLocale } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';

interface CategoryPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  redirect({ href: `/products?category=${encodeURIComponent(slug)}`, locale });
}
