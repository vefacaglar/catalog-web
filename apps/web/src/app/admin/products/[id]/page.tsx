'use client';

import type { AdminCategory, AdminProduct } from '@catalog/contracts';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ImageManager } from '@/components/admin/image-manager';
import { ProductForm } from '@/components/admin/product-form';
import { getProduct, listCategories } from '@/lib/admin-api';

export default function EditProductPage() {
  const t = useTranslations('admin.products');
  const tc = useTranslations('admin.common');
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getProduct(productId), listCategories()])
      .then(([p, c]) => {
        setProduct(p);
        setCategories(c);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'load-failed'));
  }, [productId]);

  if (error) {
    return (
      <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        {error === 'load-failed' ? tc('loadFailed') : error}
      </p>
    );
  }
  if (!product || !categories) return <p className="text-sm text-zinc-500">{tc('loading')}</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">
        {t('editTitle', { name: product.translations.tr.name })}
      </h1>
      <ProductForm categories={categories} initial={product} />
      <ImageManager productId={product.id} initialImages={product.images} />
    </div>
  );
}
