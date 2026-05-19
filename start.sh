#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# =============================================================================
# Configuration
# =============================================================================

# Docker services required by vionto (and any app that needs them)
declare -a DOCKER_SERVICES=(
  "redis-local|redis:7-alpine|6380:6379"
)

# App ports (must match each app's package.json "dev" script)
declare -A APP_PORTS=(
  ["portal"]=3000
  ["content-generator"]=3001
  ["ops-hub"]=3003
  ["marketing-content"]=3004
  ["edumatch"]=3005
  ["vionto"]=3006
)

# Only packages that have a "build" script in their package.json, in dependency order.
# Packages without a build script are source-only and handled by transpilePackages.
declare -a PACKAGES_BUILD_ORDER=(
  "packages/db"
  "packages/auth"
  "packages/payments"
  "packages/ui"
  "packages/navigation"
  "packages/location"
)

DEFAULT_FFMPEG_PATH="C:\\ffmpeg_6may26_full_build\\bin\\ffmpeg.exe"

# =============================================================================
# Logging
# =============================================================================

log_info()  { echo -e "\033[32m[INFO]  $1\033[0m"; }
log_warn()  { echo -e "\033[33m[WARN]  $1\033[0m"; }
log_error() { echo -e "\033[31m[ERROR] $1\033[0m"; }
log_step()  { echo -e "\033[36m\n[STEP]  $1\033[0m"; }
log_app()   { echo -e "\033[35m[APP]   $1\033[0m"; }

show_banner() {
  echo ""
  echo -e "\033[36m+================================================================+\033[0m"
  echo -e "\033[32m|  ASafariM Digital - Monorepo Dev Launcher                      |\033[0m"
  echo -e "\033[36m+================================================================+\033[0m"
  echo ""
  echo -e "\033[90m  Apps:\033[0m"
  for app in "${!APP_PORTS[@]}"; do
    printf "\033[90m    %-22s -> http://localhost:%s\033[0m\n" "$app" "${APP_PORTS[$app]}"
  done
  echo ""
}

# =============================================================================
# Helpers
# =============================================================================

test_command_exists() {
  command -v "$1" &> /dev/null
}

assert_dependencies() {
  log_step "Checking dependencies..."
  local missing=false
  for tool in node pnpm; do
    if ! test_command_exists "$tool"; then
      log_error "$tool is not installed or not in PATH"
      missing=true
    else
      local ver
      ver=$($tool --version 2>&1 | head -n1)
      log_info "$tool $ver"
    fi
  done
  if [ "$missing" = true ]; then exit 1; fi
  log_info "All dependencies present"
}

stop_process_on_port() {
  local port=$1
  local wait_seconds=${2:-3}
  
  # Try kill-port first
  if test_command_exists npx; then
    npx kill-port "$port" 2>/dev/null && log_info "Killed process on port $port using kill-port" && return 0
  fi
  
  # Fallback to lsof/fuser
  if test_command_exists lsof; then
    local pids
    pids=$(lsof -t -i":$port" 2>/dev/null || true)
    if [ -n "$pids" ]; then
      echo "$pids" | xargs -r kill -9 2>/dev/null || true
      log_info "Stopped process on port $port"
    fi
  elif test_command_exists fuser; then
    fuser -k "${port}/tcp" 2>/dev/null && log_info "Stopped process on port $port" || true
  elif test_command_exists netstat; then
    # Windows Git Bash / MSYS fallback
    local pids
    pids=$(netstat -ano 2>/dev/null | grep ":$port " | awk '{print $5}' | sort -u | grep -E '^[0-9]+$' || true)
    if [ -n "$pids" ]; then
      for pid in $pids; do
        taskkill //PID "$pid" //T //F 2>/dev/null || true
      done
      log_info "Stopped process on port $port"
    fi
  fi
  
  # Wait for port to be freed
  local elapsed=0
  while [ $elapsed -lt $wait_seconds ]; do
    if ! test_port_listening "$port"; then return 0; fi
    sleep 0.2
    elapsed=$((elapsed + 1))
  done
  return 0
}

test_port_listening() {
  local port=$1
  if test_command_exists nc; then
    nc -z localhost "$port" 2>/dev/null
  elif test_command_exists lsof; then
    lsof -i":$port" &>/dev/null
  else
    # Fallback - assume not listening if we can't check
    return 1
  fi
}

test_http_health() {
  local url=$1
  local label=$2
  local accepted_codes=${3:-"200"}
  
  if test_command_exists curl; then
    local resp
    resp=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "000")
    if [[ "$accepted_codes" == *"$resp"* ]]; then
      log_info "OK $label ($resp)"
      return 0
    fi
  elif test_command_exists wget; then
    if wget -q --timeout=5 --tries=1 -O /dev/null "$url" 2>/dev/null; then
      log_info "OK $label"
      return 0
    fi
  fi
  log_warn "$label not responding at $url"
  return 1
}

stop_app_ports() {
  log_step "Releasing app ports before dependency work..."
  for port in "${APP_PORTS[@]}"; do
    stop_process_on_port "$port" &>/dev/null || true
  done
}

stop_workspace_node_processes() {
  local wait_seconds=${1:-1}
  
  # Find node processes running in this repo
  local pids
  if test_command_exists pgrep; then
    pids=$(pgrep -f "node.*$SCRIPT_DIR" 2>/dev/null || true)
    if [ -n "$pids" ]; then
      echo "$pids" | xargs -r kill -9 2>/dev/null || true
    fi
  fi
  
  if [ "$wait_seconds" -gt 0 ]; then sleep "$wait_seconds"; fi
}

test_prisma_generated_client_exists() {
  local pnpm_dir="$SCRIPT_DIR/node_modules/.pnpm"
  if [ ! -d "$pnpm_dir" ]; then return 1; fi
  
  # Check for query engine
  if find "$pnpm_dir" -name "libquery_engine*.so.node" -o -name "query_engine*.dll.node" 2>/dev/null | grep -q .; then
    return 0
  fi
  return 1
}

test_prisma_windows_rename_lock() {
  local output="$1"
  if echo "$output" | grep -q "EPERM: operation not permitted, rename" && \
     echo "$output" | grep -q "query_engine"; then
    return 0
  fi
  return 1
}

invoke_prisma_generate() {
  log_info ">>> packages/db (prisma generate)"
  local db_dir="$SCRIPT_DIR/packages/db"
  
  pushd "$db_dir" &>/dev/null || return 1
  
  local output
  local exit_code=0
  
  # Run prisma generate, capture output
  output=$(pnpm exec prisma generate 2>&1) || exit_code=$?
  
  # Print output (filtering PowerShell artifacts if any)
  echo "$output" | grep -v "^System\.Management\.Automation\." || true
  
  if [ $exit_code -eq 0 ]; then
    popd &>/dev/null
    return 0
  fi
  
  # Check if it's the Windows rename lock issue
  if test_prisma_windows_rename_lock "$output" && test_prisma_generated_client_exists; then
    log_warn "Prisma generate hit a Windows file lock while replacing the query engine DLL."
    log_warn "An existing generated Prisma client is present, so startup will continue."
    log_warn "If schema changes are missing, close dev servers/VS Code TypeScript server and run: pnpm --filter @asafarim/db exec prisma generate"
    popd &>/dev/null
    return 0
  fi
  
  log_error "prisma generate failed"
  popd &>/dev/null
  return 1
}

invoke_pnpm_command() {
  local dir=$1
  local label=$2
  local pnpm_args=$3
  
  if [ ! -d "$dir" ]; then
    log_warn "Skipping $label - directory not found: $dir"
    return
  fi
  
  log_info ">>> $label"
  pushd "$dir" &>/dev/null || return
  
  # shellcheck disable=SC2086
  pnpm $pnpm_args || { log_error "Command failed in $label"; popd &>/dev/null; return 1; }
  
  popd &>/dev/null
}

set_vionto_ffmpeg_path() {
  if [ -z "${FFMPEG_PATH:-}" ]; then
    FFMPEG_PATH="$DEFAULT_FFMPEG_PATH"
    export FFMPEG_PATH
  fi
  log_info "[vionto] FFMPEG_PATH=$FFMPEG_PATH"
}

# =============================================================================
# Docker Services
# =============================================================================

start_docker_services() {
  if ! test_command_exists docker; then
    log_warn "docker not found — skipping Docker service startup"
    return
  fi
  
  log_step "Starting Docker services (Redis)..."
  
  for svc in "${DOCKER_SERVICES[@]}"; do
    IFS='|' read -r name image ports <<< "$svc"
    
    # Check if container exists and its state
    local state
    state=$(docker ps -a --filter "name=^${name}$" --format "{{.State}}" 2>/dev/null || true)
    
    if [ "$state" = "running" ]; then
      log_info "OK $name already running — reusing"
      continue
    fi
    
    if [ -n "$state" ]; then
      # Container exists but is stopped - just start it
      log_info "Starting existing container: $name"
      docker start "$name" &>/dev/null
    else
      # First-time creation
      if ! docker image inspect "$image" &>/dev/null; then
        log_info "Pulling image: $image"
        docker pull "$image" &>/dev/null
      fi
      log_info "Creating container: $name on $ports"
      docker run -d --name "$name" -p "$ports" --restart unless-stopped "$image" &>/dev/null
    fi
    
    # Wait up to 10s for port to be ready
    local port=${ports%%:*}
    local ready=false
    for ((i=0; i<10; i++)); do
      if test_port_listening "$port"; then ready=true; break; fi
      sleep 0.3
    done
    
    if [ "$ready" = true ]; then
      log_info "OK $name is ready on port $port"
    else
      log_warn "$name may not be ready yet on port $port"
    fi
  done
}

stop_docker_services() {
  if ! test_command_exists docker; then return; fi
  
  log_step "Stopping Docker services..."
  for svc in "${DOCKER_SERVICES[@]}"; do
    IFS='|' read -r name _ _ <<< "$svc"
    docker stop -t 1 "$name" 2>/dev/null || true
  done
  log_info "OK Docker services stopped (containers preserved for fast restart)"
}

# =============================================================================
# Commands
# =============================================================================

cmd_install() {
  log_step "Installing all dependencies (pnpm install from root)..."
  
  if ! pnpm install; then
    log_warn "pnpm install failed. Retrying with --ignore-scripts, then running Prisma generate separately..."
    pnpm install --ignore-scripts || { log_error "pnpm install failed"; exit 1; }
    invoke_prisma_generate
  fi
  
  log_info "OK All dependencies installed"
}

cmd_build() {
  log_step "Building packages in dependency order..."
  
  for pkg in "${PACKAGES_BUILD_ORDER[@]}"; do
    local dir="$SCRIPT_DIR/$pkg"
    if [ -d "$dir" ]; then
      if [ "$pkg" = "packages/db" ]; then
        invoke_prisma_generate
      else
        invoke_pnpm_command "$dir" "$pkg" "build"
      fi
    fi
  done
  
  log_info "OK All packages built"
}

cmd_dev() {
  local -a apps=("$@")
  
  # Decide which apps to start
  local -a to_start=()
  if [ ${#apps[@]} -gt 0 ]; then
    for a in "${apps[@]}"; do
      if [ -n "${APP_PORTS[$a]:-}" ]; then
        to_start+=("$a")
      else
        log_warn "Unknown app '$a'. Known apps: ${!APP_PORTS[*]}"
      fi
    done
  else
    to_start=("${!APP_PORTS[@]}")
  fi
  
  if [ ${#to_start[@]} -eq 0 ]; then
    log_error "No valid apps to start"
    exit 1
  fi
  
  start_docker_services
  
  log_step "Starting dev servers..."
  
  # Kill ports first
  for app in "${to_start[@]}"; do
    stop_process_on_port "${APP_PORTS[$app]}" &>/dev/null || true
  done
  
  # Export FFMPEG path for vionto if needed
  if [[ " ${to_start[*]} " =~ " vionto " ]]; then
    set_vionto_ffmpeg_path
  fi
  
  # Start dev servers in background
  local -A pids=()
  for app in "${to_start[@]}"; do
    local port="${APP_PORTS[$app]}"
    local app_dir="$SCRIPT_DIR/apps/$app"
    
    if [ ! -d "$app_dir" ]; then
      log_warn "Skipping $app - directory not found: $app_dir"
      continue
    fi
    
    log_app "Starting $app on port $port..."
    
    # Start in subshell
    (
      cd "$app_dir"
      FORCE_COLOR=0 pnpm run dev 2>&1 | while read -r line; do
        echo "[$app] $line"
      done
    ) &
    
    pids[$app]=$!
  done
  
  echo ""
  log_info "Dev servers running:"
  for app in "${!pids[@]}"; do
    local port="${APP_PORTS[$app]}"
    log_info "  $app [PID ${pids[$app]}] -> http://localhost:$port"
  done
  echo ""
  log_info "Press Ctrl+C to stop all."
  echo ""
  
  # Wait for all processes and handle output
  trap 'cmd_stop; exit 0' INT TERM
  
  while true; do
    local any_running=false
    for app in "${!pids[@]}"; do
      if kill -0 "${pids[$app]}" 2>/dev/null; then
        any_running=true
      else
        log_warn "$app exited"
        unset 'pids[$app]'
      fi
    done
    
    if [ "$any_running" = false ]; then
      log_info "All dev servers stopped"
      break
    fi
    
    sleep 0.4
  done
}

cmd_start() {
  log_step "Full pipeline: install, build packages, then dev..."
  show_banner
  assert_dependencies
  stop_app_ports
  stop_workspace_node_processes
  cmd_install
  cmd_build
  shift  # Remove 'start' from args
  cmd_dev "$@"
}

cmd_status() {
  log_step "Checking service health..."
  show_banner
  for app in "${!APP_PORTS[@]}"; do
    local url="http://localhost:${APP_PORTS[$app]}"
    test_http_health "$url" "$app" "200 301 302 307 308" &>/dev/null || true
  done
}

cmd_stop() {
  log_step "Stopping all services..."
  local stop_start=$(date +%s)
  
  # Kill ports first
  log_info "Killing all app ports first..."
  for port in "${APP_PORTS[@]}"; do
    stop_process_on_port "$port" 1 &>/dev/null || true
  done &
  
  wait
  
  # Stop workspace processes
  stop_workspace_node_processes 0
  
  # Stop Docker
  stop_docker_services
  
  local stop_end=$(date +%s)
  local duration=$((stop_end - stop_start))
  log_info "OK All services stopped in ${duration}s"
}

cmd_cleanup() {
  log_step "Removing build artifacts..."
  
  find "$SCRIPT_DIR" -type d \( -name ".next" -o -name "dist" -o -name ".turbo" \) ! -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null || true
  
  log_info "OK Cleanup done"
}

show_help() {
  show_banner
  cat <<EOF
Usage: ./start.sh [command] [app...]

Commands:
  start               Install + build packages + start all dev servers
  install             pnpm install from the root (installs everything)
  build               Build all packages in dependency order
  dev [app ...]       Start one or more (or all) apps in dev mode (auto-starts Redis)
  status              HTTP health-check all apps
  stop                Stop all running dev servers and Docker services
  cleanup             Delete .next / dist / .turbo build artefacts
  help                Show this help

Examples:
  ./start.sh start
  ./start.sh dev
  ./start.sh dev edumatch
  ./start.sh dev portal edumatch
  ./start.sh build
  ./start.sh status
  ./start.sh stop
EOF
}

# =============================================================================
# Entry point
# =============================================================================

CMD="${1:-help}"
case "$CMD" in
  start)
    shift || true
    show_banner
    assert_dependencies
    cmd_start "$@"
    ;;
  install)
    show_banner
    assert_dependencies
    cmd_install
    ;;
  build)
    show_banner
    assert_dependencies
    cmd_build
    ;;
  dev)
    shift || true
    show_banner
    cmd_dev "$@"
    ;;
  status)
    cmd_status
    ;;
  stop)
    cmd_stop
    ;;
  cleanup)
    cmd_cleanup
    ;;
  help|--help|-h|"")
    show_help
    ;;
  *)
    log_error "Unknown command: $CMD"
    show_help
    exit 1
    ;;
esac
