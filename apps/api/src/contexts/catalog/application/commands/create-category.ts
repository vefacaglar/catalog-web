import type { AdminCategory, CategoryUpsertInput } from '@catalog/contracts';

import type { DomainEventDispatcher } from '../../../../shared/application/domain-event-dispatcher.js';
import type { UseCase } from '../../../../shared/application/use-case.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { Category } from '../../domain/category/category.js';
import type { CategoryRepository } from '../../domain/category/category-repository.js';
import type { CatalogQueryService } from '../ports/catalog-query-service.js';
import { buildCategoryTranslations } from '../services/build-translations.js';

export class CreateCategory implements UseCase<CategoryUpsertInput, AdminCategory> {
  constructor(
    private readonly categories: CategoryRepository,
    private readonly queryService: CatalogQueryService,
    private readonly events: DomainEventDispatcher,
  ) {}

  async execute(input: CategoryUpsertInput): Promise<AdminCategory> {
    const parentId = input.parentId ?? null;
    if (parentId !== null) {
      const parent = await this.categories.findById(parentId);
      if (!parent) {
        throw new NotFoundError(`Üst kategori bulunamadı: ${parentId}`);
      }
    }

    const translations = await buildCategoryTranslations(input.translations, this.categories);
    const category = Category.create({
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
    if (!dto) throw new Error('Kategori oluşturuldu ama okunamadı');
    return dto;
  }
}
