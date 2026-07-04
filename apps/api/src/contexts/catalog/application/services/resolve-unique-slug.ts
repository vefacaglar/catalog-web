import { ConflictError } from '../../../../shared/domain/errors.js';
import { Slug } from '../../domain/shared/slug.js';

/**
 * Slug çözümü: kullanıcı slug verdiyse aynen kullanılır (doluysa hata);
 * verilmediyse isimden üretilir, çakışırsa -2, -3... eklenir.
 */
export async function resolveUniqueSlug(
  name: string,
  providedSlug: string | undefined,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<Slug> {
  if (providedSlug !== undefined && providedSlug !== '') {
    const slug = Slug.create(providedSlug);
    if (await isTaken(slug.value)) {
      throw new ConflictError(`"${slug.value}" slug'ı zaten kullanımda`);
    }
    return slug;
  }

  const base = Slug.fromName(name);
  if (!(await isTaken(base.value))) return base;

  for (let n = 2; n <= 50; n++) {
    const candidate = base.withSuffix(n);
    if (!(await isTaken(candidate.value))) return candidate;
  }
  throw new ConflictError(`"${base.value}" için benzersiz slug üretilemedi`);
}
