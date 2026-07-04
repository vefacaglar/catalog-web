import {
  adminCategoryListSchema,
  adminCategorySchema,
  adminProductListQuerySchema,
  adminProductListSchema,
  adminProductSchema,
  categoryUpsertSchema,
  productUpsertSchema,
} from '@catalog/contracts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { NotFoundError } from '../../../shared/domain/errors.js';
import type { CreateCategory } from '../application/commands/create-category.js';
import type { CreateProduct } from '../application/commands/create-product.js';
import type { DeleteCategory } from '../application/commands/delete-category.js';
import type { DeleteProduct } from '../application/commands/delete-product.js';
import type { UpdateCategory } from '../application/commands/update-category.js';
import type { UpdateProduct } from '../application/commands/update-product.js';
import type { CatalogQueryService } from '../application/ports/catalog-query-service.js';

const idParamSchema = z.object({ id: z.coerce.number().int().positive() });
const successSchema = z.object({ success: z.boolean() });

export interface AdminRoutesDeps {
  queryService: CatalogQueryService;
  createProduct: CreateProduct;
  updateProduct: UpdateProduct;
  deleteProduct: DeleteProduct;
  createCategory: CreateCategory;
  updateCategory: UpdateCategory;
  deleteCategory: DeleteCategory;
}

export function buildAdminRoutes(deps: AdminRoutesDeps): FastifyPluginAsyncZod {
  return async (app) => {
    // Tüm admin route'ları role=admin ister
    app.addHook('onRequest', app.requireRole('admin'));

    // --- Kategoriler ---
    app.get(
      '/categories',
      { schema: { response: { 200: adminCategoryListSchema } } },
      async () => deps.queryService.listAdminCategories(),
    );

    app.post(
      '/categories',
      { schema: { body: categoryUpsertSchema, response: { 201: adminCategorySchema } } },
      async (request, reply) => {
        const created = await deps.createCategory.execute(request.body);
        return reply.status(201).send(created);
      },
    );

    app.patch(
      '/categories/:id',
      {
        schema: {
          params: idParamSchema,
          body: categoryUpsertSchema,
          response: { 200: adminCategorySchema },
        },
      },
      async (request) =>
        deps.updateCategory.execute({ ...request.body, categoryId: request.params.id }),
    );

    app.delete(
      '/categories/:id',
      { schema: { params: idParamSchema, response: { 200: successSchema } } },
      async (request) => {
        await deps.deleteCategory.execute({ categoryId: request.params.id });
        return { success: true };
      },
    );

    // --- Ürünler ---
    app.get(
      '/products',
      {
        schema: {
          querystring: adminProductListQuerySchema,
          response: { 200: adminProductListSchema },
        },
      },
      async (request) => {
        const { page, pageSize, search } = request.query;
        const { items, total } = await deps.queryService.listAdminProducts({
          page,
          pageSize,
          search,
        });
        return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
      },
    );

    app.get(
      '/products/:id',
      { schema: { params: idParamSchema, response: { 200: adminProductSchema } } },
      async (request) => {
        const product = await deps.queryService.getAdminProduct(request.params.id);
        if (!product) throw new NotFoundError(`Ürün bulunamadı: ${request.params.id}`);
        return product;
      },
    );

    app.post(
      '/products',
      { schema: { body: productUpsertSchema, response: { 201: adminProductSchema } } },
      async (request, reply) => {
        const created = await deps.createProduct.execute(request.body);
        return reply.status(201).send(created);
      },
    );

    app.patch(
      '/products/:id',
      {
        schema: {
          params: idParamSchema,
          body: productUpsertSchema,
          response: { 200: adminProductSchema },
        },
      },
      async (request) =>
        deps.updateProduct.execute({ ...request.body, productId: request.params.id }),
    );

    app.delete(
      '/products/:id',
      { schema: { params: idParamSchema, response: { 200: successSchema } } },
      async (request) => {
        await deps.deleteProduct.execute({ productId: request.params.id });
        return { success: true };
      },
    );
  };
}
