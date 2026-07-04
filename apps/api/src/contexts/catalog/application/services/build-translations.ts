import type { CategoryUpsertInput, ProductUpsertInput } from '@catalog/contracts';

import type { CategoryRepository } from '../../domain/category/category-repository.js';
import { CategoryTranslation } from '../../domain/category/category-translation.js';
import type { ProductRepository } from '../../domain/product/product-repository.js';
import { ProductTranslation } from '../../domain/product/product-translation.js';
import { LOCALES } from '../../domain/shared/locale.js';
import { TranslationSet } from '../../domain/shared/translation-set.js';
import { resolveUniqueSlug } from './resolve-unique-slug.js';

export async function buildProductTranslations(
  input: ProductUpsertInput['translations'],
  repo: ProductRepository,
  excludeProductId?: number,
): Promise<TranslationSet<ProductTranslation>> {
  const entries = {} as Record<(typeof LOCALES)[number], ProductTranslation>;
  for (const locale of LOCALES) {
    const t = input[locale];
    const slug = await resolveUniqueSlug(t.name, t.slug, (candidate) =>
      repo.isSlugTaken(locale, candidate, excludeProductId),
    );
    entries[locale] = new ProductTranslation({
      name: t.name,
      slug,
      description: t.description ?? null,
    });
  }
  return TranslationSet.create(entries);
}

export async function buildCategoryTranslations(
  input: CategoryUpsertInput['translations'],
  repo: CategoryRepository,
  excludeCategoryId?: number,
): Promise<TranslationSet<CategoryTranslation>> {
  const entries = {} as Record<(typeof LOCALES)[number], CategoryTranslation>;
  for (const locale of LOCALES) {
    const t = input[locale];
    const slug = await resolveUniqueSlug(t.name, t.slug, (candidate) =>
      repo.isSlugTaken(locale, candidate, excludeCategoryId),
    );
    entries[locale] = new CategoryTranslation({
      name: t.name,
      slug,
      description: t.description ?? null,
    });
  }
  return TranslationSet.create(entries);
}
