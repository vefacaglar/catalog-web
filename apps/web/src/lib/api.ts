import {
  categoryTreeSchema,
  productDetailSchema,
  productListSchema,
  type CategoryTreeNode,
  type Locale,
  type ProductDetail,
  type ProductList,
} from '@catalog/contracts';
import type { z } from 'zod';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

interface FetchOptions {
  revalidate?: number;
  tags?: string[];
}

class ApiNotFoundError extends Error {}

async function fetchApi<T extends z.ZodType>(
  path: string,
  schema: T,
  { revalidate = 300, tags = [] }: FetchOptions = {},
): Promise<z.infer<T>> {
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    next: { revalidate, tags },
  });
  if (res.status === 404) {
    throw new ApiNotFoundError(path);
  }
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${path}`);
  }
  return schema.parse(await res.json());
}

export interface ProductsQuery {
  locale: Locale;
  category?: string;
  search?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}

export async function getProducts(query: ProductsQuery): Promise<ProductList> {
  const params = new URLSearchParams({ locale: query.locale });
  if (query.category) params.set('category', query.category);
  if (query.search) params.set('search', query.search);
  if (query.featured !== undefined) params.set('featured', String(query.featured));
  if (query.page) params.set('page', String(query.page));
  if (query.pageSize) params.set('pageSize', String(query.pageSize));

  return fetchApi(`/products?${params}`, productListSchema, { tags: ['products'] });
}

export async function getProductBySlug(
  locale: Locale,
  slug: string,
): Promise<ProductDetail | null> {
  try {
    return await fetchApi(`/products/${encodeURIComponent(slug)}?locale=${locale}`, productDetailSchema, {
      tags: ['products'],
    });
  } catch (err) {
    if (err instanceof ApiNotFoundError) return null;
    throw err;
  }
}

export async function getCategoryTree(locale: Locale): Promise<CategoryTreeNode[]> {
  return fetchApi(`/categories?locale=${locale}`, categoryTreeSchema, { tags: ['categories'] });
}
