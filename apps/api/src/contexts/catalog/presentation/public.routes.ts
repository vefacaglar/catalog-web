import {
  categoryTreeQuerySchema,
  categoryTreeSchema,
  productDetailQuerySchema,
  productDetailSchema,
  productListQuerySchema,
  productListSchema,
} from '@catalog/contracts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

import type { GetCategoryTree } from '../application/queries/get-category-tree.js';
import type { GetProductBySlug } from '../application/queries/get-product-by-slug.js';
import type { ListProducts } from '../application/queries/list-products.js';

export interface PublicRoutesDeps {
  listProducts: ListProducts;
  getProductBySlug: GetProductBySlug;
  getCategoryTree: GetCategoryTree;
}

export function buildPublicRoutes(deps: PublicRoutesDeps): FastifyPluginAsyncZod {
  return async (app) => {
    app.get(
      '/products',
      {
        schema: {
          querystring: productListQuerySchema,
          response: { 200: productListSchema },
        },
      },
      async (request) => deps.listProducts.execute(request.query),
    );

    app.get(
      '/products/:slug',
      {
        schema: {
          params: z.object({ slug: z.string() }),
          querystring: productDetailQuerySchema,
          response: { 200: productDetailSchema },
        },
      },
      async (request) =>
        deps.getProductBySlug.execute({
          locale: request.query.locale,
          slug: request.params.slug,
        }),
    );

    app.get(
      '/categories',
      {
        schema: {
          querystring: categoryTreeQuerySchema,
          response: { 200: categoryTreeSchema },
        },
      },
      async (request) => deps.getCategoryTree.execute({ locale: request.query.locale }),
    );
  };
}
