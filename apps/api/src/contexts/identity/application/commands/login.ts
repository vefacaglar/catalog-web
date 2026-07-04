import type { CurrentUser, LoginInput } from '@catalog/contracts';

import type { UseCase } from '../../../../shared/application/use-case.js';
import { UnauthorizedError } from '../../../../shared/domain/errors.js';
import type { UserRepository } from '../../domain/user-repository.js';
import type { PasswordHasher } from '../ports/password-hasher.js';

export class Login implements UseCase<LoginInput, CurrentUser> {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async execute({ email, password }: LoginInput): Promise<CurrentUser> {
    const user = await this.users.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }
    const valid = await this.hasher.verify(user.passwordHash, password);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }
    return { id: user.persistedId, email: user.email.value, role: user.role };
  }
}
