import type {
  AdminCategory,
  AdminProduct,
  CategoryTreeNode,
  Locale,
  ProductDetail,
  ProductList,
  ProductListQuery,
} from '@catalog/contracts';

/**
 * CQRS-lite okuma tarafı: aggregate kurmadan doğrudan DTO döner.
 * Implementasyonu infrastructure katmanındadır.
 */
export interface CatalogQueryService {
  listProducts(query: ProductListQuery): Promise<ProductList>;
  getProductBySlug(locale: Locale, slug: string): Promise<ProductDetail | null>;
  getCategoryTree(locale: Locale): Promise<CategoryTreeNode[]>;
  // Admin okumaları
  listAdminProducts(query: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<{ items: AdminProduct[]; total: number }>;
  getAdminProduct(id: number): Promise<AdminProduct | null>;
  listAdminCategories(): Promise<AdminCategory[]>;
}
