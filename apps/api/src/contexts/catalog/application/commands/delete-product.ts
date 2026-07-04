import type { DomainEventDispatcher } from '../../../../shared/application/domain-event-dispatcher.js';
import type { UseCase } from '../../../../shared/application/use-case.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import type { ProductRepository } from '../../domain/product/product-repository.js';

export class DeleteProduct implements UseCase<{ productId: number }, void> {
  constructor(
    private readonly products: ProductRepository,
    private readonly events: DomainEventDispatcher,
  ) {}

  async execute({ productId }: { productId: number }): Promise<void> {
    const product = await this.products.findById(productId);
    if (!product) {
      throw new NotFoundError(`Product not found: ${productId}`);
    }
    product.markDeleted();
    await this.products.delete(product);
    await this.events.dispatch(product.pullDomainEvents());
  }
}
