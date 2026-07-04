import {
  adminCategoryListSchema,
  adminCategorySchema,
  adminProductImageSchema,
  adminProductListQuerySchema,
  adminProductListSchema,
  adminProductSchema,
  categoryUpsertSchema,
  imageAltUpdateSchema,
  imageReorderSchema,
  productUpsertSchema,
} from '@catalog/contracts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { NotFoundError, ValidationError } from '../../../shared/domain/errors.js';
import type { AddProductImage } from '../application/commands/add-product-image.js';
import type { CreateCategory } from '../application/commands/create-category.js';
import type { CreateProduct } from '../application/commands/create-product.js';
import type { DeleteCategory } from '../application/commands/delete-category.js';
import type { DeleteProduct } from '../application/commands/delete-product.js';
import type { RemoveProductImage } from '../application/commands/remove-product-image.js';
import type { ReorderProductImages } from '../application/commands/reorder-product-images.js';
import type { UpdateCategory } from '../application/commands/update-category.js';
import type { UpdateImageAlt } from '../application/commands/update-image-alt.js';
import type { UpdateProduct } from '../application/commands/update-product.js';
import type { CatalogQueryService } from '../application/ports/catalog-query-service.js';

const idParamSchema = z.object({ id: z.coerce.number().int().positive() });
const imageParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  imageId: z.coerce.number().int().positive(),
});
const successSchema = z.object({ success: z.boolean() });

export interface AdminRoutesDeps {
  queryService: CatalogQueryService;
  createProduct: CreateProduct;
  updateProduct: UpdateProduct;
  deleteProduct: DeleteProduct;
  createCategory: CreateCategory;
  updateCategory: UpdateCategory;
  deleteCategory: DeleteCategory;
  addProductImage: AddProductImage;
  removeProductImage: RemoveProductImage;
  reorderProductImages: ReorderProductImages;
  updateImageAlt: UpdateImageAlt;
}

export function buildAdminRoutes(deps: AdminRoutesDeps): FastifyPluginAsyncZod {
  return async (app) => {
    app.addHook('onRequest', app.requireRole('admin'));

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
        if (!product) throw new NotFoundError(`Product not found: ${request.params.id}`);
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

    app.post(
      '/products/:id/images',
      {
        schema: {
          params: idParamSchema,
          response: { 201: adminProductImageSchema },
        },
      },
      async (request, reply) => {
        const file = await request.file();
        if (!file) {
          throw new ValidationError('No file found — a multipart "file" field is required');
        }
        const buffer = await file.toBuffer();
        const created = await deps.addProductImage.execute({
          productId: request.params.id,
          buffer,
          fileName: file.filename,
          mimeType: file.mimetype,
        });
        return reply.status(201).send(created);
      },
    );

    app.patch(
      '/products/:id/images/order',
      {
        schema: {
          params: idParamSchema,
          body: imageReorderSchema,
          response: { 200: successSchema },
        },
      },
      async (request) => {
        await deps.reorderProductImages.execute({
          productId: request.params.id,
          imageIds: request.body.imageIds,
        });
        return { success: true };
      },
    );

    app.patch(
      '/products/:id/images/:imageId/alt',
      {
        schema: {
          params: imageParamSchema,
          body: imageAltUpdateSchema,
          response: { 200: successSchema },
        },
      },
      async (request) => {
        await deps.updateImageAlt.execute({
          productId: request.params.id,
          imageId: request.params.imageId,
          altTr: request.body.altTr ?? null,
          altEn: request.body.altEn ?? null,
        });
        return { success: true };
      },
    );

    app.delete(
      '/products/:id/images/:imageId',
      { schema: { params: imageParamSchema, response: { 200: successSchema } } },
      async (request) => {
        await deps.removeProductImage.execute({
          productId: request.params.id,
          imageId: request.params.imageId,
        });
        return { success: true };
      },
    );
  };
}
