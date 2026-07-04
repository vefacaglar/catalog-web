'use client';

import type { AdminCategory } from '@catalog/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { CategoryForm } from '@/components/admin/category-form';
import { listCategories } from '@/lib/admin-api';

export default function NewCategoryPage() {
  const t = useTranslations('admin.categories');
  const tc = useTranslations('admin.common');
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);

  useEffect(() => {
    void listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  if (categories === null) return <p className="text-sm text-zinc-500">{tc('loading')}</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t('newTitle')}</h1>
      <CategoryForm categories={categories} />
    </div>
  );
}
