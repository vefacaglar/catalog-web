'use client';

import type { AdminCategory } from '@catalog/contracts';
import { useEffect, useState } from 'react';

import { ProductForm } from '@/components/admin/product-form';
import { listCategories } from '@/lib/admin-api';

export default function NewProductPage() {
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);

  useEffect(() => {
    void listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  if (categories === null) return <p className="text-sm text-zinc-500">Yükleniyor...</p>;
  if (categories.length === 0) {
    return (
      <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
        Ürün eklemeden önce en az bir kategori oluşturmalısınız.
      </p>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Yeni Ürün</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
