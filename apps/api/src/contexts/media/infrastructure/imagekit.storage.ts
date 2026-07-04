import ImageKit from 'imagekit';

import type { ImageStorage, StoredImage } from '../domain/image-storage.js';

export interface ImageKitConfig {
  publicKey: string;
  privateKey: string;
  urlEndpoint: string;
}

/** ImageKit SDK adapter'ı — sağlayıcıya dokunan tek dosya. */
export class ImageKitStorage implements ImageStorage {
  private readonly client: ImageKit;

  constructor(config: ImageKitConfig) {
    this.client = new ImageKit({
      publicKey: config.publicKey,
      privateKey: config.privateKey,
      urlEndpoint: config.urlEndpoint,
    });
  }

  async upload(
    buffer: Buffer,
    options: { fileName: string; folder: string },
  ): Promise<StoredImage> {
    const result = await this.client.upload({
      file: buffer,
      fileName: options.fileName,
      folder: options.folder,
      useUniqueFileName: true,
    });
    return {
      filePath: result.filePath,
      externalId: result.fileId,
      url: result.url,
      width: result.width ?? null,
      height: result.height ?? null,
    };
  }

  async delete(externalId: string): Promise<void> {
    await this.client.deleteFile(externalId);
  }
}
