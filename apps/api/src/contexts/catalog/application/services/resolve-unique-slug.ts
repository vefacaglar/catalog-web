import { ConflictError } from '../../../../shared/domain/errors.js';
import { Slug } from '../../domain/shared/slug.js';

export async function resolveUniqueSlug(
  name: string,
  providedSlug: string | undefined,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<Slug> {
  if (providedSlug !== undefined && providedSlug !== '') {
    const slug = Slug.create(providedSlug);
    if (await isTaken(slug.value)) {
      throw new ConflictError(`Slug "${slug.value}" is already in use`);
    }
    return slug;
  }

  const base = Slug.fromName(name);
  if (!(await isTaken(base.value))) return base;

  for (let n = 2; n <= 50; n++) {
    const candidate = base.withSuffix(n);
    if (!(await isTaken(candidate.value))) return candidate;
  }
  throw new ConflictError(`Could not generate a unique slug for "${base.value}"`);
}
