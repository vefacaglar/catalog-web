import type { FastifyInstance } from 'fastify';

import type { AppConfig } from '../../config.js';
import type { ImageStorage } from './domain/image-storage.js';
import { ImageKitStorage } from './infrastructure/imagekit.storage.js';
import { UnconfiguredStorage } from './infrastructure/unconfigured.storage.js';

export function createImageStorage(config: AppConfig, app: FastifyInstance): ImageStorage {
  if (config.IMAGEKIT_PUBLIC_KEY && config.IMAGEKIT_PRIVATE_KEY && config.IMAGEKIT_URL_ENDPOINT) {
    return new ImageKitStorage({
      publicKey: config.IMAGEKIT_PUBLIC_KEY,
      privateKey: config.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: config.IMAGEKIT_URL_ENDPOINT,
    });
  }
  app.log.warn('ImageKit is not configured — image uploads are disabled (endpoint returns 503)');
  return new UnconfiguredStorage();
}

export function registerMediaContext(app: FastifyInstance, storage: ImageStorage): void {
  app.events.subscribe('catalog.product.image-removed', async (event) => {
    const { externalId } = event as { externalId?: string | null };
    if (externalId) {
      await storage.delete(externalId);
    }
  });

  app.events.subscribe('catalog.product.deleted', async (event) => {
    const { imageExternalIds } = event as { imageExternalIds?: string[] };
    for (const externalId of imageExternalIds ?? []) {
      await storage.delete(externalId);
    }
  });
}
