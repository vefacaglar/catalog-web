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
