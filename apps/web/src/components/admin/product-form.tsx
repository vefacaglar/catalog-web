'use client';

import type { AdminCategory, AdminProduct, ProductUpsertInput } from '@catalog/contracts';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { AdminApiError, createProduct, updateProduct } from '@/lib/admin-api';

type LocaleTab = 'tr' | 'en';

interface TranslationDraft {
  name: string;
  slug: string;
  description: string;
}

interface ProductFormProps {
  categories: AdminCategory[];
  initial?: AdminProduct;
}

const emptyDraft: TranslationDraft = { name: '', slug: '', description: '' };

export function ProductForm({ categories, initial }: ProductFormProps) {
  const t = useTranslations('admin.form');
  const tc = useTranslations('admin.common');
  const router = useRouter();
  const [tab, setTab] = useState<LocaleTab>('tr');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [categoryId, setCategoryId] = useState<number>(
    initial?.categoryId ?? categories[0]?.id ?? 0,
  );
  const [sku, setSku] = useState(initial?.sku ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [isAvailable, setIsAvailable] = useState(initial?.isAvailable ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [drafts, setDrafts] = useState<Record<LocaleTab, TranslationDraft>>({
    tr: initial
      ? {
          name: initial.translations.tr.name,
          slug: initial.translations.tr.slug,
          description: initial.translations.tr.description ?? '',
        }
      : emptyDraft,
    en: initial
      ? {
          name: initial.translations.en.name,
          slug: initial.translations.en.slug,
          description: initial.translations.en.description ?? '',
        }
      : emptyDraft,
  });

  function setDraft(locale: LocaleTab, patch: Partial<TranslationDraft>) {
    setDrafts((prev) => ({ ...prev, [locale]: { ...prev[locale], ...patch } }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    for (const locale of ['tr', 'en'] as const) {
      if (!drafts[locale].name.trim()) {
        setTab(locale);
        setError(t('nameRequired', { locale: locale.toUpperCase() }));
        return;
      }
    }

    const input: ProductUpsertInput = {
      categoryId,
      sku: sku.trim() || null,
      isActive,
      isAvailable,
      isFeatured,
      sortOrder,
      translations: {
        tr: toTranslationInput(drafts.tr),
        en: toTranslationInput(drafts.en),
      },
    };

    setBusy(true);
    try {
      if (initial) {
        await updateProduct(initial.id, input);
      } else {
        await createProduct(input);
      }
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : tc('saveFailed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          {t('general')}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            {t('category')}
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            >
              {categoryOptions(categories).map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            {t('sku')}
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-medium">
            {t('sortOrder')}
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <div className="flex items-end gap-6 pb-1">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              {t('active')}
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
              />
              {t('available')}
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              {t('featured')}
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {t('content')}
          </h2>
          <div className="flex gap-1 rounded-lg bg-zinc-100 p-1">
            {(['tr', 'en'] as const).map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => setTab(locale)}
                className={
                  tab === locale
                    ? 'rounded-md bg-white px-4 py-1 text-sm font-semibold shadow-sm'
                    : 'rounded-md px-4 py-1 text-sm text-zinc-500'
                }
              >
                {locale.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <label className="block text-sm font-medium">
            {t('name', { locale: tab.toUpperCase() })}
            <input
              value={drafts[tab].name}
              onChange={(e) => setDraft(tab, { name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-medium">
            {t('slug', { locale: tab.toUpperCase() })}
            <input
              value={drafts[tab].slug}
              onChange={(e) => setDraft(tab, { slug: e.target.value })}
              placeholder={t('slugPlaceholder')}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm"
            />
          </label>
          <label className="block text-sm font-medium">
            {t('description', { locale: tab.toUpperCase() })}
            <textarea
              value={drafts[tab].description}
              onChange={(e) => setDraft(tab, { description: e.target.value })}
              rows={5}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {busy ? tc('saving') : initial ? tc('update') : tc('create')}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="rounded-lg border border-zinc-300 px-6 py-2.5 text-sm font-semibold hover:bg-zinc-50"
        >
          {tc('cancel')}
        </button>
      </div>
    </form>
  );
}

function toTranslationInput(draft: TranslationDraft) {
  return {
    name: draft.name.trim(),
    slug: draft.slug.trim() || undefined,
    description: draft.description.trim() || null,
  };
}

function categoryOptions(categories: AdminCategory[]): { id: number; label: string }[] {
  const roots = categories.filter((c) => c.parentId === null);
  const result: { id: number; label: string }[] = [];

  function walk(list: AdminCategory[], depth: number) {
    for (const cat of list) {
      result.push({ id: cat.id, label: `${'— '.repeat(depth)}${cat.translations.tr.name}` });
      walk(
        categories.filter((c) => c.parentId === cat.id),
        depth + 1,
      );
    }
  }
  walk(roots, 0);
  return result;
}
