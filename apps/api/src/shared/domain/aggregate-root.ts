import type { DomainEvent } from './domain-event.js';
import { Entity } from './entity.js';

export abstract class AggregateRoot extends Entity {
  private domainEvents: DomainEvent[] = [];

  protected record(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = this.domainEvents;
    this.domainEvents = [];
    return events;
  }
}
