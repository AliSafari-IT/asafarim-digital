#!/bin/bash
set -euo pipefail

# VPS Docker Cleanup Script
# Removes old Docker images and build cache to free up disk space
# Usage: ./scripts/vps-cleanup.sh [--dry-run] [--force] [--age HOURS]

DEFAULT_AGE_HOURS=3
DRY_RUN=false
FORCE=false
AGE_HOURS=$DEFAULT_AGE_HOURS

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --force)
      FORCE=true
      shift
      ;;
    --age)
      AGE_HOURS="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [--dry-run] [--force] [--age HOURS]"
      echo ""
      echo "Options:"
      echo "  --dry-run    Show what would be cleaned without actually cleaning"
      echo "  --force      Force cleanup regardless of disk space"
      echo "  --age HOURS  Set age threshold (default: $DEFAULT_AGE_HOURS)"
      echo "  -h, --help   Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Configuration
MIN_FREE_SPACE_GB=25
DEPLOY_PATH="/var/repos/asafarim-digital"

echo "🔍 VPS Docker Cleanup Script"
echo "Age threshold: ${AGE_HOURS} hours"
echo "Minimum free space: ${MIN_FREE_SPACE_GB}GB"
echo "Dry run: $DRY_RUN"
echo "Force cleanup: $FORCE"
echo ""

# Check disk space
echo "📊 Checking disk space..."
AVAILABLE_KB=$(df / | tail -1 | awk '{print $4}')
AVAILABLE_GB=$((AVAILABLE_KB / 1024 / 1024))
echo "Available disk space: ${AVAILABLE_GB}GB"

# Determine if cleanup is needed
if [[ "$FORCE" == "true" ]]; then
  echo "⚡ Force cleanup enabled"
  CLEANUP_NEEDED=true
elif [[ $AVAILABLE_GB -lt $MIN_FREE_SPACE_GB ]]; then
  echo "⚠️  Disk space below threshold (${MIN_FREE_SPACE_GB}GB), cleanup needed"
  CLEANUP_NEEDED=true
else
  echo "✅ Sufficient disk space, no cleanup needed"
  CLEANUP_NEEDED=false
fi

if [[ "$CLEANUP_NEEDED" != "true" ]]; then
  exit 0
fi

echo ""
echo "🐳 Docker usage before cleanup:"
cd "$DEPLOY_PATH"
docker system df

echo ""
echo "📋 Docker images (showing oldest 20):"
docker images --format 'table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}\t{{.Size}}' | head -20

# Perform cleanup
echo ""
if [[ "$DRY_RUN" == "true" ]]; then
  echo "🔍 DRY RUN: Showing what would be cleaned..."
  echo "Would run: docker image prune -af --filter \"until=${AGE_HOURS}h\""
  echo "Would run: docker builder prune -af --filter \"until=${AGE_HOURS}h\""
else
  echo "🧹 Cleaning Docker images older than ${AGE_HOURS} hours..."
  docker image prune -af --filter "until=${AGE_HOURS}h"
  
  echo "🧹 Cleaning build cache older than ${AGE_HOURS} hours..."
  docker builder prune -af --filter "until=${AGE_HOURS}h"
fi

# Check results
echo ""
echo "📊 Disk space after cleanup:"
AVAILABLE_KB_AFTER=$(df / | tail -1 | awk '{print $4}')
AVAILABLE_GB_AFTER=$((AVAILABLE_KB_AFTER / 1024 / 1024))
echo "Available disk space: ${AVAILABLE_GB_AFTER}GB"

echo ""
echo "🐳 Docker usage after cleanup:"
docker system df

# Check container health
echo ""
echo "🏥 Checking container health:"
docker compose ps

UNHEALTHY=$(docker compose ps --format json | jq -r 'select(.Health != "healthy" and .State != "running") | .Service' | wc -l)
if [[ $UNHEALTHY -gt 0 ]]; then
  echo "⚠️  Warning: $UNHEALTHY services may be unhealthy"
  echo "Consider running: docker compose up -d"
else
  echo "✅ All services appear healthy"
fi

# Summary
echo ""
echo "📋 Cleanup Summary:"
echo "  Disk space: ${AVAILABLE_GB}GB → ${AVAILABLE_GB_AFTER}GB"
FREED=$((AVAILABLE_GB_AFTER - AVAILABLE_GB))
if [[ $FREED -gt 0 ]]; then
  echo "  Space freed: ${FREED}GB"
else
  echo "  Space freed: ~0GB (images were newer than ${AGE_HOURS}h)"
fi

if [[ "$DRY_RUN" == "true" ]]; then
  echo "  Mode: Dry run (no actual cleanup performed)"
else
  echo "  Mode: Cleanup completed"
fi

echo "✨ Done!"
