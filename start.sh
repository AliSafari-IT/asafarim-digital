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
  dev           Start all browser apps plus mobile-next on Android
  dev:web       Start all browser apps without mobile-next Android
  dev:portal    Start only the portal app in development mode
  dev:ops       Start only the ops-hub app in development mode
  dev:edumatch  Start only the edumatch app in development mode
  dev:mobile-next
                Start only the mobile-next app in development mode
  mobile-next:android
                Build mobile-next, sync Capacitor, then open Android Studio
  mobile-next:run:android
                Build mobile-next, sync Capacitor, then run on Android device/emulator
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
  ./start.sh dev:web
  PORT=3002 ./start.sh dev:mobile-next
  ./start.sh mobile-next:android
  ./start.sh mobile-next:run:android
  ./start.sh clean

Default behavior (no args): runs 'install dev'
EOF
}

APP_DIRS=("apps/portal" "apps/content-generator" "apps/ops-hub" "apps/mobile-next")
PACKAGE_DIRS=("packages/auth" "packages/db" "packages/ui" "packages/types" "packages/config")
MOBILE_NEXT_PORT="${PORT:-3002}"

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

run_dev_web() {
  confirm_deps
  echo "🚀 Starting browser development servers..."
  pnpm dev:portal & \
  pnpm --filter content-generator dev & \
  pnpm dev:ops & \
  pnpm --filter edumatch dev & \
  wait
}

run_dev() {
  confirm_deps
  echo "🚀 Starting browser apps and mobile-next Android..."
  pnpm dev:portal & \
  pnpm --filter content-generator dev & \
  pnpm dev:ops & \
  pnpm --filter edumatch dev & \
  pnpm --filter mobile-next exec next dev -H 0.0.0.0 -p "$MOBILE_NEXT_PORT" & \
  sleep 10
  if [ -n "${ANDROID_TARGET:-}" ]; then
    pnpm --dir "$SCRIPT_DIR/apps/mobile-next" exec cap run android --external --target "$ANDROID_TARGET" &
  else
    pnpm --dir "$SCRIPT_DIR/apps/mobile-next" exec cap run android --external &
  fi
  wait
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

start_dev_edumatch() {
  confirm_deps
  echo "🚀 Starting edumatch development server..."
  pnpm --filter edumatch dev
}

start_dev_mobile_next() {
  confirm_deps
  echo "🚀 Starting mobile-next development server on port $MOBILE_NEXT_PORT..."
  pnpm --filter mobile-next exec next dev -p "$MOBILE_NEXT_PORT"
}

build_mobile_next() {
  confirm_deps
  echo "📱 Building mobile-next..."
  pnpm --filter mobile-next build
}

sync_mobile_next_android() {
  build_mobile_next
  echo "🔄 Syncing Capacitor Android project..."
  pnpm --dir "$SCRIPT_DIR/apps/mobile-next" exec cap sync android
}

open_mobile_next_android() {
  sync_mobile_next_android
  echo "🤖 Opening mobile-next Android project in Android Studio..."
  pnpm --dir "$SCRIPT_DIR/apps/mobile-next" exec cap open android
}

run_mobile_next_android() {
  sync_mobile_next_android
  echo "🤖 Running mobile-next Android app on connected device or emulator..."
  pnpm --dir "$SCRIPT_DIR/apps/mobile-next" exec cap run android
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
    dev:web)
      run_dev_web
      ;;
    dev:portal)
      run_dev_portal
      ;;
    dev:ops)
      run_dev_ops
      ;;
    dev:edumatch)
      start_dev_edumatch
      ;;
    dev:mobile-next)
      start_dev_mobile_next
      ;;
    mobile-next:android)
      open_mobile_next_android
      ;;
    mobile-next:run:android)
      run_mobile_next_android
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
