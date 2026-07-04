import type { Locale } from '../shared/locale.js';
import type { Category } from './category.js';

export interface CategoryRef {
  id: number;
  parentId: number | null;
}

export interface CategoryRepository {
  findById(id: number): Promise<Category | null>;
  save(category: Category): Promise<void>;
  delete(category: Category): Promise<void>;
  isSlugTaken(locale: Locale, slug: string, excludeCategoryId?: number): Promise<boolean>;
  /** Döngü ve hiyerarşi kontrolleri için hafif referans listesi */
  findAllRefs(): Promise<CategoryRef[]>;
  hasProducts(categoryId: number): Promise<boolean>;
  hasChildren(categoryId: number): Promise<boolean>;
}
