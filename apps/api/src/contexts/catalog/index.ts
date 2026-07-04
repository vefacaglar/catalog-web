import type { FastifyInstance } from 'fastify';

import { CreateCategory } from './application/commands/create-category.js';
import { CreateProduct } from './application/commands/create-product.js';
import { DeleteCategory } from './application/commands/delete-category.js';
import { DeleteProduct } from './application/commands/delete-product.js';
import { UpdateCategory } from './application/commands/update-category.js';
import { UpdateProduct } from './application/commands/update-product.js';
import { GetCategoryTree } from './application/queries/get-category-tree.js';
import { GetProductBySlug } from './application/queries/get-product-by-slug.js';
import { ListProducts } from './application/queries/list-products.js';
import { DrizzleCatalogQueryService } from './infrastructure/drizzle-catalog.query-service.js';
import { DrizzleCategoryRepository } from './infrastructure/drizzle-category.repository.js';
import { DrizzleProductRepository } from './infrastructure/drizzle-product.repository.js';
import { buildAdminRoutes } from './presentation/admin.routes.js';
import { buildPublicRoutes } from './presentation/public.routes.js';

/**
 * Catalog bounded context composition root'u.
 * Bağımlılıklar burada kurulur; route'lar yalnızca application katmanını görür.
 */
export async function registerCatalogContext(app: FastifyInstance): Promise<void> {
  const queryService = new DrizzleCatalogQueryService(app.db);
  const products = new DrizzleProductRepository(app.db);
  const categories = new DrizzleCategoryRepository(app.db);
  const events = app.events;

  await app.register(
    buildPublicRoutes({
      listProducts: new ListProducts(queryService),
      getProductBySlug: new GetProductBySlug(queryService),
      getCategoryTree: new GetCategoryTree(queryService),
    }),
  );

  await app.register(
    buildAdminRoutes({
      queryService,
      createProduct: new CreateProduct(products, categories, queryService, events),
      updateProduct: new UpdateProduct(products, categories, queryService, events),
      deleteProduct: new DeleteProduct(products, events),
      createCategory: new CreateCategory(categories, queryService, events),
      updateCategory: new UpdateCategory(categories, queryService, events),
      deleteCategory: new DeleteCategory(categories, events),
    }),
    { prefix: '/admin' },
  );
}
