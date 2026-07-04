import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { AlternateLinksProvider } from '@/components/i18n/alternate-links';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { routing } from '@/i18n/routing';

import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-white text-zinc-900 antialiased">
        <NextIntlClientProvider>
          <AlternateLinksProvider>
            <Header />
            <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
            <Footer />
          </AlternateLinksProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
