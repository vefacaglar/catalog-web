import type { DomainEventDispatcher } from '../../../../shared/application/domain-event-dispatcher.js';
import type { UseCase } from '../../../../shared/application/use-case.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import type { ProductRepository } from '../../domain/product/product-repository.js';

export interface ReorderProductImagesInput {
  productId: number;
  imageIds: number[];
}

export class ReorderProductImages implements UseCase<ReorderProductImagesInput, void> {
  constructor(
    private readonly products: ProductRepository,
    private readonly events: DomainEventDispatcher,
  ) {}

  async execute({ productId, imageIds }: ReorderProductImagesInput): Promise<void> {
    const product = await this.products.findById(productId);
    if (!product) {
      throw new NotFoundError(`Ürün bulunamadı: ${productId}`);
    }
    product.reorderImages(imageIds);
    await this.products.save(product);
    await this.events.dispatch(product.pullDomainEvents());
  }
}
