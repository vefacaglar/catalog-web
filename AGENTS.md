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
