import type { Locale } from '../shared/locale.js';
import type { Product } from './product.js';

export interface ProductRepository {
  findById(id: number): Promise<Product | null>;
  save(product: Product): Promise<void>;
  delete(product: Product): Promise<void>;
  isSlugTaken(locale: Locale, slug: string, excludeProductId?: number): Promise<boolean>;
}
