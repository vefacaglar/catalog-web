import type { FastifyInstance } from 'fastify';

export function registerRevalidationWebhook(app: FastifyInstance): void {
  const { REVALIDATE_URL, REVALIDATE_SECRET } = app.config;
  if (!REVALIDATE_URL || !REVALIDATE_SECRET) {
    app.log.warn('REVALIDATE_URL/SECRET not set — revalidation webhook disabled');
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
      throw new Error(`Revalidate request failed: ${res.status}`);
    }
    app.log.info({ tags }, 'Web cache revalidated');
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
    app.events.subscribe(name, () => notify(['categories', 'products']));
  }
}
