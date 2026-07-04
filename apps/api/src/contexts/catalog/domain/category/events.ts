import { BaseDomainEvent } from '../../../../shared/domain/domain-event.js';
import type { Category } from './category.js';

export class CategoryCreated extends BaseDomainEvent {
  static readonly eventName = 'catalog.category.created';
  readonly name = CategoryCreated.eventName;

  constructor(readonly category: Category) {
    super();
  }
}

export class CategoryUpdated extends BaseDomainEvent {
  static readonly eventName = 'catalog.category.updated';
  readonly name = CategoryUpdated.eventName;

  constructor(readonly category: Category) {
    super();
  }
}

export class CategoryDeleted extends BaseDomainEvent {
  static readonly eventName = 'catalog.category.deleted';
  readonly name = CategoryDeleted.eventName;

  constructor(readonly categoryId: number) {
    super();
  }
}
