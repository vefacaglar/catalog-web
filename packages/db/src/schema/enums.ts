import { pgEnum } from 'drizzle-orm/pg-core';

export const localeEnum = pgEnum('locale', ['tr', 'en']);

export const LOCALES = localeEnum.enumValues;
export type Locale = (typeof LOCALES)[number];
