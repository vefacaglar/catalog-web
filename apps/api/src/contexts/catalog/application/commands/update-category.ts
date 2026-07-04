import type { AdminCategory, CategoryUpsertInput } from '@catalog/contracts';

import type { DomainEventDispatcher } from '../../../../shared/application/domain-event-dispatcher.js';
import type { UseCase } from '../../../../shared/application/use-case.js';
import { NotFoundError, ValidationError } from '../../../../shared/domain/errors.js';
import type { CategoryRepository } from '../../domain/category/category-repository.js';
import type { CatalogQueryService } from '../ports/catalog-query-service.js';
import { buildCategoryTranslations } from '../services/build-translations.js';

export interface UpdateCategoryInput extends CategoryUpsertInput {
  categoryId: number;
}

export class UpdateCategory implements UseCase<UpdateCategoryInput, AdminCategory> {
  constructor(
    private readonly categories: CategoryRepository,
    private readonly queryService: CatalogQueryService,
    private readonly events: DomainEventDispatcher,
  ) {}

  async execute(input: UpdateCategoryInput): Promise<AdminCategory> {
    const category = await this.categories.findById(input.categoryId);
    if (!category) {
      throw new NotFoundError(`Category not found: ${input.categoryId}`);
    }

    const parentId = input.parentId ?? null;
    if (parentId !== null) {
      const parent = await this.categories.findById(parentId);
      if (!parent) {
        throw new NotFoundError(`Parent category not found: ${parentId}`);
      }
      await this.assertNoCycle(input.categoryId, parentId);
    }

    const translations = await buildCategoryTranslations(
      input.translations,
      this.categories,
      category.persistedId,
    );
    category.updateDetails({
      parentId,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
      translations,
    });

    await this.categories.save(category);
    await this.events.dispatch(category.pullDomainEvents());

    const dto = (await this.queryService.listAdminCategories()).find(
      (c) => c.id === category.persistedId,
    );
    if (!dto) throw new Error('Category was updated but could not be read back');
    return dto;
  }

  private async assertNoCycle(categoryId: number, newParentId: number): Promise<void> {
    const refs = await this.categories.findAllRefs();
    const parentOf = new Map(refs.map((r) => [r.id, r.parentId]));
    let current: number | null = newParentId;
    while (current !== null) {
      if (current === categoryId) {
        throw new ValidationError('A category cannot be moved under its own subtree');
      }
      current = parentOf.get(current) ?? null;
    }
  }
}
