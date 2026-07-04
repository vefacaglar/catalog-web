import { schema, type Database } from '@catalog/db';
import { and, eq, ne } from 'drizzle-orm';

import { Category } from '../domain/category/category.js';
import type { CategoryRef, CategoryRepository } from '../domain/category/category-repository.js';
import { CategoryTranslation } from '../domain/category/category-translation.js';
import type { Locale } from '../domain/shared/locale.js';
import { Slug } from '../domain/shared/slug.js';
import { TranslationSet } from '../domain/shared/translation-set.js';

const { categories, categoryTranslations, products } = schema;

export class DrizzleCategoryRepository implements CategoryRepository {
  constructor(private readonly db: Database) {}

  async findById(id: number): Promise<Category | null> {
    const [row] = await this.db.select().from(categories).where(eq(categories.id, id)).limit(1);
    if (!row) return null;

    const translations = await this.db
      .select()
      .from(categoryTranslations)
      .where(eq(categoryTranslations.categoryId, id));
    const tr = translations.find((t) => t.locale === 'tr');
    const en = translations.find((t) => t.locale === 'en');
    if (!tr || !en) {
      throw new Error(`Kategori ${id} için TR/EN çeviri satırları eksik`);
    }

    return Category.reconstitute(row.id, {
      parentId: row.parentId,
      sortOrder: row.sortOrder,
      isActive: row.isActive,
      translations: TranslationSet.create({
        tr: new CategoryTranslation({
          name: tr.name,
          slug: Slug.create(tr.slug),
          description: tr.description,
        }),
        en: new CategoryTranslation({
          name: en.name,
          slug: Slug.create(en.slug),
          description: en.description,
        }),
      }),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async save(category: Category): Promise<void> {
    await this.db.transaction(async (tx) => {
      const values = {
        parentId: category.parentId,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        updatedAt: category.updatedAt,
      };

      if (category.id === null) {
        const [inserted] = await tx.insert(categories).values(values).returning({
          id: categories.id,
        });
        if (!inserted) throw new Error('Kategori eklenemedi');
        category.bindId(inserted.id);
      } else {
        await tx.update(categories).set(values).where(eq(categories.id, category.id));
        await tx
          .delete(categoryTranslations)
          .where(eq(categoryTranslations.categoryId, category.id));
      }

      await tx.insert(categoryTranslations).values(
        category.translations.entries().map(([locale, t]) => ({
          categoryId: category.persistedId,
          locale,
          name: t.name,
          slug: t.slug.value,
          description: t.description,
        })),
      );
    });
  }

  async delete(category: Category): Promise<void> {
    await this.db.delete(categories).where(eq(categories.id, category.persistedId));
  }

  async isSlugTaken(locale: Locale, slug: string, excludeCategoryId?: number): Promise<boolean> {
    const conditions = [
      eq(categoryTranslations.locale, locale),
      eq(categoryTranslations.slug, slug),
    ];
    if (excludeCategoryId !== undefined) {
      conditions.push(ne(categoryTranslations.categoryId, excludeCategoryId));
    }
    const [row] = await this.db
      .select({ id: categoryTranslations.id })
      .from(categoryTranslations)
      .where(and(...conditions))
      .limit(1);
    return row !== undefined;
  }

  async findAllRefs(): Promise<CategoryRef[]> {
    return this.db.select({ id: categories.id, parentId: categories.parentId }).from(categories);
  }

  async hasProducts(categoryId: number): Promise<boolean> {
    const [row] = await this.db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.categoryId, categoryId))
      .limit(1);
    return row !== undefined;
  }

  async hasChildren(categoryId: number): Promise<boolean> {
    const [row] = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.parentId, categoryId))
      .limit(1);
    return row !== undefined;
  }
}
