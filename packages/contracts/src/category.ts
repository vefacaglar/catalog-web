import { z } from 'zod';

import { localeSchema } from './common';

export interface CategoryTreeNode {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  children: CategoryTreeNode[];
}

export const categoryTreeNodeSchema: z.ZodType<CategoryTreeNode> = z.lazy(() =>
  z.object({
    id: z.number().int(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    sortOrder: z.number().int(),
    children: z.array(categoryTreeNodeSchema),
  }),
);

export const categoryTreeSchema = z.array(categoryTreeNodeSchema);

export const categoryTreeQuerySchema = z.object({
  locale: localeSchema,
});

const categoryTranslationInputSchema = z.object({
  name: z.string().min(1).max(200),
  // Boş bırakılırsa isimden üretilir
  slug: z.string().max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
});

export const categoryUpsertSchema = z.object({
  parentId: z.number().int().nullable().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  translations: z.object({
    tr: categoryTranslationInputSchema,
    en: categoryTranslationInputSchema,
  }),
});
export type CategoryUpsertInput = z.infer<typeof categoryUpsertSchema>;

export const adminCategorySchema = z.object({
  id: z.number().int(),
  parentId: z.number().int().nullable(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
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
});
export type AdminCategory = z.infer<typeof adminCategorySchema>;

export const adminCategoryListSchema = z.array(adminCategorySchema);
