import type { ReactNode } from 'react';

import './globals.css';

// Kök layout — locale'li public yapı Faz 4'te [locale] altına taşınacak.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
