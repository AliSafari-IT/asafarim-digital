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

run_install() {
  echo "📦 Installing dependencies..."
  pnpm install
  echo "✅ Dependencies installed"
}

run_build() {
  echo "🔨 Building all apps..."
  pnpm build
  echo "✅ Build complete"
}

run_dev() {
  echo "🚀 Starting development servers..."
  pnpm dev
}

run_dev_portal() {
  echo "🚀 Starting portal development server..."
  pnpm dev:portal
}

run_clean() {
  echo "🧹 Cleaning up..."
  pnpm clean
  echo "✅ Cleanup complete"
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
