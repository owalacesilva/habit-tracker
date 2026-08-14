# syntax=docker/dockerfile:1.7
# ---------------------------------------------------------------------------
# Every build/run step of this project happens inside these stages.
# Nothing (npm install included) is expected to run on the host machine.
# ---------------------------------------------------------------------------
ARG NODE_VERSION=24.14.0

# --------------------------------- base ------------------------------------
FROM node:${NODE_VERSION}-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache libc6-compat
WORKDIR /app

# --------------------------------- deps ------------------------------------
# Isolated so dependency installs are cached until the manifests change.
FROM base AS deps
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then npm ci; else npm install; fi

# ---------------------------------- dev ------------------------------------
# Used by docker-compose for local development (source is bind-mounted over it).
#
# Runs as the HOST user: anything this container writes into the bind mount
# (package-lock.json, .husky/_, and — via lint-staged — .git objects and the
# index) must stay owned by the developer, or their own git commands start
# failing with "Permission denied".
FROM base AS dev
ARG UID=1000
ARG GID=1000
ENV NODE_ENV=development \
    HOME=/home/app
# git is needed so `npm run prepare` can install the Husky hooks. The bind-mounted
# repo is owned by the host user, so git needs an explicit ownership exception.
RUN apk add --no-cache git \
    && git config --system --add safe.directory /app \
    # Pre-create every path that gets a named volume, owned by the run user:
    # Docker seeds a fresh volume from the image, root-owned dirs included.
    && mkdir -p /home/app/.npm /app/.next \
    && chown -R ${UID}:${GID} /home/app /app
COPY --from=deps --chown=${UID}:${GID} /app/node_modules ./node_modules
COPY --chown=${UID}:${GID} . .
USER ${UID}:${GID}
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---------------------------------- ci -------------------------------------
# Lint + types + unit tests in one shot: `make ci`.
FROM base AS ci
ARG UID=1000
ARG GID=1000
ENV NODE_ENV=development \
    CI=true \
    HOME=/home/app
RUN apk add --no-cache git \
    && git config --system --add safe.directory /app \
    && mkdir -p /home/app/.npm \
    && chown -R ${UID}:${GID} /home/app /app
COPY --from=deps --chown=${UID}:${GID} /app/node_modules ./node_modules
COPY --chown=${UID}:${GID} . .
USER ${UID}:${GID}
CMD ["sh", "-c", "npm run lint && npm run typecheck && npm run test:ci"]

# -------------------------------- builder ----------------------------------
FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NextAuth requires a secret at build time; the real one is injected at runtime.
ARG AUTH_SECRET=build-time-placeholder-secret
ENV AUTH_SECRET=${AUTH_SECRET}
# Inlined into the client bundle by Next, so they belong to the build.
ARG NEXT_PUBLIC_DATA_SOURCE=indexeddb
ARG NEXT_PUBLIC_API_URL=
ENV NEXT_PUBLIC_DATA_SOURCE=${NEXT_PUBLIC_DATA_SOURCE} \
    NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm run build

# -------------------------------- runner -----------------------------------
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
