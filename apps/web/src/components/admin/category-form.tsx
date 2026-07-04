'use client';

import type { AdminCategory, CategoryUpsertInput } from '@catalog/contracts';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { AdminApiError, createCategory, updateCategory } from '@/lib/admin-api';

type LocaleTab = 'tr' | 'en';

interface TranslationDraft {
  name: string;
  slug: string;
  description: string;
}

interface CategoryFormProps {
  categories: AdminCategory[];
  initial?: AdminCategory;
}

const emptyDraft: TranslationDraft = { name: '', slug: '', description: '' };

export function CategoryForm({ categories, initial }: CategoryFormProps) {
  const t = useTranslations('admin.form');
  const tc = useTranslations('admin.common');
  const router = useRouter();
  const [tab, setTab] = useState<LocaleTab>('tr');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [parentId, setParentId] = useState<number | null>(initial?.parentId ?? null);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
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

  const parentOptions = categories.filter(
    (c) => c.id !== initial?.id && c.parentId !== initial?.id,
  );

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

    const input: CategoryUpsertInput = {
      parentId,
      sortOrder,
      isActive,
      translations: {
        tr: toTranslationInput(drafts.tr),
        en: toTranslationInput(drafts.en),
      },
    };

    setBusy(true);
    try {
      if (initial) {
        await updateCategory(initial.id, input);
      } else {
        await createCategory(input);
      }
      router.push('/admin/categories');
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
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block text-sm font-medium">
            {t('parent')}
            <select
              value={parentId ?? ''}
              onChange={(e) => setParentId(e.target.value === '' ? null : Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="">{t('rootOption')}</option>
              {parentOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.translations.tr.name}
                </option>
              ))}
            </select>
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
          <label className="flex items-end gap-2 pb-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            {t('active')}
          </label>
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
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm"
            />
          </label>
          <label className="block text-sm font-medium">
            {t('description', { locale: tab.toUpperCase() })}
            <textarea
              value={drafts[tab].description}
              onChange={(e) => setDraft(tab, { description: e.target.value })}
              rows={3}
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
          onClick={() => router.push('/admin/categories')}
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
