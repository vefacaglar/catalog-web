'use client';

import type { AdminCategory } from '@catalog/contracts';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { CategoryForm } from '@/components/admin/category-form';
import { listCategories } from '@/lib/admin-api';

export default function EditCategoryPage() {
  const params = useParams<{ id: string }>();
  const categoryId = Number(params.id);

  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Yüklenemedi'));
  }, []);

  if (error) return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  if (!categories) return <p className="text-sm text-zinc-500">Yükleniyor...</p>;

  const category = categories.find((c) => c.id === categoryId);
  if (!category) {
    return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">Kategori bulunamadı</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">
        Kategoriyi Düzenle: {category.translations.tr.name}
      </h1>
      <CategoryForm categories={categories} initial={category} />
    </div>
  );
}
