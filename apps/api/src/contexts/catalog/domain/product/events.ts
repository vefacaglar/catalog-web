import { BaseDomainEvent } from '../../../../shared/domain/domain-event.js';
import type { Product } from './product.js';
import type { ProductImage } from './product-image.js';

export class ProductCreated extends BaseDomainEvent {
  static readonly eventName = 'catalog.product.created';
  readonly name = ProductCreated.eventName;

  constructor(readonly product: Product) {
    super();
  }
}

export class ProductUpdated extends BaseDomainEvent {
  static readonly eventName = 'catalog.product.updated';
  readonly name = ProductUpdated.eventName;

  constructor(readonly product: Product) {
    super();
  }
}

export class ProductDeleted extends BaseDomainEvent {
  static readonly eventName = 'catalog.product.deleted';
  readonly name = ProductDeleted.eventName;

  constructor(
    readonly productId: number,
    readonly imageExternalIds: string[],
  ) {
    super();
  }
}

export class ProductImageAdded extends BaseDomainEvent {
  static readonly eventName = 'catalog.product.image-added';
  readonly name = ProductImageAdded.eventName;

  constructor(
    readonly product: Product,
    readonly image: ProductImage,
  ) {
    super();
  }
}

export class ProductImageRemoved extends BaseDomainEvent {
  static readonly eventName = 'catalog.product.image-removed';
  readonly name = ProductImageRemoved.eventName;

  constructor(
    readonly product: Product,
    readonly externalId: string | null,
  ) {
    super();
  }
}
