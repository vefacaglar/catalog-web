import cors from '@fastify/cors';
import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';

import type { AppConfig } from './config.js';
import { registerCatalogContext } from './contexts/catalog/index.js';
import { registerIdentityContext } from './contexts/identity/index.js';
import { authPlugin } from './shared/presentation/plugins/auth.plugin.js';
import { dbPlugin } from './shared/presentation/plugins/db.plugin.js';
import { errorHandlerPlugin } from './shared/presentation/plugins/error-handler.plugin.js';
import { eventsPlugin } from './shared/presentation/plugins/events.plugin.js';

declare module 'fastify' {
  interface FastifyInstance {
    config: AppConfig;
  }
}

export async function buildApp(config: AppConfig) {
  const app = Fastify({
    logger:
      config.NODE_ENV === 'development'
        ? { transport: { target: 'pino-pretty' } }
        : true,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.decorate('config', config);

  await app.register(errorHandlerPlugin);
  await app.register(cors, {
    origin: config.WEB_ORIGIN,
    credentials: true,
  });
  await app.register(eventsPlugin);
  await app.register(dbPlugin, { connectionString: config.DATABASE_URL });
  await app.register(authPlugin, {
    jwtSecret: config.JWT_SECRET,
    cookieSecret: config.COOKIE_SECRET,
    secureCookies: config.NODE_ENV === 'production',
  });

  app.get('/health', async () => ({ status: 'ok' }));

  await app.register(
    async (api) => {
      await registerIdentityContext(api);
      await registerCatalogContext(api);
    },
    { prefix: '/api/v1' },
  );

  return app;
}
