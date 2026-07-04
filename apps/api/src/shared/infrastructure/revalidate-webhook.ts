import type { FastifyInstance } from 'fastify';

/**
 * Catalog event'lerini web uygulamasının cache revalidation endpoint'ine köprüler.
 * Handler hatası iş akışını etkilemez (dispatcher loglayıp yutar); web tarafındaki
 * 300 sn'lik revalidate penceresi güvenlik ağıdır.
 */
export function registerRevalidationWebhook(app: FastifyInstance): void {
  const { REVALIDATE_URL, REVALIDATE_SECRET } = app.config;
  if (!REVALIDATE_URL || !REVALIDATE_SECRET) {
    app.log.warn('REVALIDATE_URL/SECRET tanımsız — revalidation webhook devre dışı');
    return;
  }

  const notify = async (tags: string[]) => {
    const res = await fetch(REVALIDATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': REVALIDATE_SECRET,
      },
      body: JSON.stringify({ tags }),
    });
    if (!res.ok) {
      throw new Error(`Revalidate isteği başarısız: ${res.status}`);
    }
    app.log.info({ tags }, 'Web cache revalidate edildi');
  };

  const productEvents = [
    'catalog.product.created',
    'catalog.product.updated',
    'catalog.product.deleted',
    'catalog.product.image-added',
    'catalog.product.image-removed',
  ];
  for (const name of productEvents) {
    app.events.subscribe(name, () => notify(['products']));
  }

  const categoryEvents = [
    'catalog.category.created',
    'catalog.category.updated',
    'catalog.category.deleted',
  ];
  for (const name of categoryEvents) {
    // Kategori değişimi ürün listelerindeki kategori adlarını da etkiler
    app.events.subscribe(name, () => notify(['categories', 'products']));
  }
}
