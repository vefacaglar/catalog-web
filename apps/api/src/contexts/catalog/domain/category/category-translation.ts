import { ValidationError } from '../../../../shared/domain/errors.js';
import type { Slug } from '../shared/slug.js';

interface CategoryTranslationProps {
  name: string;
  slug: Slug;
  description: string | null;
}

export class CategoryTranslation {
  readonly name: string;
  readonly slug: Slug;
  readonly description: string | null;

  constructor(props: CategoryTranslationProps) {
    if (!props.name.trim()) {
      throw new ValidationError('Category name cannot be empty');
    }
    this.name = props.name.trim();
    this.slug = props.slug;
    this.description = props.description;
  }
}
