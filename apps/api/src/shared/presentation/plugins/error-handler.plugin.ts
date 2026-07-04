import fp from 'fastify-plugin';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';

import { DomainError } from '../../domain/errors.js';

export const errorHandlerPlugin = fp(
  async (app) => {
    app.setErrorHandler((err: unknown, request, reply) => {
      if (hasZodFastifySchemaValidationErrors(err)) {
        return reply.status(400).send({
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          message: err.validation
            .map((v) => `${v.instancePath || 'body'}: ${v.message ?? 'geçersiz değer'}`)
            .join('; '),
        });
      }

      if (err instanceof DomainError) {
        return reply.status(err.statusCode).send({
          statusCode: err.statusCode,
          code: err.code,
          message: err.message,
        });
      }

      // Fastify'ın kendi hataları (404, body limit vb.) statusCode taşır
      const fastifyErr = err as { statusCode?: number; code?: string; message?: string };
      if (typeof fastifyErr.statusCode === 'number' && fastifyErr.statusCode < 500) {
        return reply.status(fastifyErr.statusCode).send({
          statusCode: fastifyErr.statusCode,
          code: fastifyErr.code ?? 'REQUEST_ERROR',
          message: fastifyErr.message ?? 'İstek hatası',
        });
      }

      request.log.error(err);
      return reply.status(500).send({
        statusCode: 500,
        code: 'INTERNAL_ERROR',
        message: 'Beklenmeyen bir hata oluştu',
      });
    });

    app.setNotFoundHandler((_request, reply) => {
      reply.status(404).send({
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'Kaynak bulunamadı',
      });
    });
  },
  { name: 'error-handler' },
);
