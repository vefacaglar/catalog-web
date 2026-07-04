'use client';

import type { AdminProduct } from '@catalog/contracts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { AdminApiError, deleteProduct, listProducts } from '@/lib/admin-api';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (params: { page?: number; search?: string } = {}) => {
      setError(null);
      try {
        const result = await listProducts(params);
        setProducts(result.items);
        setTotalPages(result.totalPages);
      } catch (err) {
        if (err instanceof AdminApiError && err.statusCode === 401) {
          router.push('/admin/login');
          return;
        }
        setError(err instanceof Error ? err.message : 'Yüklenemedi');
      }
    },
    [router],
  );

  useEffect(() => {
    void load({ page, search: search || undefined });
  }, [load, page, search]);

  async function handleDelete(product: AdminProduct) {
    if (!confirm(`"${product.translations.tr.name}" silinsin mi? Bu işlem geri alınamaz.`)) {
      return;
    }
    try {
      await deleteProduct(product.id);
      await load({ page, search: search || undefined });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silinemedi');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ürünler</h1>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
        >
          + Yeni Ürün
        </Link>
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        placeholder="Ürün ara..."
        className="mt-4 w-full max-w-sm rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
      />

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {products === null ? (
        <p className="mt-8 text-sm text-zinc-500">Yükleniyor...</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Ad (TR)</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Görsel</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-zinc-100 last:border-0">
                  <td className="px-4 py-3 font-medium">
                    {product.translations.tr.name}
                    {product.isFeatured && (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800">
                        Öne çıkan
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{product.sku ?? '—'}</td>
                  <td className="px-4 py-3">
                    {product.isActive ? (
                      <span className="text-emerald-600">Aktif</span>
                    ) : (
                      <span className="text-zinc-400">Pasif</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{product.images.length}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Düzenle
                    </Link>
                    <button
                      onClick={() => handleDelete(product)}
                      className="ml-4 font-semibold text-red-600 hover:underline"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                    Ürün bulunamadı
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-3 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border bg-white px-3 py-1.5 disabled:opacity-40"
          >
            ← Önceki
          </button>
          <span>
            Sayfa {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border bg-white px-3 py-1.5 disabled:opacity-40"
          >
            Sonraki →
          </button>
        </div>
      )}
    </div>
  );
}
