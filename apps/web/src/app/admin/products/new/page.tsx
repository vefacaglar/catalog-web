'use client';

import type { AdminCategory } from '@catalog/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { ProductForm } from '@/components/admin/product-form';
import { listCategories } from '@/lib/admin-api';

export default function NewProductPage() {
  const t = useTranslations('admin.products');
  const tc = useTranslations('admin.common');
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);

  useEffect(() => {
    void listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  if (categories === null) return <p className="text-sm text-zinc-500">{tc('loading')}</p>;
  if (categories.length === 0) {
    return (
      <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">{t('needCategory')}</p>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t('newTitle')}</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
