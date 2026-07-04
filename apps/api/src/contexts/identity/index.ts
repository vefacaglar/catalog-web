import type { FastifyInstance } from 'fastify';

import { Login } from './application/commands/login.js';
import { GetCurrentUser } from './application/queries/get-current-user.js';
import { Argon2PasswordHasher } from './infrastructure/argon2-password-hasher.js';
import { DrizzleUserRepository } from './infrastructure/drizzle-user.repository.js';
import { buildAuthRoutes } from './presentation/auth.routes.js';

export async function registerIdentityContext(app: FastifyInstance): Promise<void> {
  const users = new DrizzleUserRepository(app.db);
  const hasher = new Argon2PasswordHasher();

  await app.register(
    buildAuthRoutes({
      login: new Login(users, hasher),
      getCurrentUser: new GetCurrentUser(users),
    }),
  );
}
