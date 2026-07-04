'use client';

import type { AdminCategory } from '@catalog/contracts';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { AdminApiError, deleteCategory, listCategories } from '@/lib/admin-api';

export default function AdminCategoriesPage() {
  const t = useTranslations('admin.categories');
  const tc = useTranslations('admin.common');
  const router = useRouter();
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setCategories(await listCategories());
    } catch (err) {
      if (err instanceof AdminApiError && err.statusCode === 401) {
        router.push('/admin/login');
        return;
      }
      setError(err instanceof Error ? err.message : tc('loadFailed'));
    }
  }, [router, tc]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(category: AdminCategory) {
    if (!confirm(t('deleteConfirm', { name: category.translations.tr.name }))) return;
    try {
      await deleteCategory(category.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : tc('deleteFailed'));
    }
  }

  const roots = categories?.filter((c) => c.parentId === null) ?? [];
  const childrenOf = (id: number) => categories?.filter((c) => c.parentId === id) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Link
          href="/admin/categories/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
        >
          {t('new')}
        </Link>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {categories === null ? (
        <p className="mt-8 text-sm text-zinc-500">{tc('loading')}</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">{t('nameTr')}</th>
                <th className="px-4 py-3">{t('slugTr')}</th>
                <th className="px-4 py-3">{tc('status')}</th>
                <th className="px-4 py-3 text-right">{tc('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {roots.flatMap((root) => [
                <CategoryRow key={root.id} category={root} depth={0} onDelete={handleDelete} />,
                ...childrenOf(root.id).map((child) => (
                  <CategoryRow
                    key={child.id}
                    category={child}
                    depth={1}
                    onDelete={handleDelete}
                  />
                )),
              ])}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                    {t('empty')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CategoryRow({
  category,
  depth,
  onDelete,
}: {
  category: AdminCategory;
  depth: number;
  onDelete: (category: AdminCategory) => void;
}) {
  const tc = useTranslations('admin.common');

  return (
    <tr className="border-b border-zinc-100 last:border-0">
      <td className="px-4 py-3 font-medium">
        <span style={{ paddingLeft: depth * 20 }}>
          {depth > 0 && <span className="text-zinc-400">└ </span>}
          {category.translations.tr.name}
        </span>
      </td>
      <td className="px-4 py-3 font-mono text-xs">{category.translations.tr.slug}</td>
      <td className="px-4 py-3">
        {category.isActive ? (
          <span className="text-emerald-600">{tc('active')}</span>
        ) : (
          <span className="text-zinc-400">{tc('inactive')}</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/admin/categories/${category.id}`}
          className="font-semibold text-blue-600 hover:underline"
        >
          {tc('edit')}
        </Link>
        <button
          onClick={() => onDelete(category)}
          className="ml-4 font-semibold text-red-600 hover:underline"
        >
          {tc('delete')}
        </button>
      </td>
    </tr>
  );
}
