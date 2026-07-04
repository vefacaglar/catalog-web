import type {
  AdminCategory,
  AdminProduct,
  CategoryTreeNode,
  Locale,
  ProductDetail,
  ProductList,
  ProductListItem,
  ProductListQuery,
} from '@catalog/contracts';
import { schema, type Database } from '@catalog/db';
import { and, asc, count, desc, eq, ilike, inArray } from 'drizzle-orm';

import type { CatalogQueryService } from '../application/ports/catalog-query-service.js';

const { categories, categoryTranslations, productImages, products, productTranslations } = schema;

interface CategoryRow {
  id: number;
  parentId: number | null;
  sortOrder: number;
  name: string;
  slug: string;
  description: string | null;
}

export class DrizzleCatalogQueryService implements CatalogQueryService {
  constructor(private readonly db: Database) {}

  async listProducts(query: ProductListQuery): Promise<ProductList> {
    const { locale, page, pageSize } = query;

    let categoryIds: number[] | null = null;
    if (query.category) {
      const [cat] = await this.db
        .select({ categoryId: categoryTranslations.categoryId })
        .from(categoryTranslations)
        .where(
          and(
            eq(categoryTranslations.locale, locale),
            eq(categoryTranslations.slug, query.category),
          ),
        )
        .limit(1);
      if (!cat) {
        return { items: [], page, pageSize, total: 0, totalPages: 0 };
      }
      const refs = await this.db
        .select({ id: categories.id, parentId: categories.parentId })
        .from(categories);
      categoryIds = collectDescendants(cat.categoryId, refs);
    }

    const conditions = [eq(products.isActive, true), eq(productTranslations.locale, locale)];
    if (categoryIds) conditions.push(inArray(products.categoryId, categoryIds));
    if (query.search) conditions.push(ilike(productTranslations.name, `%${query.search}%`));
    if (query.featured !== undefined) conditions.push(eq(products.isFeatured, query.featured));

    const where = and(...conditions);

    const [totalRow] = await this.db
      .select({ total: count() })
      .from(products)
      .innerJoin(productTranslations, eq(productTranslations.productId, products.id))
      .where(where);
    const total = totalRow?.total ?? 0;

    const rows = await this.db
      .select({
        id: products.id,
        sku: products.sku,
        isFeatured: products.isFeatured,
        sortOrder: products.sortOrder,
        categoryId: products.categoryId,
        name: productTranslations.name,
        slug: productTranslations.slug,
        catName: categoryTranslations.name,
        catSlug: categoryTranslations.slug,
      })
      .from(products)
      .innerJoin(productTranslations, eq(productTranslations.productId, products.id))
      .innerJoin(categories, eq(categories.id, products.categoryId))
      .innerJoin(
        categoryTranslations,
        and(
          eq(categoryTranslations.categoryId, categories.id),
          eq(categoryTranslations.locale, locale),
        ),
      )
      .where(where)
      .orderBy(desc(products.isFeatured), asc(products.sortOrder), asc(products.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const covers = await this.fetchCoverImages(
      rows.map((r) => r.id),
      locale,
    );

    const items: ProductListItem[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      sku: row.sku,
      isFeatured: row.isFeatured,
      category: { id: row.categoryId, name: row.catName, slug: row.catSlug },
      coverImage: covers.get(row.id) ?? null,
    }));

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async getProductBySlug(locale: Locale, slug: string): Promise<ProductDetail | null> {
    const [match] = await this.db
      .select({ productId: productTranslations.productId })
      .from(productTranslations)
      .where(and(eq(productTranslations.locale, locale), eq(productTranslations.slug, slug)))
      .limit(1);
    if (!match) return null;

    const [product] = await this.db
      .select()
      .from(products)
      .where(and(eq(products.id, match.productId), eq(products.isActive, true)))
      .limit(1);
    if (!product) return null;

    const translations = await this.db
      .select()
      .from(productTranslations)
      .where(eq(productTranslations.productId, product.id));
    const current = translations.find((t) => t.locale === locale);
    if (!current) return null;

    const slugs: Partial<Record<Locale, string>> = {};
    for (const t of translations) slugs[t.locale] = t.slug;

    const images = await this.db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(asc(productImages.sortOrder));

    const categoryRows = await this.fetchCategoryRows(locale);
    const breadcrumb = buildBreadcrumb(product.categoryId, categoryRows);
    const category = breadcrumb[breadcrumb.length - 1];
    if (!category) return null;

    return {
      id: product.id,
      name: current.name,
      slug: current.slug,
      description: current.description,
      sku: product.sku,
      isFeatured: product.isFeatured,
      category,
      breadcrumb,
      images: images.map((img) => ({
        id: img.id,
        filePath: img.filePath,
        alt: locale === 'tr' ? img.altTr : img.altEn,
        sortOrder: img.sortOrder,
        width: img.width,
        height: img.height,
      })),
      slugs,
    };
  }

  async getCategoryTree(locale: Locale): Promise<CategoryTreeNode[]> {
    const rows = await this.fetchCategoryRows(locale, { onlyActive: true });
    return buildTree(rows, null);
  }

  async listAdminProducts(query: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<{ items: AdminProduct[]; total: number }> {
    const conditions = [eq(productTranslations.locale, 'tr' as const)];
    if (query.search) conditions.push(ilike(productTranslations.name, `%${query.search}%`));
    const where = and(...conditions);

    const [totalRow] = await this.db
      .select({ total: count() })
      .from(products)
      .innerJoin(productTranslations, eq(productTranslations.productId, products.id))
      .where(where);

    const rows = await this.db
      .select({ id: products.id })
      .from(products)
      .innerJoin(productTranslations, eq(productTranslations.productId, products.id))
      .where(where)
      .orderBy(asc(products.sortOrder), asc(products.id))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize);

    const items = (
      await Promise.all(rows.map((row) => this.getAdminProduct(row.id)))
    ).filter((p): p is AdminProduct => p !== null);

    return { items, total: totalRow?.total ?? 0 };
  }

  async getAdminProduct(id: number): Promise<AdminProduct | null> {
    const [product] = await this.db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!product) return null;

    const translations = await this.db
      .select()
      .from(productTranslations)
      .where(eq(productTranslations.productId, id));
    const tr = translations.find((t) => t.locale === 'tr');
    const en = translations.find((t) => t.locale === 'en');
    if (!tr || !en) return null;

    const images = await this.db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id))
      .orderBy(asc(productImages.sortOrder));

    return {
      id: product.id,
      categoryId: product.categoryId,
      sku: product.sku,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      sortOrder: product.sortOrder,
      translations: {
        tr: { name: tr.name, slug: tr.slug, description: tr.description },
        en: { name: en.name, slug: en.slug, description: en.description },
      },
      images: images.map((img) => ({
        id: img.id,
        filePath: img.filePath,
        altTr: img.altTr,
        altEn: img.altEn,
        sortOrder: img.sortOrder,
        width: img.width,
        height: img.height,
      })),
    };
  }

  async listAdminCategories(): Promise<AdminCategory[]> {
    const cats = await this.db
      .select()
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.id));
    const translations = await this.db.select().from(categoryTranslations);

    return cats.flatMap((cat) => {
      const tr = translations.find((t) => t.categoryId === cat.id && t.locale === 'tr');
      const en = translations.find((t) => t.categoryId === cat.id && t.locale === 'en');
      if (!tr || !en) return [];
      return [
        {
          id: cat.id,
          parentId: cat.parentId,
          sortOrder: cat.sortOrder,
          isActive: cat.isActive,
          translations: {
            tr: { name: tr.name, slug: tr.slug, description: tr.description },
            en: { name: en.name, slug: en.slug, description: en.description },
          },
        },
      ];
    });
  }

  private async fetchCoverImages(productIds: number[], locale: Locale) {
    const covers = new Map<
      number,
      {
        id: number;
        filePath: string;
        alt: string | null;
        sortOrder: number;
        width: number | null;
        height: number | null;
      }
    >();
    if (productIds.length === 0) return covers;

    const images = await this.db
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, productIds))
      .orderBy(asc(productImages.sortOrder));

    for (const img of images) {
      if (!covers.has(img.productId)) {
        covers.set(img.productId, {
          id: img.id,
          filePath: img.filePath,
          alt: locale === 'tr' ? img.altTr : img.altEn,
          sortOrder: img.sortOrder,
          width: img.width,
          height: img.height,
        });
      }
    }
    return covers;
  }

  private async fetchCategoryRows(
    locale: Locale,
    opts: { onlyActive?: boolean } = {},
  ): Promise<CategoryRow[]> {
    const rows = await this.db
      .select({
        id: categories.id,
        parentId: categories.parentId,
        sortOrder: categories.sortOrder,
        isActive: categories.isActive,
        name: categoryTranslations.name,
        slug: categoryTranslations.slug,
        description: categoryTranslations.description,
      })
      .from(categories)
      .innerJoin(
        categoryTranslations,
        and(
          eq(categoryTranslations.categoryId, categories.id),
          eq(categoryTranslations.locale, locale),
        ),
      )
      .orderBy(asc(categories.sortOrder), asc(categories.id));

    return rows.filter((r) => !opts.onlyActive || r.isActive);
  }
}

function collectDescendants(
  rootId: number,
  refs: { id: number; parentId: number | null }[],
): number[] {
  const childrenOf = new Map<number | null, number[]>();
  for (const ref of refs) {
    const list = childrenOf.get(ref.parentId) ?? [];
    list.push(ref.id);
    childrenOf.set(ref.parentId, list);
  }
  const result: number[] = [];
  const stack = [rootId];
  while (stack.length > 0) {
    const id = stack.pop() as number;
    result.push(id);
    stack.push(...(childrenOf.get(id) ?? []));
  }
  return result;
}

function buildTree(rows: CategoryRow[], parentId: number | null): CategoryTreeNode[] {
  return rows
    .filter((row) => row.parentId === parentId)
    .map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      sortOrder: row.sortOrder,
      children: buildTree(rows, row.id),
    }));
}

function buildBreadcrumb(
  categoryId: number,
  rows: CategoryRow[],
): { id: number; name: string; slug: string }[] {
  const byId = new Map(rows.map((row) => [row.id, row]));
  const chain: { id: number; name: string; slug: string }[] = [];
  let current = byId.get(categoryId);
  while (current) {
    chain.unshift({ id: current.id, name: current.name, slug: current.slug });
    current = current.parentId !== null ? byId.get(current.parentId) : undefined;
  }
  return chain;
}
