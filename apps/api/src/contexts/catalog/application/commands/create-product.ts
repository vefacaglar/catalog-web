import type { AdminProduct, ProductUpsertInput } from '@catalog/contracts';

import type { DomainEventDispatcher } from '../../../../shared/application/domain-event-dispatcher.js';
import type { UseCase } from '../../../../shared/application/use-case.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import type { CategoryRepository } from '../../domain/category/category-repository.js';
import { Product } from '../../domain/product/product.js';
import type { ProductRepository } from '../../domain/product/product-repository.js';
import type { CatalogQueryService } from '../ports/catalog-query-service.js';
import { buildProductTranslations } from '../services/build-translations.js';

export class CreateProduct implements UseCase<ProductUpsertInput, AdminProduct> {
  constructor(
    private readonly products: ProductRepository,
    private readonly categories: CategoryRepository,
    private readonly queryService: CatalogQueryService,
    private readonly events: DomainEventDispatcher,
  ) {}

  async execute(input: ProductUpsertInput): Promise<AdminProduct> {
    const category = await this.categories.findById(input.categoryId);
    if (!category) {
      throw new NotFoundError(`Category not found: ${input.categoryId}`);
    }

    const translations = await buildProductTranslations(input.translations, this.products);
    const product = Product.create({
      categoryId: input.categoryId,
      sku: input.sku ?? null,
      isActive: input.isActive,
      isAvailable: input.isAvailable,
      isFeatured: input.isFeatured,
      sortOrder: input.sortOrder,
      translations,
    });

    await this.products.save(product);
    await this.events.dispatch(product.pullDomainEvents());

    const dto = await this.queryService.getAdminProduct(product.persistedId);
    if (!dto) throw new Error('Product was created but could not be read back');
    return dto;
  }
}
