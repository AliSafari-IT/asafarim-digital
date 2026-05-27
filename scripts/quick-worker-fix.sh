#!/bin/bash
set -euo pipefail

echo "🔧 Quick Vionto Worker Fix..."

# Stop and remove existing worker container if it exists
echo "🗑️  Cleaning up existing worker container..."
docker stop asafarim-vionto-worker 2>/dev/null || true
docker rm asafarim-vionto-worker 2>/dev/null || true

# Check Redis connection
echo "🔍 Checking Redis connection..."
if ! docker exec asafarim-redis redis-cli ping >/dev/null 2>&1; then
    echo "❌ Redis is not responding. Starting Redis..."
    docker compose up -d redis
    sleep 5
fi

if docker exec asafarim-redis redis-cli ping >/dev/null 2>&1; then
    echo "✅ Redis is healthy"
else
    echo "❌ Redis connection failed. Please check Redis configuration."
    exit 1
fi

# Rebuild and start the worker
echo "🔨 Rebuilding and starting vionto-worker..."
docker compose up -d --build vionto-worker

# Wait for worker to be healthy
echo "⏳ Waiting for worker to become healthy..."
WORKER_HEALTHY=false
for i in {1..30}; do
    if curl -f http://localhost:3007 >/dev/null 2>&1; then
        echo "✅ Worker is healthy!"
        WORKER_HEALTHY=true
        break
    fi
    echo "Attempt $i/30: Worker not ready yet, waiting 5s..."
    sleep 5
done

if [[ "$WORKER_HEALTHY" != "true" ]]; then
    echo "❌ Worker failed to become healthy. Showing logs:"
    docker logs asafarim-vionto-worker --tail 50
    echo ""
    echo "Common issues:"
    echo "  - Missing environment variables"
    echo "  - Redis connection issues"
    echo "  - Database connection issues"
    echo "  - Storage configuration issues"
    echo ""
    echo "To check environment variables, run:"
    echo "  docker logs asafarim-vionto-worker | grep -i error"
    exit 1
fi

# Show worker logs
echo "📋 Recent worker logs:"
docker logs asafarim-vionto-worker --tail 20

# Show worker status
echo "📊 Worker status:"
docker compose ps vionto-worker

echo ""
echo "✅ Vionto worker fix completed!"
echo "🚀 Try generating a video now - the connection error should be resolved!"
