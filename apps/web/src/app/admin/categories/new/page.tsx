'use client';

import type { AdminCategory } from '@catalog/contracts';
import { useEffect, useState } from 'react';

import { CategoryForm } from '@/components/admin/category-form';
import { listCategories } from '@/lib/admin-api';

export default function NewCategoryPage() {
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);

  useEffect(() => {
    void listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  if (categories === null) return <p className="text-sm text-zinc-500">Yükleniyor...</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Yeni Kategori</h1>
      <CategoryForm categories={categories} />
    </div>
  );
}
