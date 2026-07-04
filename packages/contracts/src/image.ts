import { z } from 'zod';

export const productImageSchema = z.object({
  id: z.number().int(),
  filePath: z.string(),
  alt: z.string().nullable(),
  sortOrder: z.number().int(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
});
export type ProductImageDto = z.infer<typeof productImageSchema>;

export const adminProductImageSchema = z.object({
  id: z.number().int(),
  filePath: z.string(),
  altTr: z.string().nullable(),
  altEn: z.string().nullable(),
  sortOrder: z.number().int(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
});
export type AdminProductImage = z.infer<typeof adminProductImageSchema>;

export const imageReorderSchema = z.object({
  imageIds: z.array(z.number().int()).min(1),
});
export type ImageReorderInput = z.infer<typeof imageReorderSchema>;

export const imageAltUpdateSchema = z.object({
  altTr: z.string().max(300).nullable().optional(),
  altEn: z.string().max(300).nullable().optional(),
});
