import { AggregateRoot } from '../../../../shared/domain/aggregate-root.js';
import { ValidationError } from '../../../../shared/domain/errors.js';
import type { TranslationSet } from '../shared/translation-set.js';
import type { CategoryTranslation } from './category-translation.js';
import { CategoryCreated, CategoryDeleted, CategoryUpdated } from './events.js';

export interface CategoryProps {
  parentId: number | null;
  sortOrder: number;
  isActive: boolean;
  translations: TranslationSet<CategoryTranslation>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryDetailsInput {
  parentId: number | null;
  sortOrder: number;
  isActive: boolean;
  translations: TranslationSet<CategoryTranslation>;
}

export class Category extends AggregateRoot {
  parentId: number | null;
  sortOrder: number;
  isActive: boolean;
  translations: TranslationSet<CategoryTranslation>;
  readonly createdAt: Date;
  updatedAt: Date;

  private constructor(id: number | null, props: CategoryProps) {
    super(id);
    this.parentId = props.parentId;
    this.sortOrder = props.sortOrder;
    this.isActive = props.isActive;
    this.translations = props.translations;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(input: CategoryDetailsInput): Category {
    const now = new Date();
    const category = new Category(null, { ...input, createdAt: now, updatedAt: now });
    category.record(new CategoryCreated(category));
    return category;
  }

  static reconstitute(id: number, props: CategoryProps): Category {
    return new Category(id, props);
  }

  updateDetails(input: CategoryDetailsInput): void {
    if (input.parentId !== null && this.id !== null && input.parentId === this.id) {
      throw new ValidationError('A category cannot be its own parent');
    }
    this.parentId = input.parentId;
    this.sortOrder = input.sortOrder;
    this.isActive = input.isActive;
    this.translations = input.translations;
    this.updatedAt = new Date();
    this.record(new CategoryUpdated(this));
  }

  markDeleted(): void {
    this.record(new CategoryDeleted(this.persistedId));
  }
}
