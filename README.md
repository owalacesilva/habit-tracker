# Habit Tracker

A mobile-first **Progressive Web App** for building daily routines — tick off habits, keep
streaks alive and review your week. Built with Next.js (App Router), NextAuth, Tailwind CSS
and Jest, and running **entirely inside Docker**.

> The host machine only needs **Docker** and **make**. No Node.js, no `npm install`.

---

## Table of contents

- [Screens](#screens)
- [Stack](#stack)
- [Quick start](#quick-start)
- [Make targets](#make-targets)
- [Environment variables](#environment-variables)
- [Project structure](#project-structure)
- [Design system](#design-system)
- [Theming](#theming)
- [Internationalization](#internationalization)
- [Settings and persistence](#settings-and-persistence)
- [PWA](#pwa)
- [Authentication](#authentication)
- [Testing](#testing)
- [Code quality & git hooks](#code-quality--git-hooks)
- [Docker layout](#docker-layout)
- [Production](#production)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)

---

## Screens

Four primary destinations behind a persistent bottom navigation, plus two full-screen
sheets. The visual language follows the reference UX: warm sand canvas, white cards,
orange primary action, soft rounding.

| Route                    | What it does                                                                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/` **Home**             | Greeting, week strip, reminder banner, habit checklist on a dotted timeline, `+` FAB.                                                                                          |
| `/journey` **Journey**   | Guided programmes. A **Recommended for you** section (outlined cards, badge) sits above the full catalogue; each card carries duration, habit count, level and progress.       |
| `/history` **History**   | Three tabs — **Statistics** (weekly chart, points, share), **All Habits** (schedule, streak, completion rate), **My Achievements** (unlocked and locked badges with progress). |
| `/settings` **Settings** | Appearance, Language, Notifications, Social (share / rate / feedback) and General.                                                                                             |
| `/habits/new`            | New habit sheet — name, optional goal, repeat days, reminders.                                                                                                                 |
| `/login`                 | Sign-in for the credentials provider (demo account shown on the page).                                                                                                         |

Navigation state lives in the URL: the week strip links to `/?date=yyyy-mm-dd` and the
History tabs to `/history?tab=…`, so every view is server-rendered, shareable and
bookmarkable. `/progress` permanently redirects to `/history?tab=statistics`.

Every list screen handles **loading** (skeletons that mirror the final layout),
**empty** (an explanation plus the way out) and **error** (an alert with a retry) states.

## Stack

| Concern       | Choice                                                           |
| ------------- | ---------------------------------------------------------------- |
| Framework     | Next.js 16 (App Router, React 19, Server Actions)                |
| Language      | TypeScript 5.9 (strict)                                          |
| Styling       | Tailwind CSS 4 (CSS-first tokens in `src/app/globals.css`)       |
| Auth          | NextAuth v5 (JWT sessions, credentials + optional GitHub)        |
| Validation    | zod 4                                                            |
| i18n          | Typed dictionaries (en, pt-BR, es) — no runtime dependency       |
| Theming       | CSS `light-dark()` tokens, persisted in a cookie                 |
| PWA           | Hand-written service worker + web app manifest                   |
| Tests         | Jest 30 + Testing Library (jsdom)                                |
| Quality gates | ESLint 9 (flat config), Prettier, Husky, lint-staged, commitlint |
| Runtime       | Docker (Node 24 Alpine, multi-stage) + docker compose + Make     |

---

## Quick start

```bash
make env        # create .env.local from .env.example
make secret     # print an AUTH_SECRET — paste it into .env.local
make install    # install dependencies inside the container (creates package-lock.json)
make dev        # http://localhost:3000
make hooks      # one-off: install the git hooks
```

Sign in with the demo account (also printed on the login screen):

```
demo@habit.app / demo1234
```

First run pulls `node:24-alpine` and installs dependencies, so expect a couple of minutes.
Later runs are cached.

---

## Make targets

`make` on its own prints this list.

| Target             | Description                                            |
| ------------------ | ------------------------------------------------------ |
| `make env`         | Create `.env.local` from `.env.example`                |
| `make secret`      | Generate a random `AUTH_SECRET`                        |
| `make install`     | `npm install` inside the container                     |
| `make add PKG="x"` | Add a dependency (`DEV=1` for a devDependency)         |
| `make dev` / `up`  | Start the dev server with hot reload                   |
| `make down`        | Stop and remove the dev containers                     |
| `make logs`        | Tail container logs                                    |
| `make shell`       | Shell into the app container                           |
| `make lint`        | ESLint (`lint-fix` to autofix)                         |
| `make format`      | Prettier write (`format-check` to verify)              |
| `make typecheck`   | `tsc --noEmit`                                         |
| `make test`        | Jest (`test-watch`, `test-ci` for coverage)            |
| `make ci`          | lint + typecheck + tests in a clean container          |
| `make hooks`       | Install the Husky git hooks                            |
| `make doctor`      | Check hooks, Docker and file ownership                 |
| `make fix-perms`   | Give the repo back to your user after a root container |
| `make prod`        | Build and run the production image                     |
| `make prod-down`   | Stop the production stack                              |
| `make clean`       | Remove containers                                      |
| `make reset`       | Remove containers, volumes and local images            |

---

## Environment variables

Copy `.env.example` → `.env.local` (git-ignored) with `make env`.

| Variable                                  | Required | Purpose                                             |
| ----------------------------------------- | -------- | --------------------------------------------------- |
| `AUTH_SECRET`                             | yes      | Signs the session JWT — generate with `make secret` |
| `AUTH_URL`                                | yes      | Public origin, e.g. `http://localhost:3000`         |
| `AUTH_TRUST_HOST`                         | yes      | `true` behind Docker/proxies                        |
| `DEMO_USER_EMAIL` / `_PASSWORD` / `_NAME` | no       | Seed account for the credentials provider           |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`   | no       | Enables the GitHub provider when **both** are set   |
| `APP_PORT`                                | no       | Host port to publish (default `3000`)               |
| `NEXT_PUBLIC_APP_STORE_URL`               | no       | Store listing opened by "Rate the app"              |
| `NEXT_PUBLIC_FEEDBACK_EMAIL`              | no       | Recipient of "Send feedback"                        |

---

## Project structure

```
.
├── Dockerfile                 # base → deps → dev / ci / builder → runner
├── eslint.config.mjs          # ESLint flat config (next + prettier)
├── docker-compose.yml         # dev stack (hot reload, bind mount)
├── docker-compose.prod.yml    # production stack (standalone server)
├── Makefile                   # the only entry point you need
├── CLAUDE.md                  # engineering rules for this repo
├── .gitattributes             # pins LF so hooks never get CRLF
├── scripts/in-container.sh    # run any command inside the app container
├── public/
│   ├── manifest.webmanifest   # PWA manifest
│   ├── sw.js                  # service worker (offline shell + caching)
│   ├── offline.html           # offline fallback page
│   └── icons/                 # 192, 512, maskable, apple-touch
└── src/
    ├── app/
    │   ├── globals.css        # Tailwind entry + design tokens (@theme)
    │   ├── layout.tsx         # theme + language attributes, fonts, metadata
    │   ├── page.tsx           # Home — daily routine
    │   ├── actions.ts         # server actions (toggle habit, create habit)
    │   ├── journey/           # Journey screen + start action, loading, error
    │   ├── history/           # History screen (three tabs), loading, error
    │   ├── settings/          # Settings screen + preference actions
    │   ├── habits/new/        # new habit sheet
    │   ├── progress/          # redirect → /history?tab=statistics
    │   ├── login/             # sign-in page + action
    │   └── api/
    │       ├── auth/[...nextauth]/route.ts
    │       └── health/route.ts   # probed by the Docker healthcheck
    ├── auth.config.ts         # edge-safe NextAuth config (middleware)
    ├── auth.ts                # providers, handlers, requireUser()
    ├── proxy.ts               # route protection (Next 16 renamed middleware → proxy)
    ├── components/
    │   ├── layout/            # bottom-nav, screen-header, sheet-header, route-error
    │   ├── journey/           # journey-card, journey-list
    │   ├── history/           # statistics / habits / achievements panels
    │   ├── settings/          # sections, rows, choice group, switches, rate button
    │   └── ui/                # button, tabs, states, switch, share-button, fields
    ├── lib/
    │   ├── i18n/              # config, dictionaries (en, pt-BR, es), client hook
    │   ├── journeys.ts        # catalogue, recommendations, enrolment
    │   ├── achievements.ts    # badges derived from habit data
    │   ├── notifications.ts   # per-user notification preferences
    │   ├── theme.ts           # theme cookie
    │   ├── general-settings.ts# week start, reduce motion
    │   ├── server-settings.ts # single cookie read per request
    │   └── habits.ts, users.ts, date.ts, utils.ts
    └── types/                 # domain + NextAuth type augmentation
```

---

## Design system

Tailwind v4 is CSS-first: tokens live in the `@theme` block of `src/app/globals.css` (there
is no `tailwind.config.ts`) and **components never hardcode hex values**.

| Token                              | Value                               | Used for         |
| ---------------------------------- | ----------------------------------- | ---------------- |
| `--color-canvas`                   | `#FBF4EE`                           | App background   |
| `--color-surface`                  | `#FFFFFF`                           | Cards, inputs    |
| `--color-ink` / `-muted` / `-soft` | `#2F1F17` / `#8C7A6E` / `#B7A99E`   | Text hierarchy   |
| `--color-brand-500` / `-600`       | `#FF6B00` / `#E85F00`               | Primary actions  |
| `--color-peach`                    | `#FBD8BB`                           | Reminder banner  |
| `--color-habit-*`                  | pastels                             | Habit icon tiles |
| `--color-chart-*`                  | brown / burnt orange / olive / pink | Progress columns |

Each token generates utilities automatically — `--color-canvas` → `bg-canvas`,
`--radius-card` → `rounded-card`, `--shadow-fab` → `shadow-fab`, `--container-app` →
`max-w-app`.

Conventions: `rounded-card` for cards and inputs, `rounded-sheet` for bottom sheets,
`rounded-pill` for buttons and day circles; `shadow-card` for elevation and `shadow-fab`
for the floating action button. Screens are wrapped in `.app-shell`, a centred phone-width
column (`max-w-app`) that respects safe-area insets.

---

## Theming

Light and dark share one set of tokens. Each colour is declared once with CSS
`light-dark()`, and the scheme is chosen by a single attribute:

```css
--color-canvas: light-dark(#fbf4ee, #17120f);
```

| `<html>`             | Result                    |
| -------------------- | ------------------------- |
| no attribute         | follows the OS preference |
| `data-theme="light"` | always light              |
| `data-theme="dark"`  | always dark               |

The root layout reads the `habit_theme` cookie on the server and renders the attribute
with the first byte of HTML, so there is no flash of the wrong theme and no theming
JavaScript. Because components only ever use tokens (`bg-canvas`, `text-ink-muted`), a
new screen supports both themes without extra work. The chart adds `--color-chart-*-on`
tokens so the label inside a bar keeps its contrast in either theme.

`Reduce motion` in General settings sets `data-reduce-motion="true"`, which collapses
animations the same way the OS-level `prefers-reduced-motion` does.

---

## Internationalization

English, Portuguese (Brazil) and Spanish ship in the box, with **no i18n dependency**.

- `src/lib/i18n/dictionaries/en.ts` is the source of truth and exports the `Dictionary`
  type. Every other language is typed as `Dictionary`, so a missing or renamed key is a
  **compile error**, and a test asserts key parity and placeholder parity across all three.
- Interpolation is `{placeholder}` + `format()`; counts use `plural(count, one, other)`.
- Server components read the language with `getScreenSettings()`; client components get
  their strings as props. Client-only trees (error boundaries) read `<html lang>` through
  `useDictionary()`.
- Dates, weekday names and numbers come from `Intl`, so they follow the language without
  extra strings.
- Layouts avoid fixed widths: labels wrap, cards grow, and the tab strip scrolls
  horizontally rather than squashing longer translations.

**To add a language**: add the tag to `LOCALES`, copy `en.ts` and translate it, register it
in `src/lib/i18n/index.ts`. It appears in the picker automatically.

---

## Settings and persistence

| Setting                             | Stored in                  | Why                                             |
| ----------------------------------- | -------------------------- | ----------------------------------------------- |
| Theme, language, week start, motion | cookie (1 year)            | The server needs them to render the first paint |
| Notification preferences            | per-user store (`src/lib`) | They belong to the account, not the device      |

Every preference is written by a server action which re-validates the layout, so a change
is reflected across the whole app immediately. Controls update optimistically
(`useOptimistic`) and fall back to the persisted value if the write fails.

The Social section uses platform mechanisms where they exist: **Share** calls
`navigator.share()` and falls back to the clipboard, **Rate the app** opens the store
listing from `NEXT_PUBLIC_APP_STORE_URL` (and explains itself when unset), and
**Send feedback** opens the user's mail client at `NEXT_PUBLIC_FEEDBACK_EMAIL`.

---

## PWA

- `public/manifest.webmanifest` — standalone display, portrait, theme `#FBF4EE`, app
  shortcuts for **New habit** and **Progress**.
- `public/sw.js` — hand-written, no plugin:
  - navigations: network-first → cache → `offline.html`
  - `_next/static`, icons and images: cache-first
  - `/api/*` and non-GET requests: never cached
  - authenticated HTML is never precached
- Registered by `ServiceWorkerRegistration` in **production builds only** (in dev it would
  serve stale bundles). Test it with `make prod`.
- Bump `CACHE_VERSION` in `sw.js` whenever the offline shell changes.

Install prompt: open the production build in Chrome/Edge/Safari → _Install app_ /
_Add to Home Screen_.

---

## Authentication

NextAuth v5 with JWT sessions, split in two files so the proxy stays lightweight and
runtime-agnostic:

- `src/auth.config.ts` — pages, callbacks, `authorized` route guard. No providers, no
  Node APIs.
- `src/auth.ts` — Credentials provider (scrypt hashing + `timingSafeEqual`), optional
  GitHub provider, and `requireUser()` for server components.
- `src/proxy.ts` — Next 16's replacement for `middleware.ts`. Protects everything except
  `/login`, NextAuth routes, the health endpoint and PWA assets.

Route protection is defence in depth: every server action and page also calls
`requireUser()`, so a matcher change can never silently expose a mutation.

The user store (`src/lib/users.ts`) and the habit store (`src/lib/habits.ts`) are
in-memory and reset on restart — they are the single seam to replace with a database.

---

## Testing

```bash
make test        # watch-free run
make test-watch  # interactive
make test-ci     # coverage, enforces jest.config.ts thresholds
```

Jest runs through `next/jest` and tests live in `__tests__/` folders next to the code —
245 tests covering:

- **domain logic** — date maths and week-start handling, streaks, weekly completion,
  journey recommendations and progress, achievements, notification preferences,
  scrypt password hashing;
- **i18n** — key and placeholder parity across every language, locale negotiation,
  interpolation and pluralisation;
- **server actions** — habit creation, journey enrolment, every preference write
  (with `next/headers`, `next/cache` and `@/auth` mocked);
- **components** — navigation active state, tabs, journey cards and the recommended
  section, history panels, settings rows and controls, optimistic toggles and their
  rollback, sharing with its clipboard fallback, empty/loading/error states.

Route files (`page.tsx`, `layout.tsx`, API handlers, `proxy.ts`) are excluded from
coverage — they need a server runtime, so they are verified by running the app rather
than by jsdom.

---

## Code quality & git hooks

`make hooks` installs Husky. The hooks run **inside the container**, so no host toolchain
is required:

| Hook         | Runs                                            |
| ------------ | ----------------------------------------------- |
| `pre-commit` | lint-staged → ESLint + Prettier on staged files |
| `commit-msg` | commitlint (Conventional Commits)               |
| `pre-push`   | `tsc --noEmit` + Jest                           |

Commit messages follow Conventional Commits: `feat:`, `fix:`, `docs:`, `style:`,
`refactor:`, `perf:`, `test:`, `build:`, `ci:`, `chore:`, `revert:`.

---

## Docker layout

`Dockerfile` is multi-stage and every stage has one job:

| Stage     | Purpose                                                                 |
| --------- | ----------------------------------------------------------------------- |
| `base`    | `node:22-alpine`, workdir, telemetry off                                |
| `deps`    | `npm ci` (or `npm install`) with a BuildKit npm cache mount             |
| `dev`     | Dev server; compose bind-mounts the source over it                      |
| `ci`      | lint + typecheck + tests in one shot (`make ci`)                        |
| `builder` | `next build` with `output: 'standalone'`                                |
| `runner`  | Minimal runtime: standalone server, non-root `nextjs` user, healthcheck |

`docker-compose.yml` mounts the repository at `/app` and keeps `node_modules` and `.next`
in **named volumes**, so container-built artefacts never clash with the host. File
watching uses polling (`WATCHPACK_POLLING`) because bind mounts on WSL2/macOS do not emit
reliable inotify events.

The two stacks use different Compose project names (`habit-tracker` and
`habit-tracker-prod`) so they can run side by side, and so tooling that execs into the
running `app` service always lands in the dev container.

---

## Production

```bash
make prod        # build the standalone image and start it detached
make prod-logs   # follow logs
make prod-down   # stop
```

The runtime image runs `node server.js` as the non-root `nextjs` user and exposes
`/api/health`, which the Docker `HEALTHCHECK` polls.

Before deploying: set a real `AUTH_SECRET`, point `AUTH_URL` at the public origin, and
serve over HTTPS (service workers and installability require a secure context).

---

## Troubleshooting

| Symptom                                     | Fix                                                                                                                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Changes not picked up                       | Polling is on by default; if it still lags, `make down && make dev`                                                                                                 |
| `Cannot find module` after adding a package | `make install` (dependencies live in a named volume, not the host)                                                                                                  |
| Port 3000 already in use                    | `APP_PORT=3001 make dev`                                                                                                                                            |
| Auth errors on boot                         | `AUTH_SECRET` missing — `make secret` and add it to `.env.local`                                                                                                    |
| Old UI after a deploy                       | Bump `CACHE_VERSION` in `public/sw.js`                                                                                                                              |
| Hooks fail with "docker is required"        | Start Docker, or re-run `make hooks`                                                                                                                                |
| Stale build state                           | `make reset` (removes containers, volumes and local images)                                                                                                         |
| **Hooks never run at all**                  | `core.hooksPath` lives in `.git/config` and is not cloned — run `make hooks`, then `make doctor`. In JetBrains IDEs, also tick _Run Git hooks_ in the commit dialog |
| **`git commit` → "Permission denied"**      | A root container left root-owned files in `.git` — `make fix-perms`                                                                                                 |
| Hook dies with `bad interpreter: sh^M`      | CRLF checkout; `.gitattributes` pins LF — `git add --renormalize .`                                                                                                 |
| Anything hook-related behaving oddly        | `make doctor` checks all four causes at once                                                                                                                        |

---

## Roadmap

The stores in `src/lib` are intentionally the only seam that knows about persistence:

1. Swap the in-memory stores for Postgres (Prisma or Drizzle) + a NextAuth adapter.
2. Real reminders via the Web Push API (the service worker is already in place).
3. Habit detail and edit screens, plus the "See all" list.
4. Real goal tracking (target date and amount are captured but not yet persisted).
5. Playwright end-to-end tests running in the same container setup.
