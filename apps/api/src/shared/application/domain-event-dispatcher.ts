import type { DomainEvent } from '../domain/domain-event.js';

export type DomainEventHandler<E extends DomainEvent = DomainEvent> = (
  event: E,
) => Promise<void> | void;

export interface DomainEventDispatcher {
  subscribe(eventName: string, handler: DomainEventHandler): void;
  /**
   * Commit SONRASI çağrılır. Handler hataları yutulur (loglanır) —
   * yan etkiler (webhook vb.) iş kuralı transaction'ını geri alamaz.
   */
  dispatch(events: DomainEvent[]): Promise<void>;
}
