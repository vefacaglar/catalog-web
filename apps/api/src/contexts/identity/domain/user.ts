import { AggregateRoot } from '../../../shared/domain/aggregate-root.js';
import type { Email } from './email.js';

export interface UserProps {
  email: Email;
  passwordHash: string;
  /** roles tablosundaki rol adı (admin | user) */
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends AggregateRoot {
  readonly email: Email;
  readonly passwordHash: string;
  readonly role: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  updatedAt: Date;

  private constructor(id: number | null, props: UserProps) {
    super(id);
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.role = props.role;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static reconstitute(id: number, props: UserProps): User {
    return new User(id, props);
  }

  get isAdmin(): boolean {
    return this.role === 'admin';
  }
}
