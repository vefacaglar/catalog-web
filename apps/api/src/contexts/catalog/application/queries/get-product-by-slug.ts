import type { Locale, ProductDetail } from '@catalog/contracts';

import type { UseCase } from '../../../../shared/application/use-case.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import type { CatalogQueryService } from '../ports/catalog-query-service.js';

export interface GetProductBySlugInput {
  locale: Locale;
  slug: string;
}

export class GetProductBySlug implements UseCase<GetProductBySlugInput, ProductDetail> {
  constructor(private readonly queryService: CatalogQueryService) {}

  async execute({ locale, slug }: GetProductBySlugInput): Promise<ProductDetail> {
    const product = await this.queryService.getProductBySlug(locale, slug);
    if (!product) {
      throw new NotFoundError(`Ürün bulunamadı: ${slug}`);
    }
    return product;
  }
}
