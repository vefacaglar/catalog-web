import type { CategoryTreeNode, Locale } from '@catalog/contracts';

import type { UseCase } from '../../../../shared/application/use-case.js';
import type { CatalogQueryService } from '../ports/catalog-query-service.js';

export class GetCategoryTree implements UseCase<{ locale: Locale }, CategoryTreeNode[]> {
  constructor(private readonly queryService: CatalogQueryService) {}

  execute({ locale }: { locale: Locale }): Promise<CategoryTreeNode[]> {
    return this.queryService.getCategoryTree(locale);
  }
}
