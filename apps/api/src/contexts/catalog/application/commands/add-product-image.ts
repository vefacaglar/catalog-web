import type { AdminProductImage } from '@catalog/contracts';

import type { DomainEventDispatcher } from '../../../../shared/application/domain-event-dispatcher.js';
import type { UseCase } from '../../../../shared/application/use-case.js';
import { NotFoundError, ValidationError } from '../../../../shared/domain/errors.js';
import type { ProductRepository } from '../../domain/product/product-repository.js';
import type { ImageStoragePort } from '../ports/image-storage-port.js';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export interface AddProductImageInput {
  productId: number;
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}

export class AddProductImage implements UseCase<AddProductImageInput, AdminProductImage> {
  constructor(
    private readonly products: ProductRepository,
    private readonly storage: ImageStoragePort,
    private readonly events: DomainEventDispatcher,
  ) {}

  async execute(input: AddProductImageInput): Promise<AdminProductImage> {
    if (!ALLOWED_MIME_TYPES.has(input.mimeType)) {
      throw new ValidationError(
        `Desteklenmeyen dosya türü: ${input.mimeType}. JPEG, PNG, WebP veya AVIF yükleyin`,
      );
    }

    const product = await this.products.findById(input.productId);
    if (!product) {
      throw new NotFoundError(`Ürün bulunamadı: ${input.productId}`);
    }

    // Önce sağlayıcıya yükle; DB satırı upload başarılıysa yazılır.
    const stored = await this.storage.upload(input.buffer, {
      fileName: input.fileName,
      folder: `products/${product.persistedId}`,
    });

    const image = product.addImage({
      filePath: stored.filePath,
      externalId: stored.externalId,
      altTr: null,
      altEn: null,
      width: stored.width,
      height: stored.height,
    });

    await this.products.save(product);
    await this.events.dispatch(product.pullDomainEvents());

    return {
      id: image.persistedId,
      filePath: image.filePath,
      altTr: image.altTr,
      altEn: image.altEn,
      sortOrder: image.sortOrder,
      width: image.width,
      height: image.height,
    };
  }
}
