/**
 * Media context'ine açılan kapı. Catalog, depolama sağlayıcısını bilmez;
 * bu portun implementasyonu media context'i tarafından sağlanır.
 */
export interface UploadedImage {
  filePath: string;
  externalId: string;
  url: string;
  width: number | null;
  height: number | null;
}

export interface ImageStoragePort {
  upload(buffer: Buffer, options: { fileName: string; folder: string }): Promise<UploadedImage>;
  delete(externalId: string): Promise<void>;
}
