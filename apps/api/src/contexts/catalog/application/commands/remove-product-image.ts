import type { DomainEventDispatcher } from '../../../../shared/application/domain-event-dispatcher.js';
import type { UseCase } from '../../../../shared/application/use-case.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import type { ProductRepository } from '../../domain/product/product-repository.js';

export interface RemoveProductImageInput {
  productId: number;
  imageId: number;
}

export class RemoveProductImage implements UseCase<RemoveProductImageInput, void> {
  constructor(
    private readonly products: ProductRepository,
    private readonly events: DomainEventDispatcher,
  ) {}

  async execute({ productId, imageId }: RemoveProductImageInput): Promise<void> {
    const product = await this.products.findById(productId);
    if (!product) {
      throw new NotFoundError(`Ürün bulunamadı: ${productId}`);
    }
    product.removeImage(imageId);
    await this.products.save(product);
    // Commit sonrası: media context ProductImageRemoved ile sağlayıcıdan siler
    await this.events.dispatch(product.pullDomainEvents());
  }
}
