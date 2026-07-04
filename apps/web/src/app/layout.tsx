import type { ReactNode } from 'react';

// html/body etiketleri [locale]/layout.tsx ve admin/layout.tsx içinde kurulur.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
