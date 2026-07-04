export interface DomainEvent {
  readonly name: string;
  readonly occurredAt: Date;
}

export abstract class BaseDomainEvent implements DomainEvent {
  abstract readonly name: string;
  readonly occurredAt = new Date();
}
