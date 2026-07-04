import { createDb, type Database } from '@catalog/db';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    db: Database;
  }
}

export interface DbPluginOptions {
  connectionString: string;
}

export const dbPlugin = fp<DbPluginOptions>(
  async (app, opts) => {
    const { db, client } = createDb(opts.connectionString);
    app.decorate('db', db);
    app.addHook('onClose', async () => {
      await client.end();
    });
  },
  { name: 'db' },
);
