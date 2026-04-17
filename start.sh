#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

print_usage() {
  cat <<EOF
Usage: ./start.sh [COMMAND] [OPTIONS]

Commands:
  install       Install dependencies using pnpm
  build         Build all apps (requires dependencies installed)
  dev           Start development servers for all apps
  dev:portal    Start only the portal app in development mode
  dev:ops       Start only the ops-hub app in development mode
  db:push       Sync Prisma schema to local database
  db:seed       Re-run the database seed (idempotent upserts)
  db:reset      Drop & recreate local DB, apply schema, then seed
  clean         Remove node_modules, .next, and .turbo directories

Options:
  --help        Show this help message

Examples:
  ./start.sh install
  ./start.sh install build
  ./start.sh install dev
  ./start.sh dev
  ./start.sh clean

Default behavior (no args): runs 'install dev'
EOF
}

APP_DIRS=("apps/portal" "apps/content-generator" "apps/ops-hub")
PACKAGE_DIRS=("packages/auth" "packages/db" "packages/ui" "packages/types" "packages/config")

test_workspace_ready() {
  for dir in "${APP_DIRS[@]}" "${PACKAGE_DIRS[@]}"; do
    pkg_json="$SCRIPT_DIR/$dir/package.json"
    [ -f "$pkg_json" ] || continue
    if grep -qE '"(dependencies|devDependencies)"' "$pkg_json"; then
      if [ ! -d "$SCRIPT_DIR/$dir/node_modules" ]; then
        echo "  ⚠️  Missing node_modules in $dir"
        return 1
      fi
    fi
  done
  [ -d "$SCRIPT_DIR/node_modules/.pnpm" ] || return 1
  return 0
}

invoke_prisma_generate() {
  echo "🧬 Generating Prisma client..."
  pnpm --filter @asafarim/db exec prisma generate || \
    echo "⚠️  Prisma generate failed (likely file lock). Retry after closing dev servers."
}

run_install() {
  echo "� Installing dependencies (workspace)..."
  if ! pnpm install; then
    echo "⚠️  pnpm install failed. Retrying with --ignore-scripts..."
    pnpm install --ignore-scripts || { echo "❌ pnpm install failed"; exit 1; }
    invoke_prisma_generate
  fi
  if ! test_workspace_ready; then
    echo "⚠️  Some workspace packages are missing node_modules. Re-running install..."
    pnpm install --ignore-scripts
    invoke_prisma_generate
  fi
  echo "✅ Dependencies installed"
}

confirm_deps() {
  if ! test_workspace_ready; then
    echo "🔎 Workspace not fully installed. Installing..."
    run_install
  fi
}

run_build() {
  echo "🔨 Building all apps..."
  pnpm build
  echo "✅ Build complete"
}

run_dev() {
  confirm_deps
  echo "🚀 Starting development servers..."
  pnpm dev
}

run_dev_portal() {
  confirm_deps
  echo "🚀 Starting portal development server..."
  pnpm dev:portal
}

run_dev_ops() {
  confirm_deps
  echo "🚀 Starting ops-hub development server..."
  pnpm dev:ops
}

run_clean() {
  echo "🧹 Cleaning up..."
  pnpm clean
  echo "✅ Cleanup complete"
}

get_database_url() {
  if [ -f "$SCRIPT_DIR/.env" ]; then
    local line
    line=$(grep -E "^\s*DATABASE_URL\s*=" "$SCRIPT_DIR/.env" | head -n1 || true)
    if [ -n "$line" ]; then
      echo "${line#*=}" | sed 's/^[[:space:]]*//; s/[[:space:]]*$//'
      return 0
    fi
  fi
  if [ -n "${DATABASE_URL:-}" ]; then
    echo "$DATABASE_URL"
    return 0
  fi
  echo "[db] DATABASE_URL not found in root .env or environment." >&2
  exit 1
}

run_db_push() {
  confirm_deps
  DATABASE_URL="$(get_database_url)" pnpm --filter @asafarim/db exec prisma db push
}

run_db_seed() {
  confirm_deps
  DATABASE_URL="$(get_database_url)" pnpm --filter @asafarim/db db:seed
}

run_db_reset() {
  confirm_deps
  local url
  url="$(get_database_url)"
  echo "[db:reset] Force-resetting database..."
  DATABASE_URL="$url" pnpm --filter @asafarim/db exec prisma db push --force-reset --accept-data-loss
  DATABASE_URL="$url" pnpm --filter @asafarim/db db:seed
}

if [ $# -eq 0 ]; then
  run_install
  run_dev
  exit 0
fi

while [ $# -gt 0 ]; do
  case "$1" in
    install)
      run_install
      ;;
    build)
      run_build
      ;;
    dev)
      run_dev
      ;;
    dev:portal)
      run_dev_portal
      ;;
    dev:ops)
      run_dev_ops
      ;;
    db:push)
      run_db_push
      ;;
    db:seed)
      run_db_seed
      ;;
    db:reset)
      run_db_reset
      ;;
    clean)
      run_clean
      ;;
    --help|-h)
      print_usage
      exit 0
      ;;
    *)
      echo "❌ Unknown command: $1"
      print_usage
      exit 1
      ;;
  esac
  shift
done
