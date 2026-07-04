import fp from 'fastify-plugin';

import type { DomainEventDispatcher } from '../../application/domain-event-dispatcher.js';
import { InProcessEventDispatcher } from '../../infrastructure/in-process-event-dispatcher.js';

declare module 'fastify' {
  interface FastifyInstance {
    events: DomainEventDispatcher;
  }
}

export const eventsPlugin = fp(
  async (app) => {
    app.decorate('events', new InProcessEventDispatcher(app.log));
  },
  { name: 'events' },
);
