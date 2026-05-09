# Docker Maintenance

The VPS has limited disk. Run a safe Docker cleanup after deployments and keep
container logs capped so the host does not fill up during builds.

## After Deploy

```bash
sh scripts/docker-post-deploy-prune.sh
```

The script removes stopped containers, unused images, unused networks, and build
cache older than 24 hours. It does not prune Docker volumes unless explicitly
enabled:

```bash
PRUNE_VOLUMES=1 sh scripts/docker-post-deploy-prune.sh
```

Use volume pruning carefully because unused named volumes can still contain data
you may want to keep.

## Daily Prune Timer

Install the timer on the VPS:

```bash
sudo cp infra/systemd/asafarim-docker-prune.service /etc/systemd/system/
sudo cp infra/systemd/asafarim-docker-prune.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now asafarim-docker-prune.timer
systemctl list-timers asafarim-docker-prune.timer
```

The timer runs the same safe prune script daily and leaves volumes alone.

## Build Cache

Prefer building in CI and pushing images to a registry. If the VPS must build
locally, keep the BuildKit cache short-lived:

```bash
BUILD_CACHE_UNTIL=6h sh scripts/docker-post-deploy-prune.sh
```

## Logs

`docker-compose.yml` caps JSON container logs at `10m` per file with `3` files
per service. That limits each service to roughly 30 MB of Docker-managed logs.
