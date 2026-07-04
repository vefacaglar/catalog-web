import { ValidationError } from '../../../../shared/domain/errors.js';
import { ValueObject } from '../../../../shared/domain/value-object.js';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: 'c',
  ğ: 'g',
  ı: 'i',
  ö: 'o',
  ş: 's',
  ü: 'u',
  Ç: 'c',
  Ğ: 'g',
  İ: 'i',
  I: 'i',
  Ö: 'o',
  Ş: 's',
  Ü: 'u',
};

export class Slug extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(value: string): Slug {
    if (!SLUG_PATTERN.test(value)) {
      throw new ValidationError(
        `Invalid slug: "${value}". Only lowercase letters, digits and hyphens are allowed`,
      );
    }
    return new Slug(value);
  }

  static fromName(name: string): Slug {
    const normalized = name
      .split('')
      .map((ch) => TURKISH_CHAR_MAP[ch] ?? ch)
      .join('')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!normalized) {
      throw new ValidationError(`Could not generate a slug from "${name}"`);
    }
    return new Slug(normalized);
  }

  withSuffix(n: number): Slug {
    return new Slug(`${this.value}-${n}`);
  }

  get value(): string {
    return this.props.value;
  }
}
