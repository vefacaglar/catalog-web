import type { schema } from '@catalog/db';

import { Product } from '../domain/product/product.js';
import { ProductImage } from '../domain/product/product-image.js';
import { ProductTranslation } from '../domain/product/product-translation.js';
import { Slug } from '../domain/shared/slug.js';
import { TranslationSet } from '../domain/shared/translation-set.js';

type ProductRow = typeof schema.products.$inferSelect;
type TranslationRow = typeof schema.productTranslations.$inferSelect;
type ImageRow = typeof schema.productImages.$inferSelect;

export function toProductAggregate(
  row: ProductRow,
  translationRows: TranslationRow[],
  imageRows: ImageRow[],
): Product {
  const tr = translationRows.find((t) => t.locale === 'tr');
  const en = translationRows.find((t) => t.locale === 'en');
  if (!tr || !en) {
    throw new Error(`Ürün ${row.id} için TR/EN çeviri satırları eksik`);
  }

  return Product.reconstitute(row.id, {
    categoryId: row.categoryId,
    sku: row.sku,
    isActive: row.isActive,
    isFeatured: row.isFeatured,
    sortOrder: row.sortOrder,
    translations: TranslationSet.create({
      tr: toTranslation(tr),
      en: toTranslation(en),
    }),
    images: imageRows.map((img) =>
      ProductImage.reconstitute(img.id, {
        filePath: img.filePath,
        externalId: img.externalId,
        altTr: img.altTr,
        altEn: img.altEn,
        sortOrder: img.sortOrder,
        width: img.width,
        height: img.height,
      }),
    ),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

function toTranslation(row: TranslationRow): ProductTranslation {
  return new ProductTranslation({
    name: row.name,
    slug: Slug.create(row.slug),
    description: row.description,
  });
}
