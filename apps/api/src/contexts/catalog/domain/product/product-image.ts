import { Entity } from '../../../../shared/domain/entity.js';

export interface ProductImageProps {
  filePath: string;
  externalId: string | null;
  altTr: string | null;
  altEn: string | null;
  sortOrder: number;
  width: number | null;
  height: number | null;
}

export class ProductImage extends Entity {
  filePath: string;
  externalId: string | null;
  altTr: string | null;
  altEn: string | null;
  sortOrder: number;
  width: number | null;
  height: number | null;

  private constructor(id: number | null, props: ProductImageProps) {
    super(id);
    this.filePath = props.filePath;
    this.externalId = props.externalId;
    this.altTr = props.altTr;
    this.altEn = props.altEn;
    this.sortOrder = props.sortOrder;
    this.width = props.width;
    this.height = props.height;
  }

  static createNew(props: Omit<ProductImageProps, 'sortOrder'>, sortOrder: number): ProductImage {
    return new ProductImage(null, { ...props, sortOrder });
  }

  static reconstitute(id: number, props: ProductImageProps): ProductImage {
    return new ProductImage(id, props);
  }
}
