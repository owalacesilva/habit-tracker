# CLAUDE.md — working rules for this repository

Habit Tracker is a **Next.js PWA** (App Router, TypeScript, Tailwind, NextAuth) that runs
**entirely inside Docker**. These rules are binding for humans and agents alike.

---

## 1. The container rule (non-negotiable)

> Never run `npm`, `npx`, `next`, or `jest` on the host.

Every build, install, test and start goes through the containers. The host only needs
**Docker** and **make**.

```bash
make dev            # start the app (http://localhost:3000)
make install        # add/refresh dependencies (writes package-lock.json)
make add PKG="zod"  # install a package (DEV=1 for a devDependency)
make test           # jest
make lint           # eslint
make typecheck      # tsc --noEmit
make ci             # lint + typecheck + tests, like CI runs it
make doctor         # diagnose hooks / docker / file ownership
```

If a command is missing, add a `make` target that shells into the container — do not
document a bare `npm` command in any file.

`scripts/in-container.sh` picks `docker compose exec` when the dev stack is up and
`docker compose run --rm` otherwise. Reuse it instead of writing raw docker calls.

### Never write to the bind mount as root

The dev and ci containers run as the **host** user (`HOST_UID`/`HOST_GID`, baked in as
build args and passed via compose `user:`). This is not cosmetic:

- `lint-staged` runs inside the container and writes to `.git` (index, objects). As root
  those become root-owned, and the developer's own `git commit` then fails with
  "Permission denied" — the classic "husky is broken" report.
- `npm install` writes `package-lock.json`; a root-owned lockfile cannot be edited by the
  IDE.

Rules: never add `--user 0:0` (or drop `user:`) for anything that touches `/app`; any new
path that gets a named volume must be created **and chowned in the Dockerfile**, because
Docker seeds a fresh volume from the image and would otherwise make it root-owned. Run
`make doctor` after touching Docker or hook wiring; `make fix-perms` repairs a repo that
an older root container already polluted.

Line endings are pinned to LF in `.gitattributes` — a CRLF checkout makes every hook fail
with `bad interpreter: sh^M` inside Alpine.

---

## 2. Architecture

```
src/
  app/            App Router routes; *actions.ts hold server actions
  app/globals.css Tailwind entry + design tokens (@theme)
  auth.config.ts  Lightweight NextAuth config (imported by proxy.ts)
  auth.ts         Full NextAuth setup with providers (Node runtime only)
  proxy.ts        Route protection (Next 16 renamed middleware.ts → proxy.ts)
  components/     UI — grouped by feature (habits/, progress/, ui/, auth/, pwa/)
  lib/            Domain logic + data access (habits.ts, users.ts, date.ts)
  types/          Shared types
public/           PWA assets: manifest, sw.js, offline.html, icons
```

Rules:

- **Server Components by default.** Add `'use client'` only for state, effects or event
  handlers, and keep those components leaf-level.
- **All habit data goes through `src/lib/habits.ts`.** It is the only module that knows
  how habits are stored, so swapping the in-memory store for a database stays a one-file
  change. Never reach into the store from a component.
- **Mutations are server actions** in an `actions.ts` file, validated with **zod**, and
  they call `revalidatePath` for every route they affect.
- Client components receive server actions **as props** (see `HabitRow`) so they stay
  unit-testable without mocking Next internals.
- `src/lib/date.ts` owns all date maths. The week starts on **Monday** (`Weekday` 0–6) and
  dates are serialised as **local** `yyyy-mm-dd` — never `toISOString()`, which shifts days.

---

## 3. Auth

- `auth.config.ts` must stay **dependency-light**: no `node:crypto`, no DB drivers, no
  providers. `proxy.ts` imports it and may run outside the app runtime.
- `auth.ts` holds providers and is imported from Node runtime only.
- Route protection lives in the `authorized` callback + the `proxy.ts` matcher (Next 16
  renamed `middleware.ts` → `proxy.ts`). When you add a public route, update both.
- **The proxy is not the only guard.** Server actions, route handlers and pages call
  `requireUser()` themselves — a matcher change must never be able to expose a mutation.
- Passwords are hashed with `scrypt` and compared with `timingSafeEqual`
  (`src/lib/users.ts`). Never store or log a plaintext password.
- The credentials provider is a **demo seam**. Replace `findUserByEmail` with a real
  lookup when persistence lands; keep the hashing helpers.

---

## 4. Design system

The UI follows the reference UX: warm sand canvas, white cards, orange primary action,
generous rounding.

- **No hex values in components.** Tailwind v4 is CSS-first: every token lives in the
  `@theme` block of `src/app/globals.css` (`--color-canvas`, `--color-ink-muted`,
  `--color-brand-500`, `--radius-card`, `--shadow-fab`, …). Add a token instead of a
  one-off value; there is no `tailwind.config.ts`.
- Radii: `rounded-card` (cards/inputs), `rounded-sheet` (bottom sheets), `rounded-pill`
  (buttons, chips, day circles).
- Primary action = `brand-500` pill, full width, `size="lg"`. Secondary/dark = `ink`.
- Layout is a phone-width column: wrap screens in `.app-shell` (`max-w-app`, centred).
- Every screen must work at 360 px wide and respect `env(safe-area-inset-*)`.
- Interactive targets are **≥ 44 px**. Icon-only controls need an `aria-label`.

---

## 5. PWA

- `public/sw.js` is hand-written — no plugin. Bump `CACHE_VERSION` whenever the offline
  shell changes, otherwise clients keep the old cache.
- **Never precache authenticated HTML.** Navigations are network-first with a cache
  fallback; `/api/*` is never cached.
- The service worker registers in **production builds only** — in dev it would serve stale
  bundles.
- Keep `manifest.webmanifest`, the icon set and `metadata`/`viewport` in `layout.tsx` in
  sync (name, colours, icon paths).

---

## 6. Testing

- Jest + Testing Library, tests colocated in `__tests__/` next to the code.
- Test **behaviour through the DOM** (roles, labels, text), not implementation details.
- Domain logic in `src/lib` should stay pure and directly testable — use `__resetStore()`
  in `beforeEach` for habit tests.
- Dates in tests are fixed and constructed locally (`new Date(2025, 2, 13)`), never parsed
  from UTC strings.
- Coverage thresholds are enforced in `jest.config.ts`; raise them as coverage grows,
  never lower them to make a run pass.

---

## 7. Git workflow

- **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:` …) — enforced by commitlint.
- Hooks (installed by `make install`, or explicitly with `make hooks`):
  - `pre-commit` → lint-staged (eslint + prettier on staged files)
  - `commit-msg` → commitlint
  - `pre-push` → typecheck + tests
- Hooks execute inside the container; the host needs no Node toolchain.
- `core.hooksPath` lives in `.git/config`, which is **not** committed — after a fresh
  clone the hooks are inactive until `make install`/`make hooks` runs. `make doctor` says
  so out loud.
- Never commit `.env.local`, `node_modules/`, `.next/` or `coverage/`.

---

## 8. Definition of done

1. `make ci` passes (lint + typecheck + tests).
2. New behaviour has tests.
3. No new hex colours, no bare `npm` instructions, no host-only steps.
4. `README.md` updated when commands, env vars or structure change.
5. Commit message follows Conventional Commits.
