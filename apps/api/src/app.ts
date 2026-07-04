import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';

import type { AppConfig } from './config.js';

export async function buildApp(config: AppConfig) {
  const app = Fastify({
    logger:
      config.NODE_ENV === 'development'
        ? { transport: { target: 'pino-pretty' } }
        : true,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}
