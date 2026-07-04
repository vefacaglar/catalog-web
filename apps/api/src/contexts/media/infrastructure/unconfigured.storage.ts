import { ServiceUnavailableError } from '../../../shared/domain/errors.js';
import type { ImageStorage, StoredImage } from '../domain/image-storage.js';

const MESSAGE =
  'Görsel depolama yapılandırılmamış. IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY ve IMAGEKIT_URL_ENDPOINT ortam değişkenlerini ayarlayın.';

/** ImageKit anahtarları girilmeden upload denenirse anlaşılır bir 503 döner. */
export class UnconfiguredStorage implements ImageStorage {
  upload(): Promise<StoredImage> {
    return Promise.reject(new ServiceUnavailableError(MESSAGE));
  }

  delete(): Promise<void> {
    return Promise.reject(new ServiceUnavailableError(MESSAGE));
  }
}
