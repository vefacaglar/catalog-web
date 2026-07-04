import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { products } from './products.js';

export const productImages = pgTable(
  'product_images',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    filePath: text('file_path').notNull(),
    externalId: text('external_id'),
    altTr: text('alt_tr'),
    altEn: text('alt_en'),
    sortOrder: integer('sort_order').notNull().default(0),
    width: integer('width'),
    height: integer('height'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('product_images_product_sort_idx').on(table.productId, table.sortOrder)],
);
