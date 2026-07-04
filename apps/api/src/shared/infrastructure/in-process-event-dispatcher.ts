import type { FastifyBaseLogger } from 'fastify';

import type {
  DomainEventDispatcher,
  DomainEventHandler,
} from '../application/domain-event-dispatcher.js';
import type { DomainEvent } from '../domain/domain-event.js';

export class InProcessEventDispatcher implements DomainEventDispatcher {
  private readonly handlers = new Map<string, DomainEventHandler[]>();

  constructor(private readonly logger: FastifyBaseLogger) {}

  subscribe(eventName: string, handler: DomainEventHandler): void {
    const list = this.handlers.get(eventName) ?? [];
    list.push(handler);
    this.handlers.set(eventName, list);
  }

  async dispatch(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const list = this.handlers.get(event.name) ?? [];
      for (const handler of list) {
        try {
          await handler(event);
        } catch (err) {
          this.logger.error({ err, event: event.name }, 'Domain event handler hatasi');
        }
      }
    }
  }
}
