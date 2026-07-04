import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';

import { AdminNav } from '@/components/admin/admin-nav';
import messages from '../../../messages/tr.json';

import '../globals.css';

export const metadata = { title: messages.admin.nav.title };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-zinc-100 text-zinc-900 antialiased">
        <NextIntlClientProvider locale="tr" messages={messages}>
          <div className="flex min-h-screen">
            <AdminNav />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
