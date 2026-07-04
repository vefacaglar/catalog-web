/**
 * Depolama soyutlaması — media context'inin çekirdek sözleşmesi.
 * Sağlayıcı (ImageKit, S3, ...) yalnızca infrastructure adapter'larında bilinir.
 * Catalog context'inin ImageStoragePort'u bu arayüzle yapısal olarak uyumludur.
 */
export interface StoredImage {
  filePath: string;
  externalId: string;
  url: string;
  width: number | null;
  height: number | null;
}

export interface ImageStorage {
  upload(buffer: Buffer, options: { fileName: string; folder: string }): Promise<StoredImage>;
  delete(externalId: string): Promise<void>;
}
