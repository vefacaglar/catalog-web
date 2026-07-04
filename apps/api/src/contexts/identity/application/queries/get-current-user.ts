import type { CurrentUser } from '@catalog/contracts';

import type { UseCase } from '../../../../shared/application/use-case.js';
import { UnauthorizedError } from '../../../../shared/domain/errors.js';
import type { UserRepository } from '../../domain/user-repository.js';

export class GetCurrentUser implements UseCase<{ userId: number }, CurrentUser> {
  constructor(private readonly users: UserRepository) {}

  async execute({ userId }: { userId: number }): Promise<CurrentUser> {
    const user = await this.users.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError();
    }
    return { id: user.persistedId, email: user.email.value, role: user.role };
  }
}
