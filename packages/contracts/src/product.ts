import { z } from 'zod';

import { localeSchema, paginatedSchema, paginationQuerySchema } from './common';
import { adminProductImageSchema, productImageSchema } from './image';

const categoryRefSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  slug: z.string(),
});

export const productListItemSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  slug: z.string(),
  sku: z.string().nullable(),
  isFeatured: z.boolean(),
  category: categoryRefSchema,
  coverImage: productImageSchema.nullable(),
});
export type ProductListItem = z.infer<typeof productListItemSchema>;

export const productListQuerySchema = paginationQuerySchema.extend({
  locale: localeSchema,
  category: z.string().optional(),
  search: z.string().max(200).optional(),
  featured: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});
export type ProductListQuery = z.infer<typeof productListQuerySchema>;

export const productListSchema = paginatedSchema(productListItemSchema);
export type ProductList = z.infer<typeof productListSchema>;

export const productDetailSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  sku: z.string().nullable(),
  isFeatured: z.boolean(),
  category: categoryRefSchema,
  breadcrumb: z.array(categoryRefSchema),
  images: z.array(productImageSchema),
  // Locale switcher için: her iki dildeki slug'lar
  slugs: z.partialRecord(localeSchema, z.string()),
});
export type ProductDetail = z.infer<typeof productDetailSchema>;

export const productDetailQuerySchema = z.object({
  locale: localeSchema,
});

const productTranslationInputSchema = z.object({
  name: z.string().min(1).max(200),
  // Boş bırakılırsa isimden üretilir
  slug: z.string().max(200).optional(),
  description: z.string().max(20000).nullable().optional(),
});

export const productUpsertSchema = z.object({
  categoryId: z.number().int(),
  sku: z.string().max(100).nullable().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  translations: z.object({
    tr: productTranslationInputSchema,
    en: productTranslationInputSchema,
  }),
});
export type ProductUpsertInput = z.infer<typeof productUpsertSchema>;

export const adminProductSchema = z.object({
  id: z.number().int(),
  categoryId: z.number().int(),
  sku: z.string().nullable(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  sortOrder: z.number().int(),
  translations: z.object({
    tr: z.object({
      name: z.string(),
      slug: z.string(),
      description: z.string().nullable(),
    }),
    en: z.object({
      name: z.string(),
      slug: z.string(),
      description: z.string().nullable(),
    }),
  }),
  images: z.array(adminProductImageSchema),
});
export type AdminProduct = z.infer<typeof adminProductSchema>;

export const adminProductListQuerySchema = paginationQuerySchema.extend({
  search: z.string().max(200).optional(),
});

export const adminProductListSchema = paginatedSchema(adminProductSchema);
