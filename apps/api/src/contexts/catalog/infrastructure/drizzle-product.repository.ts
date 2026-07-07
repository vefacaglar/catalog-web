import { schema, type Database } from '@catalog/db';
import { and, eq, inArray, ne } from 'drizzle-orm';

import type { Locale } from '../domain/shared/locale.js';
import type { Product } from '../domain/product/product.js';
import type { ProductRepository } from '../domain/product/product-repository.js';
import { toProductAggregate } from './product.mapper.js';

const { productImages, products, productTranslations } = schema;

export class DrizzleProductRepository implements ProductRepository {
  constructor(private readonly db: Database) {}

  async findById(id: number): Promise<Product | null> {
    const [row] = await this.db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!row) return null;

    const translations = await this.db
      .select()
      .from(productTranslations)
      .where(eq(productTranslations.productId, id));
    const images = await this.db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id));

    return toProductAggregate(row, translations, images);
  }

  async save(product: Product): Promise<void> {
    await this.db.transaction(async (tx) => {
      const values = {
        categoryId: product.categoryId,
        sku: product.sku,
        isActive: product.isActive,
        isAvailable: product.isAvailable,
        isFeatured: product.isFeatured,
        sortOrder: product.sortOrder,
        updatedAt: product.updatedAt,
      };

      if (product.id === null) {
        const [inserted] = await tx.insert(products).values(values).returning({
          id: products.id,
        });
        if (!inserted) throw new Error('Failed to insert product');
        product.bindId(inserted.id);
      } else {
        await tx.update(products).set(values).where(eq(products.id, product.id));
        await tx
          .delete(productTranslations)
          .where(eq(productTranslations.productId, product.id));
      }

      const productId = product.persistedId;

      await tx.insert(productTranslations).values(
        product.translations.entries().map(([locale, t]) => ({
          productId,
          locale,
          name: t.name,
          slug: t.slug.value,
          description: t.description,
        })),
      );

      const keptIds = product.images
        .map((img) => img.id)
        .filter((id): id is number => id !== null);
      const existing = await tx
        .select({ id: productImages.id })
        .from(productImages)
        .where(eq(productImages.productId, productId));
      const removedIds = existing.map((r) => r.id).filter((id) => !keptIds.includes(id));
      if (removedIds.length > 0) {
        await tx.delete(productImages).where(inArray(productImages.id, removedIds));
      }

      for (const image of product.images) {
        if (image.id === null) {
          const [inserted] = await tx
            .insert(productImages)
            .values({
              productId,
              filePath: image.filePath,
              externalId: image.externalId,
              altTr: image.altTr,
              altEn: image.altEn,
              sortOrder: image.sortOrder,
              width: image.width,
              height: image.height,
            })
            .returning({ id: productImages.id });
          if (!inserted) throw new Error('Failed to insert image');
          image.bindId(inserted.id);
        } else {
          await tx
            .update(productImages)
            .set({
              altTr: image.altTr,
              altEn: image.altEn,
              sortOrder: image.sortOrder,
            })
            .where(eq(productImages.id, image.id));
        }
      }
    });
  }

  async delete(product: Product): Promise<void> {
    await this.db.delete(products).where(eq(products.id, product.persistedId));
  }

  async isSlugTaken(locale: Locale, slug: string, excludeProductId?: number): Promise<boolean> {
    const conditions = [
      eq(productTranslations.locale, locale),
      eq(productTranslations.slug, slug),
    ];
    if (excludeProductId !== undefined) {
      conditions.push(ne(productTranslations.productId, excludeProductId));
    }
    const [row] = await this.db
      .select({ id: productTranslations.id })
      .from(productTranslations)
      .where(and(...conditions))
      .limit(1);
    return row !== undefined;
  }
}
