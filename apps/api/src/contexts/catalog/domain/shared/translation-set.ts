import { ValidationError } from '../../../../shared/domain/errors.js';
import { LOCALES, type Locale } from './locale.js';

export class TranslationSet<T> {
  private constructor(private readonly map: ReadonlyMap<Locale, T>) {}

  static create<T>(entries: Record<Locale, T>): TranslationSet<T> {
    const map = new Map<Locale, T>();
    for (const locale of LOCALES) {
      const value = entries[locale];
      if (value === undefined || value === null) {
        throw new ValidationError(`Translation for "${locale}" is required`);
      }
      map.set(locale, value);
    }
    return new TranslationSet(map);
  }

  get(locale: Locale): T {
    const value = this.map.get(locale);
    if (value === undefined) {
      throw new ValidationError(`Translation for "${locale}" not found`);
    }
    return value;
  }

  entries(): [Locale, T][] {
    return LOCALES.map((locale) => [locale, this.get(locale)]);
  }
}
