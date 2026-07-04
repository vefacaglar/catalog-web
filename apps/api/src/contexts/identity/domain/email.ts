import { ValidationError } from '../../../shared/domain/errors.js';
import { ValueObject } from '../../../shared/domain/value-object.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(value: string): Email {
    const normalized = value.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized)) {
      throw new ValidationError(`Invalid email address: ${value}`);
    }
    return new Email(normalized);
  }

  get value(): string {
    return this.props.value;
  }
}
