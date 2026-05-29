# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js App Router project. Pages and route handlers live in `app/`; API endpoints are under `app/api`, while reusable page components are in `app/components`. Shared UI primitives from the shadcn/Radix setup are in `components/ui`. Utilities, Prisma access, proxy logic, validation, and environment helpers live in `lib`. Shared TypeScript types are in `types`. Prisma schema and migrations are in `prisma`, and generated Prisma client files are in `prisma/generated/client`; do not hand-edit generated files. Static assets live in `public`, and sample override data is in `mocks/sample-overrides.json`.

## Build, Test, and Development Commands

- `pnpm install`: install dependencies.
- `pnpm dev`: start the local Next.js dev server.
- `pnpm build`: create a production build and run Next.js compile checks.
- `pnpm start`: serve the production build.
- `pnpm lint`: run ESLint using `eslint.config.mjs`.
- `pnpm db:generate`: regenerate the Prisma client after schema changes.
- `pnpm prisma migrate dev`: create and apply a local Prisma migration.
- `pnpm db:migrate`: apply existing migrations in deployed environments.
- `pnpm db:studio`: open Prisma Studio for database inspection.

## Coding Style & Naming Conventions

Use TypeScript with strict mode and the `@/*` path alias. Follow the existing React style: PascalCase component names, camelCase variables, and descriptive API route segment names. Keep shadcn-style primitives in `components/ui` and app-specific components in `app/components`. Prefer double quotes and semicolons where the surrounding file already uses them; preserve local style when editing older files that differ. Run `pnpm lint` before submitting changes.

## Testing Guidelines

No dedicated test framework is configured yet. For now, treat `pnpm lint` and `pnpm build` as required verification. When adding tests, colocate them near the code they cover or use a clear `__tests__` directory, and name files with the feature under test, such as `matching.test.ts` or `OverrideForm.test.tsx`.

## Commit & Pull Request Guidelines

Recent commits use short imperative subjects with optional conventional prefixes, for example `fix: restrict IP request override data`, `chore: add override form validation`, and `docs: update README.md`. Keep commits focused and describe user-visible behavior when relevant. Pull requests should include a concise summary, linked issue if available, verification commands, migration notes when `prisma/schema.prisma` changes, and screenshots for UI changes.

## Security & Configuration Tips

Copy `.env.example` to `.env` for local setup. `DATABASE_URL` is required, and `BASE_APIS` uses comma-separated `key:url` pairs such as `dog:https://api.dog.com,cat:https://api.cat.com`. Never commit real database credentials or production API secrets.
