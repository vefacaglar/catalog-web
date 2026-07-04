import { ValidationError } from '../../../../shared/domain/errors.js';
import type { Slug } from '../shared/slug.js';

interface ProductTranslationProps {
  name: string;
  slug: Slug;
  description: string | null;
}

export class ProductTranslation {
  readonly name: string;
  readonly slug: Slug;
  readonly description: string | null;

  constructor(props: ProductTranslationProps) {
    if (!props.name.trim()) {
      throw new ValidationError('Ürün adı boş olamaz');
    }
    this.name = props.name.trim();
    this.slug = props.slug;
    this.description = props.description;
  }
}
