'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { logout } from '@/lib/admin-api';

export function AdminNav() {
  const t = useTranslations('admin.nav');
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') return null;

  const navItems = [
    { href: '/admin/products', label: t('products') },
    { href: '/admin/categories', label: t('categories') },
  ];

  async function handleLogout() {
    await logout().catch(() => {});
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-white p-4">
      <Link href="/admin/products" className="px-2 text-lg font-bold">
        {t('title')}
      </Link>
      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
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
          {t('viewSite')}
        </Link>
        <button
          onClick={handleLogout}
          className="rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
        >
          {t('logout')}
        </button>
      </div>
    </aside>
  );
}
