import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  COOKIE_SECRET: z.string().min(16),
  WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
  REVALIDATE_URL: z.string().url().optional(),
  REVALIDATE_SECRET: z.string().optional(),
  // ImageKit anahtarları Faz 6'ya kadar opsiyonel; eksikse upload endpoint'i 503 döner
  IMAGEKIT_PUBLIC_KEY: z.string().optional(),
  IMAGEKIT_PRIVATE_KEY: z.string().optional(),
  IMAGEKIT_URL_ENDPOINT: z.string().url().optional(),
});

export type AppConfig = z.infer<typeof envSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  // .env'de "KEY=" olarak bırakılan değerler boş string gelir; opsiyonel alanlar
  // için bunlar tanımsız sayılmalı
  const cleaned = Object.fromEntries(
    Object.entries(env).filter(([, value]) => value !== ''),
  );
  const parsed = envSchema.safeParse(cleaned);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Gecersiz ortam degiskenleri:\n${issues}`);
  }
  return parsed.data;
}
