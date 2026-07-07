# CLAUDE.md

Read and follow `AGENTS.md` in this directory — it is the canonical guide for architecture, commands, and conventions.

Non-negotiable rules (repeated here for emphasis):

1. All code, docs, error messages, and log messages are English. Turkish appears ONLY in `apps/web/messages/*.json` and database content.
2. Never write code comments. No `//`, no `/* */`, no JSDoc.
3. Every string displayed by the web app (public and admin) comes from next-intl resources in `apps/web/messages/`. Never hardcode display text in components.
4. All API error messages default to English.
5. Respect DDD boundaries: contexts under `apps/api/src/contexts/` never import each other's domain; presentation never touches domain or Drizzle directly; only the media ImageKit adapter and `apps/web/src/lib/image.ts` may reference ImageKit.
6. Before adding a module, entity, env variable, UI text, or locale, follow the matching checklist in AGENTS.md ("Change Checklists"). In particular: any new mutation that affects public content must be wired into the revalidation webhook, and any new env variable must be added to `config.ts` validation and `.env.example`.
7. `pnpm db:seed` wipes the entire database. Never run it when real content exists.

Before finishing any change run: `pnpm lint && pnpm typecheck` (and `pnpm build` for non-trivial changes).
