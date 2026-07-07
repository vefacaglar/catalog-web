import { currentUserSchema, loginSchema } from '@catalog/contracts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { SESSION_COOKIE } from '../../../shared/presentation/plugins/auth.plugin.js';
import type { Login } from '../application/commands/login.js';
import type { GetCurrentUser } from '../application/queries/get-current-user.js';

export interface AuthRoutesDeps {
  login: Login;
  getCurrentUser: GetCurrentUser;
}

export function buildAuthRoutes(deps: AuthRoutesDeps): FastifyPluginAsyncZod {
  return async (app) => {
    app.post(
      '/auth/login',
      {
        config: {
          rateLimit: { max: 5, timeWindow: '1 minute' },
        },
        schema: {
          body: loginSchema,
          response: { 200: currentUserSchema },
        },
      },
      async (request, reply) => {
        const user = await deps.login.execute(request.body);
        const token = await reply.jwtSign({ sub: user.id, email: user.email, role: user.role });
        reply.setCookie(SESSION_COOKIE, token, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure: app.config.NODE_ENV === 'production',
          maxAge: 12 * 60 * 60,
        });
        return user;
      },
    );

    app.post(
      '/auth/logout',
      { schema: { response: { 200: z.object({ success: z.boolean() }) } } },
      async (_request, reply) => {
        reply.clearCookie(SESSION_COOKIE, { path: '/' });
        return { success: true };
      },
    );

    app.get(
      '/auth/me',
      {
        onRequest: [app.requireAuth],
        schema: { response: { 200: currentUserSchema } },
      },
      async (request) => deps.getCurrentUser.execute({ userId: request.user.sub }),
    );
  };
}
