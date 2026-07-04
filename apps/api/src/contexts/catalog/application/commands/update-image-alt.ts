import type { DomainEventDispatcher } from '../../../../shared/application/domain-event-dispatcher.js';
import type { UseCase } from '../../../../shared/application/use-case.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import type { ProductRepository } from '../../domain/product/product-repository.js';

export interface UpdateImageAltInput {
  productId: number;
  imageId: number;
  altTr: string | null;
  altEn: string | null;
}

export class UpdateImageAlt implements UseCase<UpdateImageAltInput, void> {
  constructor(
    private readonly products: ProductRepository,
    private readonly events: DomainEventDispatcher,
  ) {}

  async execute({ productId, imageId, altTr, altEn }: UpdateImageAltInput): Promise<void> {
    const product = await this.products.findById(productId);
    if (!product) {
      throw new NotFoundError(`Product not found: ${productId}`);
    }
    product.updateImageAlt(imageId, altTr, altEn);
    await this.products.save(product);
    await this.events.dispatch(product.pullDomainEvents());
  }
}
