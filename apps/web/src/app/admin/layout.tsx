import type { ReactNode } from 'react';

import { AdminNav } from '@/components/admin/admin-nav';

import '../globals.css';

export const metadata = { title: 'Katalog Admin' };

// Admin tek dilli (TR); locale routing dışında. Oturum kontrolü middleware'de
// (cookie varlığı) + gerçek yetki API'de.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-zinc-100 text-zinc-900 antialiased">
        <div className="flex min-h-screen">
          <AdminNav />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
