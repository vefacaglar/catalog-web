# catalog-web — Agent & Contributor Guide

Bilingual (TR/EN) product catalog site. No e-commerce: products are listed with images and categories; sales happen via phone/WhatsApp contact.

## Stack

- Monorepo: Turborepo + pnpm workspaces, TypeScript everywhere, Node >= 22
- `apps/web`: Next.js 15 (App Router) — public catalog (`/tr`, `/en` via next-intl v4) + `/admin` panel
- `apps/api`: Fastify 5 — modular DDD (see Architecture)
- `packages/db`: Drizzle ORM schema, migrations, seed (PostgreSQL 17 via `docker compose up -d`)
- `packages/contracts`: zod v4 schemas shared by API validation and web clients
- Images: ImageKit behind an abstract `ImageStorage` interface

## Commands

```sh
pnpm install
docker compose up -d          # Postgres on :5432
pnpm db:migrate && pnpm db:seed
pnpm dev                      # web :3000, api :3001
pnpm lint && pnpm typecheck && pnpm build
pnpm db:generate              # regenerate migrations after schema changes
```

Env files: `apps/api/.env`, `apps/web/.env.local`, `packages/db/.env` (see the `.env.example` next to each).

## Hard Rules

1. **English only in code and docs.** All documentation, identifiers, code strings, error messages, and log messages are written in English. Turkish (or any non-English text) may exist ONLY inside resource files (`apps/web/messages/*.json`) and database content.
2. **No comments in code.** Do not write code comments of any kind (`//`, `/* */`, JSDoc). Express intent through naming and structure instead.
3. **All user-facing text comes from resources.** Every string rendered by the web app — public pages AND the admin panel — must come from `apps/web/messages/{tr,en}.json` via next-intl. Never hardcode display text in components. The admin panel uses a fixed locale provider; its strings live under the `admin` namespace.
4. **API messages default to English.** Every error, validation, and log message produced by `apps/api` is English. Localization of API-driven text happens on the web side via resources.

## Architecture Rules

- The API is organized into bounded contexts under `apps/api/src/contexts/`: `catalog` (core domain), `media` (storage), `identity` (users/auth). Each has `domain / application / infrastructure / presentation` layers.
- Dependency direction: `domain` imports nothing except `shared/` kernel; `application` imports domain + its own ports; `infrastructure` implements ports/repositories; `presentation` calls application only. Routes never touch domain or Drizzle directly.
- Contexts never import each other's domain. Cross-context communication goes through ports (e.g. catalog's `ImageStoragePort`) and domain events subscribed by name (e.g. `catalog.product.image-removed`).
- Aggregates (`Product`, `Category`, `User`) guard their invariants in behavior methods and record domain events. Repositories operate on aggregate roots only and persist them atomically. Events are dispatched in-process AFTER the transaction commits; handler failures are logged, never rolled back.
- Command/query split (CQRS-lite): commands load aggregates and save through repositories; queries read DTOs through `CatalogQueryService` without building aggregates. No event sourcing, no separate read store.
- `@catalog/contracts` never imports from `@catalog/db`; `@catalog/db` knows nothing about HTTP. Wire shapes and persistence shapes stay decoupled.
- Storage provider isolation: only `apps/api/src/contexts/media/infrastructure/imagekit.storage.ts` and `apps/web/src/lib/image.ts` may reference ImageKit. Swapping providers means a new adapter + updating that URL helper, nothing else.
- Internal packages are consumed as TypeScript source (just-in-time packages). Relative imports inside packages consumed by Next.js must be extensionless.

## Conventions

- Slugs are unique per locale, generated from the name (Turkish characters transliterated) with a numeric suffix on collision; an explicitly provided slug that collides is a 409.
- Product/category content (name, slug, description) lives in translation tables; both `tr` and `en` are mandatory on every write.
- Admin routes require `role=admin` (JWT in the `catalog_session` httpOnly cookie). Missing cookie → 401, wrong role → 403. The Next.js middleware redirect for `/admin` is UX only; the API is the security boundary.
- Error responses use the shape `{ statusCode, code, message }` produced by the shared error handler; throw `DomainError` subclasses from `apps/api/src/shared/domain/errors.ts`.
- After content mutations the API notifies `POST {web}/api/revalidate` (shared secret, cache tags `products` / `categories`); the 300s fetch revalidate window is the fallback.

## Environment Variables

All API env vars are validated at boot by `apps/api/src/config.ts` (zod, fail-fast). Empty strings are treated as unset.

| Variable | App | Purpose |
| --- | --- | --- |
| `NODE_ENV` | api | `production` switches to JSON logs and `Secure` cookies |
| `PORT`, `HOST` | api | Fastify listen address (default `3001` / `0.0.0.0`) |
| `DATABASE_URL` | api, db | Postgres connection string (drizzle-kit reads it from `packages/db/.env`) |
| `JWT_SECRET` | api | Signs session JWTs. Anyone holding it can forge admin tokens — most critical secret |
| `COOKIE_SECRET` | api | `@fastify/cookie` signing secret |
| `WEB_ORIGIN` | api | The only origin allowed by CORS with credentials |
| `REVALIDATE_URL` | api | Web endpoint the API calls after content mutations |
| `REVALIDATE_SECRET` | api, web | Shared secret for the revalidation webhook — must match in both apps |
| `IMAGEKIT_PUBLIC_KEY` / `IMAGEKIT_PRIVATE_KEY` / `IMAGEKIT_URL_ENDPOINT` | api | Storage adapter credentials. Private key never reaches the browser. When unset, uploads return 503 |
| `API_URL` / `NEXT_PUBLIC_API_URL` | web | API base URL for server-side / browser fetches |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | web | Base for building image delivery URLs in `lib/image.ts` |
| `NEXT_PUBLIC_CONTACT_PHONE` | web | E.164 phone. Empty = all contact UI (header button, product CTA, footer line) stays hidden |
| `NEXT_PUBLIC_SITE_URL` | web | Canonical origin for metadata, hreflang and sitemap |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | db | Credentials for the seeded admin user |

Secrets in `.env` files are dev-only values; regenerate all of them for production and never commit `.env` files.

## Change Checklists

Follow these whenever you extend the project. Skipping a step leaves stale caches, missing translations, or unvalidated config behind.

**Adding a new bounded context / module (`apps/api/src/contexts/<name>`)**
1. Create the four layers (`domain / application / infrastructure / presentation`) plus an `index.ts` composition root; register it in `app.ts` under the `/api/v1` scope.
2. Guard non-public routes with `requireRole('admin')` (or `requireAuth`).
3. If its mutations affect publicly rendered content: record domain events in the aggregate, then subscribe them in `apps/api/src/shared/infrastructure/revalidate-webhook.ts` with the right cache tags. A module whose changes never reach the public site needs no revalidation wiring.
4. If it exposes data to the web app: define its cache tag(s), use them in `apps/web/src/lib/api.ts` fetches, and keep tag names consistent between webhook and fetches.

**Adding/changing an entity or table**
1. Update `packages/db/src/schema/`, run `pnpm db:generate`, commit the migration.
2. Localized user-facing content gets a `<entity>_translations` table (`locale` enum, unique `(entityId, locale)`, unique `(locale, slug)` if routed) — both `tr` and `en` are mandatory on write, enforced via `TranslationSet` in the domain.
3. Update `packages/contracts` schemas, repository/mapper, query service, and the seed script in `packages/db/seed.ts`.
4. If the entity has public pages: add cache tags + revalidation subscriptions, and extend `apps/web/src/app/sitemap.ts`.

**Adding an environment variable**
1. Add it to the zod schema in `apps/api/src/config.ts` (or read it via `process.env` in web with a sensible default).
2. Add it to the relevant `.env.example` file(s) with an English comment.
3. If it affects build output, add it to `globalEnv` in `turbo.json`.
4. Document it in the table above and, if deploy-relevant, in README's deployment notes.

**Adding UI text**
Add the key to BOTH `apps/web/messages/tr.json` and `en.json` (admin strings under the `admin` namespace). Never hardcode display text.

**Adding a locale**
Extend the `locale` pg enum (migration), `routing.ts` locales, add `messages/<locale>.json`, extend admin form tabs and `TranslationSet` locale list.

**Seed script warning**
`pnpm db:seed` is destructive: it wipes and recreates all rows. Never run it against a database holding real content.
