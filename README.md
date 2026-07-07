# catalog-web

Bilingual (TR/EN) product catalog website. Products are listed with images and categories; sales happen over the phone or WhatsApp — there is no cart, checkout, or payment flow.

Architecture, conventions, and contribution rules live in [AGENTS.md](./AGENTS.md).

## Stack

| Area | Technology |
| --- | --- |
| Monorepo | Turborepo + pnpm workspaces, TypeScript, Node >= 22 |
| Web | Next.js 15 (App Router), next-intl v4, Tailwind CSS v4 |
| API | Fastify 5, modular DDD (bounded contexts), zod v4 validation |
| Database | PostgreSQL 17, Drizzle ORM + drizzle-kit |
| Images | ImageKit behind an abstract `ImageStorage` interface |
| Auth | JWT in httpOnly cookie, role-based (`admin` / `user`) |

## Getting Started

```sh
pnpm install
docker compose up -d                # Postgres on :5432

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp packages/db/.env.example packages/db/.env
# fill in secrets; JWT_SECRET and COOKIE_SECRET need 16+ chars

pnpm db:migrate
pnpm db:seed                        # roles, admin user, sample catalog
pnpm dev                            # web :3000, api :3001
```

Default seed admin: `admin@catalog.local` / `admin1234` (override via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in `packages/db/.env`).

- Public site: http://localhost:3000/tr and http://localhost:3000/en
- Admin panel: http://localhost:3000/admin
- API health: http://localhost:3001/health

### Image uploads

Create a free account at [imagekit.io](https://imagekit.io) and set `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT` in `apps/api/.env` plus `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` in `apps/web/.env.local`. Until configured, upload endpoints return `503`.

## Commands

```sh
pnpm dev            # run web + api in watch mode
pnpm build          # production builds (do not run while dev servers share .next)
pnpm lint           # eslint across all packages
pnpm typecheck      # tsc --noEmit across all packages
pnpm db:generate    # generate a migration after schema changes
pnpm db:migrate     # apply migrations
pnpm db:seed        # reset and reseed dev data
```

## Project Layout

```
apps/web        Next.js site: public catalog ([locale]/...) + /admin panel
apps/api        Fastify API: contexts/{catalog,media,identity}, shared kernel
packages/db     Drizzle schema, migrations, seed
packages/contracts  zod schemas shared by API validation and web clients
packages/eslint-config, packages/typescript-config  shared tooling presets
```

## Deployment Notes

- **Web** deploys anywhere Next.js runs (e.g. Vercel). Set `API_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`, `NEXT_PUBLIC_CONTACT_PHONE`, `NEXT_PUBLIC_SITE_URL`, `REVALIDATE_SECRET`.
- **API** builds to a single bundle with `pnpm --filter @catalog/api build` and runs with `node dist/server.js` on any Node 22+ host. Set all variables from `apps/api/.env.example`; `REVALIDATE_URL` must point to the deployed web origin. Cookies are `Secure` when `NODE_ENV=production`, so serve over HTTPS and keep web + API on the same site (or adjust CORS via `WEB_ORIGIN`).
- **Database**: any managed PostgreSQL 17. Run `pnpm db:migrate` during deploy; run the seed only once per environment.
- Login endpoint is rate limited (5 attempts/minute per IP).
