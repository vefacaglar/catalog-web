import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';

import { localeEnum } from './enums.js';

export const categories = pgTable('categories', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  parentId: integer('parent_id').references((): AnyPgColumn => categories.id),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const categoryTranslations = pgTable(
  'category_translations',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    locale: localeEnum('locale').notNull(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
  },
  (table) => [
    uniqueIndex('category_translations_category_locale_uq').on(table.categoryId, table.locale),
    uniqueIndex('category_translations_locale_slug_uq').on(table.locale, table.slug),
  ],
);
