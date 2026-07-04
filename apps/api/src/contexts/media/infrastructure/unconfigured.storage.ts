import { ServiceUnavailableError } from '../../../shared/domain/errors.js';
import type { ImageStorage, StoredImage } from '../domain/image-storage.js';

const MESSAGE =
  'Image storage is not configured. Set the IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT environment variables.';

export class UnconfiguredStorage implements ImageStorage {
  upload(): Promise<StoredImage> {
    return Promise.reject(new ServiceUnavailableError(MESSAGE));
  }

  delete(): Promise<void> {
    return Promise.reject(new ServiceUnavailableError(MESSAGE));
  }
}
