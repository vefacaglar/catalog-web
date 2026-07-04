import { schema, type Database } from '@catalog/db';
import { eq } from 'drizzle-orm';

import type { UserRepository } from '../domain/user-repository.js';
import { Email } from '../domain/email.js';
import { User } from '../domain/user.js';

const { roles, users } = schema;

export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly db: Database) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne(eq(users.email, email.trim().toLowerCase()));
  }

  async findById(id: number): Promise<User | null> {
    return this.findOne(eq(users.id, id));
  }

  private async findOne(condition: ReturnType<typeof eq>): Promise<User | null> {
    const [row] = await this.db
      .select({
        id: users.id,
        email: users.email,
        passwordHash: users.passwordHash,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        role: roles.name,
      })
      .from(users)
      .innerJoin(roles, eq(roles.id, users.roleId))
      .where(condition)
      .limit(1);
    if (!row) return null;

    return User.reconstitute(row.id, {
      email: Email.create(row.email),
      passwordHash: row.passwordHash,
      role: row.role,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
