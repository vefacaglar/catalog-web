'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

/**
 * Ürün detayı gibi locale'e göre slug'ı değişen sayfalarda, header'daki
 * locale switcher'ın doğru URL'e gitmesi için alternatif yolları taşır.
 */
type AlternateMap = Record<string, string> | null;

const AlternateLinksContext = createContext<{
  alternates: AlternateMap;
  setAlternates: (map: AlternateMap) => void;
}>({ alternates: null, setAlternates: () => {} });

export function AlternateLinksProvider({ children }: { children: ReactNode }) {
  const [alternates, setAlternates] = useState<AlternateMap>(null);
  return (
    <AlternateLinksContext.Provider value={{ alternates, setAlternates }}>
      {children}
    </AlternateLinksContext.Provider>
  );
}

export function useAlternateLinks(): AlternateMap {
  return useContext(AlternateLinksContext).alternates;
}

/** Sayfa bazında alternatif URL kaydı — server component'ten render edilir. */
export function SetAlternateLinks({ links }: { links: Record<string, string> }) {
  const { setAlternates } = useContext(AlternateLinksContext);
  const serialized = JSON.stringify(links);
  useEffect(() => {
    setAlternates(JSON.parse(serialized) as Record<string, string>);
    return () => setAlternates(null);
  }, [serialized, setAlternates]);
  return null;
}
