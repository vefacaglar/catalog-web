import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import type { FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

import { ForbiddenError, UnauthorizedError } from '../../domain/errors.js';

export const SESSION_COOKIE = 'catalog_session';

export interface SessionPayload {
  sub: number;
  email: string;
  role: string;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: SessionPayload;
    user: SessionPayload;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    requireAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (role: string) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export interface AuthPluginOptions {
  jwtSecret: string;
  cookieSecret: string;
  secureCookies: boolean;
}

export const authPlugin = fp<AuthPluginOptions>(
  async (app, opts) => {
    await app.register(cookie, { secret: opts.cookieSecret });
    await app.register(jwt, {
      secret: opts.jwtSecret,
      sign: { expiresIn: '12h' },
      cookie: { cookieName: SESSION_COOKIE, signed: false },
    });

    const requireAuth = async (request: FastifyRequest): Promise<void> => {
      try {
        await request.jwtVerify({ onlyCookie: true });
      } catch {
        throw new UnauthorizedError();
      }
    };

    app.decorate('requireAuth', requireAuth);
    app.decorate('requireRole', (role: string) => {
      return async (request: FastifyRequest): Promise<void> => {
        await requireAuth(request);
        if (request.user.role !== role) {
          throw new ForbiddenError();
        }
      };
    });
  },
  { name: 'auth' },
);
