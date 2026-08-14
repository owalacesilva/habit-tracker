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

`MOCK_PERSONA=power make dev` seeds fixture history for manual testing (see
`src/lib/mocks/personas.ts`).

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
  components/     UI by feature: layout/, journey/, history/, settings/,
                  habits/, progress/, auth/, pwa/, ui/ (shared primitives)
  lib/            Domain logic + data access; i18n/ holds the dictionaries
  types/          Shared types
public/           PWA assets: manifest, sw.js, offline.html, icons
```

The four primary destinations are Home `/`, Journey `/journey`, History `/history` and
Settings `/settings`, behind `BottomNav`. A new screen: add the route, wrap it in
`app-shell app-shell-nav`, open with `ScreenHeader`, render `<BottomNav labels={t.nav} />`
last, and give it `loading.tsx` + `error.tsx` (the latter just renders `RouteError`).

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
- `src/lib/date.ts` owns all date maths. `Weekday` is always **Monday-first (0–6)** — the
  "start the week on Sunday" setting only reorders the _display_, never the stored
  schedule. Dates are serialised as **local** `yyyy-mm-dd` — never `toISOString()`, which
  shifts days.
- **State in the URL, not in the client.** Selected day (`/?date=…`) and History tab
  (`/history?tab=…`) are query params so the server renders them and links can be shared.
- Every list screen ships four states: loaded, **loading** (`SkeletonList`, mirroring the
  final layout), **empty** (`EmptyState`, with the way out) and **error** (`ErrorState`).

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

## 5. Theming

- Light and dark are **one** token set: declare each colour once with
  `light-dark(<light>, <dark>)` in `@theme`. Never write a dark-only rule, a
  `dark:` variant or a second palette — a token that exists in only one theme is a bug.
- The scheme comes from `data-theme` on `<html>`, rendered by the server from the
  `habit_theme` cookie. No theming JavaScript, no flash.
- Text that sits on a coloured fill needs a paired `-on` token (see `--color-chart-*-on`),
  or it will fail contrast in one of the two themes.
- Check both themes before calling a screen done.

---

## 6. Language

- **No user-facing string in a component.** Everything lives in
  `src/lib/i18n/dictionaries/en.ts`, which defines the `Dictionary` type; the other
  languages are typed by it, so a missing key fails `tsc`.
- Server components read copy with `getScreenSettings()` / `getI18n()`. Client components
  receive strings as **props** — never import the dictionary into a client bundle, except
  `useDictionary()` in client-only trees such as `error.tsx`.
- Interpolate with `format()` and count with `plural()`; never concatenate sentences.
- Dates, weekday names and numbers come from `Intl`, not from the dictionary.
- Layout must survive a translation that is twice as long: no fixed widths on text
  containers, wrap or scroll instead of truncating, and keep `text-balance` on headings.

---

## 7. Preferences

- Anything the **server needs for the first paint** (theme, language, week start, reduced
  motion) is a cookie, read only through `src/lib/server-settings.ts`.
- Anything that belongs to the **account** (notifications) goes in a `src/lib` store, like
  habits.
- Writes go through a server action that re-validates (`revalidatePath('/', 'layout')` for
  device settings), and the control updates optimistically with `useOptimistic`.

---

## 8. Tooling ownership

- **Biome** formats and lints `.ts/.tsx/.js/.json/.css`, sorts imports and sorts Tailwind
  classes. Run `make lint-fix`; never hand-format.
- **ESLint** is kept _only_ for `eslint-config-next` (Next.js + React Compiler rules).
  Do not add stylistic rules there — they would fight Biome.
- **Prettier** is Markdown-only. Do not re-add `prettier-plugin-tailwindcss`.
- `biome.json` must contain **no `//` comments**: Biome silently falls back to its default
  style (tabs, double quotes) if it cannot parse the file, which silently reformats the
  whole repository. Explain rules here instead.
- Suppress a rule only with a reason (`// biome-ignore lint/x: why`), and prefer changing
  the code — the a11y and correctness rules have already caught real bugs.

---

## 9. Statistics

- All metrics live in `src/lib/statistics.ts` and are computed over an explicit list of
  days, so periods are data, not branches.
- A period **never extends past today**: counting future days as due makes the completion
  rate fall every morning.
- Rates are always `completed / scheduled`, never `completed / days`, so a habit due three
  times a week is not punished for the other four.
- Streaks are deliberately independent of the selected period.

---

## 10. Fixtures

- Manual-testing data lives in `src/lib/mocks/personas.ts` and is selected with
  `MOCK_PERSONA`. The default persona is `demo` — changing it would rewrite what every
  test and screenshot shows.
- Generators must stay **seeded and deterministic**, so a bug found while testing can be
  reproduced.
- Fixtures may be imported by the seed function and by tests, never by a component.

---

## 11. PWA

- `public/sw.js` is hand-written — no plugin. Bump `CACHE_VERSION` whenever the offline
  shell changes, otherwise clients keep the old cache.
- **Never precache authenticated HTML.** Navigations are network-first with a cache
  fallback; `/api/*` is never cached.
- The service worker registers in **production builds only** — in dev it would serve stale
  bundles.
- Keep `manifest.webmanifest`, the icon set and `metadata`/`viewport` in `layout.tsx` in
  sync (name, colours, icon paths).

---

## 12. Testing

- Jest + Testing Library, tests colocated in `__tests__/` next to the code.
- Test **behaviour through the DOM** (roles, labels, text), not implementation details.
- Domain logic in `src/lib` should stay pure and directly testable — use `__resetStore()`
  in `beforeEach` for habit tests.
- Dates in tests are fixed and constructed locally (`new Date(2025, 2, 13)`), never parsed
  from UTC strings.
- Coverage thresholds are enforced in `jest.config.ts`; raise them as coverage grows,
  never lower them to make a run pass.

---

## 13. Git workflow

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

## 14. Definition of done

1. `make ci` passes (lint + typecheck + tests).
2. New behaviour has tests.
3. No new hex colours, no bare `npm` instructions, no host-only steps.
4. Every user-facing string is in all three dictionaries.
5. The screen was checked in **light and dark**, and in a longer language than English.
6. Loading, empty and error states exist for anything that loads.
7. Interactive targets are ≥ 44 px and icon-only controls have an `aria-label`.
8. `README.md` updated when commands, env vars or structure change.
9. Commit message follows Conventional Commits.
