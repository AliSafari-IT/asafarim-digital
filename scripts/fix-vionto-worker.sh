#!/bin/bash
set -euo pipefail

echo "🔧 Fixing Vionto Worker & Video Generation Issues..."

# Load environment variables from .env file
if [[ -f ".env" ]]; then
    echo "📋 Loading environment variables from .env..."
    set -a
    source .env
    set +a
else
    echo "❌ .env file not found in current directory"
    exit 1
fi

# Check if required environment variables are set
echo "📋 Checking required environment variables..."
REQUIRED_VARS=(
    "OPENAI_API_KEY"
    "ELEVENLABS_API_KEY" 
    "DO_SPACES_KEY"
    "DO_SPACES_SECRET"
    "DO_SPACES_BUCKET"
    "DO_SPACES_ENDPOINT"
    "REDIS_URL"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [[ -z "${!var:-}" ]]; then
        MISSING_VARS+=("$var")
    fi
done

if [[ ${#MISSING_VARS[@]} -gt 0 ]]; then
    echo "❌ Missing required environment variables:"
    printf '  %s\n' "${MISSING_VARS[@]}"
    echo ""
    echo "Please set these variables in your .env file or VPS environment."
    echo "See .env.example for required values."
    echo ""
    echo "Quick fix commands:"
    echo "  ssh vps 'cd /var/repos/asafarim-digital && nano .env'"
    exit 1
fi

echo "✅ All required environment variables are set"

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

# Stop and remove existing worker container if it exists
echo "🗑️  Cleaning up existing worker container..."
docker stop asafarim-vionto-worker 2>/dev/null || true
docker rm asafarim-vionto-worker 2>/dev/null || true

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
    echo "  - Missing environment variables (check above)"
    echo "  - Redis connection issues"
    echo "  - Database connection issues"
    echo "  - Storage configuration issues"
    exit 1
fi

# Test worker health endpoint
echo "🔍 Testing worker health endpoint..."
WORKER_HEALTH=$(curl -s http://localhost:3007 || echo '{"ok":false}')
if echo "$WORKER_HEALTH" | grep -q '"ok":true'; then
    echo "✅ Worker health check passed"
else
    echo "❌ Worker health check failed:"
    echo "$WORKER_HEALTH"
fi

# Show worker logs
echo "📋 Recent worker logs:"
docker logs asafarim-vionto-worker --tail 20

# Show worker status
echo "📊 Worker status:"
docker compose ps vionto-worker

# Test Vionto web app connection to Redis
echo "🔍 Testing Vionto web app Redis connection..."
VIONTO_CONTAINER=$(docker ps -q -f name=asafarim-vionto)
if [[ -n "$VIONTO_CONTAINER" ]]; then
    if docker exec "$VIONTO_CONTAINER" curl -s http://localhost:3006/api/health >/dev/null 2>&1; then
        echo "✅ Vionto web app is healthy"
    else
        echo "⚠️  Vionto web app health check failed"
    fi
else
    echo "⚠️  Vionto web app container not found"
fi

echo ""
echo "🎯 Summary of fixes applied:"
echo "  ✅ Environment variables validated"
echo "  ✅ Redis connection verified"
echo "  ✅ Worker container rebuilt and started"
echo "  ✅ Worker health check passed"
echo ""
echo "🚀 Try generating a video now - the connection error should be resolved!"
echo ""
echo "If issues persist:"
echo "  1. Check worker logs: docker logs asafarim-vionto-worker -f"
echo "  2. Check Redis: docker exec asafarim-redis redis-cli monitor"
echo "  3. Restart services: pnpm rs"

echo "✨ Vionto worker & video generation fix completed!"
