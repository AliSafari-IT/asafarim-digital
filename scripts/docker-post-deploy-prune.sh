#!/usr/bin/env sh
set -eu

# Safe post-deploy Docker cleanup for small VPS hosts.
# Keeps running containers and named volumes. Set PRUNE_VOLUMES=1 only when you
# explicitly want Docker to remove unused volumes too.

BUILD_CACHE_UNTIL="${BUILD_CACHE_UNTIL:-24h}"

echo "[docker-prune] Disk before cleanup"
df -h /
docker system df || true

echo "[docker-prune] Removing stopped containers"
docker container prune -f

echo "[docker-prune] Removing dangling and unused images"
docker image prune -af

echo "[docker-prune] Removing unused build cache older than ${BUILD_CACHE_UNTIL}"
docker builder prune -af --filter "until=${BUILD_CACHE_UNTIL}"

echo "[docker-prune] Removing unused networks"
docker network prune -f

if [ "${PRUNE_VOLUMES:-0}" = "1" ]; then
  echo "[docker-prune] Removing unused volumes because PRUNE_VOLUMES=1"
  docker volume prune -f
else
  echo "[docker-prune] Skipping volume prune. Set PRUNE_VOLUMES=1 to enable."
fi

if command -v pnpm >/dev/null 2>&1; then
  echo "[docker-prune] Pruning pnpm store"
  pnpm store prune || true
fi

echo "[docker-prune] Disk after cleanup"
docker system df || true
df -h /
