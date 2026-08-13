#!/usr/bin/env sh
# Run a command inside the app container.
#
# Prefers `exec` when the dev stack is already up (instant, shares the warm
# node_modules volume) and falls back to a throwaway `run` container.
#
# Git hooks call this directly, so the host UID/GID are resolved here too — not
# only in the Makefile. Running as root would leave root-owned files in the
# bind-mounted repo (including .git), which breaks the developer's own git.
set -e

SERVICE=app

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required — every command in this project runs in a container." >&2
  echo "Start Docker and retry, or bypass hooks once with: git commit --no-verify" >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "The Docker daemon is not reachable." >&2
  echo "Start Docker and retry, or bypass hooks once with: git commit --no-verify" >&2
  exit 1
fi

HOST_UID=$(id -u)
HOST_GID=$(id -g)
export HOST_UID HOST_GID

if docker compose ps --status running --services 2>/dev/null | grep -qx "$SERVICE"; then
  exec docker compose exec -T --user "$HOST_UID:$HOST_GID" "$SERVICE" "$@"
fi

exec docker compose run --rm --no-deps --user "$HOST_UID:$HOST_GID" "$SERVICE" "$@"
