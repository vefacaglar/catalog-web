'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { logout } from '@/lib/admin-api';

const NAV_ITEMS = [
  { href: '/admin/products', label: 'Ürünler' },
  { href: '/admin/categories', label: 'Kategoriler' },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') return null;

  async function handleLogout() {
    await logout().catch(() => {});
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-white p-4">
      <Link href="/admin/products" className="px-2 text-lg font-bold">
        Katalog Admin
      </Link>
      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              pathname.startsWith(item.href)
                ? 'rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white'
                : 'rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100'
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex flex-col gap-1 border-t border-zinc-200 pt-3">
        <Link href="/tr" className="rounded-lg px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100">
          Siteyi Görüntüle ↗
        </Link>
        <button
          onClick={handleLogout}
          className="rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
        >
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
