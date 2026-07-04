import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { categories } from './categories.js';
import { localeEnum } from './enums.js';

export const products = pgTable(
  'products',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    sku: text('sku').unique(),
    isActive: boolean('is_active').notNull().default(true),
    isFeatured: boolean('is_featured').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('products_category_idx').on(table.categoryId),
    index('products_active_featured_idx').on(table.isActive, table.isFeatured),
  ],
);

export const productTranslations = pgTable(
  'product_translations',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    locale: localeEnum('locale').notNull(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
  },
  (table) => [
    uniqueIndex('product_translations_product_locale_uq').on(table.productId, table.locale),
    uniqueIndex('product_translations_locale_slug_uq').on(table.locale, table.slug),
  ],
);
