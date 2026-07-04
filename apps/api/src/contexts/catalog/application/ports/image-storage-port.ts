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
