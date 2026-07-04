import type { DomainEventDispatcher } from '../../../../shared/application/domain-event-dispatcher.js';
import type { UseCase } from '../../../../shared/application/use-case.js';
import { ConflictError, NotFoundError } from '../../../../shared/domain/errors.js';
import type { CategoryRepository } from '../../domain/category/category-repository.js';

export class DeleteCategory implements UseCase<{ categoryId: number }, void> {
  constructor(
    private readonly categories: CategoryRepository,
    private readonly events: DomainEventDispatcher,
  ) {}

  async execute({ categoryId }: { categoryId: number }): Promise<void> {
    const category = await this.categories.findById(categoryId);
    if (!category) {
      throw new NotFoundError(`Category not found: ${categoryId}`);
    }
    if (await this.categories.hasChildren(categoryId)) {
      throw new ConflictError('A category with subcategories cannot be deleted');
    }
    if (await this.categories.hasProducts(categoryId)) {
      throw new ConflictError('A category containing products cannot be deleted');
    }
    category.markDeleted();
    await this.categories.delete(category);
    await this.events.dispatch(category.pullDomainEvents());
  }
}
