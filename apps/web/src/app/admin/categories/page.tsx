'use client';

import type { AdminCategory } from '@catalog/contracts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { AdminApiError, deleteCategory, listCategories } from '@/lib/admin-api';

export default function AdminCategoriesPage() {
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
      setError(err instanceof Error ? err.message : 'Yüklenemedi');
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(category: AdminCategory) {
    if (!confirm(`"${category.translations.tr.name}" kategorisi silinsin mi?`)) return;
    try {
      await deleteCategory(category.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silinemedi');
    }
  }

  const roots = categories?.filter((c) => c.parentId === null) ?? [];
  const childrenOf = (id: number) => categories?.filter((c) => c.parentId === id) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kategoriler</h1>
        <Link
          href="/admin/categories/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
        >
          + Yeni Kategori
        </Link>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {categories === null ? (
        <p className="mt-8 text-sm text-zinc-500">Yükleniyor...</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Ad (TR)</th>
                <th className="px-4 py-3">Slug (TR)</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3 text-right">İşlem</th>
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
                    Kategori yok
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
          <span className="text-emerald-600">Aktif</span>
        ) : (
          <span className="text-zinc-400">Pasif</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/admin/categories/${category.id}`}
          className="font-semibold text-blue-600 hover:underline"
        >
          Düzenle
        </Link>
        <button
          onClick={() => onDelete(category)}
          className="ml-4 font-semibold text-red-600 hover:underline"
        >
          Sil
        </button>
      </td>
    </tr>
  );
}
