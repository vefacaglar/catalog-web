import type { ProductList, ProductListQuery } from '@catalog/contracts';

import type { UseCase } from '../../../../shared/application/use-case.js';
import type { CatalogQueryService } from '../ports/catalog-query-service.js';

export class ListProducts implements UseCase<ProductListQuery, ProductList> {
  constructor(private readonly queryService: CatalogQueryService) {}

  execute(query: ProductListQuery): Promise<ProductList> {
    return this.queryService.listProducts(query);
  }
}
