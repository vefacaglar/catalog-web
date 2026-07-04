import {
  adminCategoryListSchema,
  adminCategorySchema,
  adminProductListSchema,
  adminProductSchema,
  currentUserSchema,
  type AdminCategory,
  type AdminProduct,
  type CategoryUpsertInput,
  type CurrentUser,
  type LoginInput,
  type ProductUpsertInput,
} from '@catalog/contracts';
import { z, type ZodType } from 'zod';

/**
 * Admin UI'ın tarayıcıdan Fastify'a doğrudan eriştiği istemci.
 * Oturum httpOnly cookie'de olduğu için tüm istekler credentials ile gider.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class AdminApiError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  schema: ZodType<T>,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      body !== null && typeof body === 'object' && 'message' in body
        ? String((body as { message: unknown }).message)
        : `İstek başarısız (${res.status})`;
    throw new AdminApiError(res.status, message);
  }
  return schema.parse(body);
}

const successSchema = z.object({ success: z.boolean() });

// --- Auth ---
export const login = (input: LoginInput): Promise<CurrentUser> =>
  request('/auth/login', currentUserSchema, { method: 'POST', body: JSON.stringify(input) });

export const logout = (): Promise<{ success: boolean }> =>
  request('/auth/logout', successSchema, { method: 'POST' });

export const getMe = (): Promise<CurrentUser> => request('/auth/me', currentUserSchema);

// --- Kategoriler ---
export const listCategories = (): Promise<AdminCategory[]> =>
  request('/admin/categories', adminCategoryListSchema);

export const createCategory = (input: CategoryUpsertInput): Promise<AdminCategory> =>
  request('/admin/categories', adminCategorySchema, {
    method: 'POST',
    body: JSON.stringify(input),
  });

export const updateCategory = (id: number, input: CategoryUpsertInput): Promise<AdminCategory> =>
  request(`/admin/categories/${id}`, adminCategorySchema, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });

export const deleteCategory = (id: number): Promise<{ success: boolean }> =>
  request(`/admin/categories/${id}`, successSchema, { method: 'DELETE' });

// --- Ürünler ---
export const listProducts = (params: { page?: number; search?: string } = {}) => {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.search) qs.set('search', params.search);
  const suffix = qs.toString() ? `?${qs}` : '';
  return request(`/admin/products${suffix}`, adminProductListSchema);
};

export const getProduct = (id: number): Promise<AdminProduct> =>
  request(`/admin/products/${id}`, adminProductSchema);

export const createProduct = (input: ProductUpsertInput): Promise<AdminProduct> =>
  request('/admin/products', adminProductSchema, {
    method: 'POST',
    body: JSON.stringify(input),
  });

export const updateProduct = (id: number, input: ProductUpsertInput): Promise<AdminProduct> =>
  request(`/admin/products/${id}`, adminProductSchema, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });

export const deleteProduct = (id: number): Promise<{ success: boolean }> =>
  request(`/admin/products/${id}`, successSchema, { method: 'DELETE' });
