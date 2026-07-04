import { AggregateRoot } from '../../../../shared/domain/aggregate-root.js';
import { NotFoundError, ValidationError } from '../../../../shared/domain/errors.js';
import type { TranslationSet } from '../shared/translation-set.js';
import {
  ProductCreated,
  ProductDeleted,
  ProductImageAdded,
  ProductImageRemoved,
  ProductUpdated,
} from './events.js';
import { ProductImage, type ProductImageProps } from './product-image.js';
import type { ProductTranslation } from './product-translation.js';

export interface ProductProps {
  categoryId: number;
  sku: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  translations: TranslationSet<ProductTranslation>;
  images: ProductImage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDetailsInput {
  categoryId: number;
  sku: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  translations: TranslationSet<ProductTranslation>;
}

export class Product extends AggregateRoot {
  categoryId: number;
  sku: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  translations: TranslationSet<ProductTranslation>;
  private _images: ProductImage[];
  readonly createdAt: Date;
  updatedAt: Date;

  private constructor(id: number | null, props: ProductProps) {
    super(id);
    this.categoryId = props.categoryId;
    this.sku = props.sku;
    this.isActive = props.isActive;
    this.isFeatured = props.isFeatured;
    this.sortOrder = props.sortOrder;
    this.translations = props.translations;
    this._images = [...props.images].sort((a, b) => a.sortOrder - b.sortOrder);
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(input: ProductDetailsInput): Product {
    const now = new Date();
    const product = new Product(null, {
      ...input,
      images: [],
      createdAt: now,
      updatedAt: now,
    });
    product.record(new ProductCreated(product));
    return product;
  }

  static reconstitute(id: number, props: ProductProps): Product {
    return new Product(id, props);
  }

  get images(): readonly ProductImage[] {
    return this._images;
  }

  updateDetails(input: ProductDetailsInput): void {
    this.categoryId = input.categoryId;
    this.sku = input.sku;
    this.isActive = input.isActive;
    this.isFeatured = input.isFeatured;
    this.sortOrder = input.sortOrder;
    this.translations = input.translations;
    this.touch();
    this.record(new ProductUpdated(this));
  }

  addImage(props: Omit<ProductImageProps, 'sortOrder'>): ProductImage {
    const image = ProductImage.createNew(props, this._images.length);
    this._images.push(image);
    this.touch();
    this.record(new ProductImageAdded(this, image));
    return image;
  }

  removeImage(imageId: number): void {
    const image = this._images.find((img) => img.id === imageId);
    if (!image) {
      throw new NotFoundError(`Görsel bulunamadı: ${imageId}`);
    }
    this._images = this._images.filter((img) => img.id !== imageId);
    this.resequenceImages();
    this.touch();
    this.record(new ProductImageRemoved(this, image.externalId));
  }

  /**
   * Görselleri verilen id sırasına göre yeniden dizer.
   * Kapak invariantı: sortOrder 0'daki görsel kapaktır; sıra değişimi kapağı da değiştirir.
   */
  reorderImages(orderedIds: number[]): void {
    const currentIds = this._images.map((img) => img.persistedId);
    const sameSet =
      orderedIds.length === currentIds.length &&
      [...orderedIds].sort((a, b) => a - b).join(',') ===
        [...currentIds].sort((a, b) => a - b).join(',');
    if (!sameSet) {
      throw new ValidationError('Sıralama listesi ürünün mevcut görselleriyle eşleşmiyor');
    }
    this._images.sort(
      (a, b) => orderedIds.indexOf(a.persistedId) - orderedIds.indexOf(b.persistedId),
    );
    this.resequenceImages();
    this.touch();
    this.record(new ProductUpdated(this));
  }

  updateImageAlt(imageId: number, altTr: string | null, altEn: string | null): void {
    const image = this._images.find((img) => img.id === imageId);
    if (!image) {
      throw new NotFoundError(`Görsel bulunamadı: ${imageId}`);
    }
    image.altTr = altTr;
    image.altEn = altEn;
    this.touch();
    this.record(new ProductUpdated(this));
  }

  /** Silme kararının domain kaydı; fiziksel silmeyi repository yapar. */
  markDeleted(): void {
    this.record(
      new ProductDeleted(
        this.persistedId,
        this._images.map((img) => img.externalId).filter((id): id is string => id !== null),
      ),
    );
  }

  private resequenceImages(): void {
    this._images.forEach((img, index) => {
      img.sortOrder = index;
    });
  }

  private touch(): void {
    this.updatedAt = new Date();
  }
}
