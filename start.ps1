param(
    [Parameter(Position = 0)]
    [string]$Command = "help",

    [Parameter(Position = 1, ValueFromRemainingArguments)]
    [string[]]$ExtraArgs
)

$ErrorActionPreference = "Stop"

# =============================================================================
# Configuration
# =============================================================================

$SCRIPT_DIR = $PSScriptRoot
$SERVER_IP = "46.225.189.19"
$API_DOMAIN = "api.immostory.be"
$WEB_DOMAIN = "immostory.be"

if ($env:BACKEND_PORT) { $BACKEND_PORT = $env:BACKEND_PORT } else { $BACKEND_PORT = "3234" }
if ($env:WEB_PORT)     { $WEB_PORT = $env:WEB_PORT }         else { $WEB_PORT = "3233" }

# =============================================================================
# Logging
# =============================================================================

function Log-Info  { param([string]$Msg) Write-Host "[INFO] $Msg" -ForegroundColor Green }
function Log-Warn  { param([string]$Msg) Write-Host "[WARN] $Msg" -ForegroundColor Yellow }
function Log-Error { param([string]$Msg) Write-Host "[ERROR] $Msg" -ForegroundColor Red }
function Log-Step  { param([string]$Msg) Write-Host "[STEP] $Msg" -ForegroundColor Blue }
function Log-App   { param([string]$Msg) Write-Host "[APP]  $Msg" -ForegroundColor Cyan }

function Show-Banner {
    Write-Host ""
    Write-Host "+=================================================================+" -ForegroundColor Cyan
    Write-Host "|  ImmoStory - Belgian Real Estate Automation Platform            |" -ForegroundColor Green
    Write-Host "|  AI-Powered Video Generation & Social Media Publishing          |" -ForegroundColor Cyan
    Write-Host "+=================================================================+" -ForegroundColor Cyan
    Write-Host ""
    Log-Info "Server: $SERVER_IP"
    Log-Info "API: $API_DOMAIN"
    Log-Info "Web: $WEB_DOMAIN"
    Write-Host ""
}

# =============================================================================
# Helper Functions
# =============================================================================

function Test-CommandExists {
    param([string]$Name)
    return ($null -ne (Get-Command $Name -ErrorAction SilentlyContinue))
}

function Assert-Dependencies {
    Log-Step "Checking dependencies..."
    $hasMissing = $false

    if (-not (Test-CommandExists "node")) {
        Log-Error "Node.js is not installed"
        $hasMissing = $true
    }
    if (-not (Test-CommandExists "pnpm")) {
        Log-Error "pnpm is not installed"
        $hasMissing = $true
    }

    if ($hasMissing) { exit 1 }
    Log-Info "All dependencies are available"
}

# -----------------------------------------------------------------------------
# Pointer-file <-> Junction helpers
#
# The repo ships plain-text files (e.g. apps/backend/packages/database) that
# contain a relative path like "../../../packages/database".
# pnpm needs real directories, so we swap them for NTFS junctions while the
# script runs, then restore the originals when we are done.
# -----------------------------------------------------------------------------

# Known pointer files and their expected content
$script:POINTER_MAP = @{
    (Join-Path $SCRIPT_DIR "apps\backend\packages\database") = "../../../packages/database"
    (Join-Path $SCRIPT_DIR "apps\backend\packages\shared")   = "../../../packages/shared"
    (Join-Path $SCRIPT_DIR "apps\web\packages\database")      = "../../../packages/database"
    (Join-Path $SCRIPT_DIR "apps\web\packages\shared")        = "../../../packages/shared"
}

function Set-AllJunctions {
    foreach ($kvp in $script:POINTER_MAP.GetEnumerator()) {
        $pointerPath = $kvp.Key
        $relPath     = $kvp.Value
        $pkgDir      = Split-Path $pointerPath -Parent
        $target      = [System.IO.Path]::GetFullPath((Join-Path $pkgDir $relPath))
        $name        = Split-Path $pointerPath -Leaf

        # Already a junction – nothing to do
        if ((Test-Path $pointerPath) -and
            (Get-Item $pointerPath).Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
            continue
        }

        if (-not (Test-Path $target -PathType Container)) {
            Log-Warn "Junction target missing: $target (pointer: $pointerPath)"
            continue
        }

        if (Test-Path $pointerPath) { Remove-Item $pointerPath -Force }
        cmd /c "mklink /J `"$pointerPath`" `"$target`"" | Out-Null
        Log-Info "Junction: $name -> $target"
    }
}

function Restore-AllPointers {
    # Works purely from filesystem – no in-memory state needed.
    # Safe to call any time, even after an unclean exit.
    # Returns nothing; sets $script:lastRestoreDidWork instead.
    $script:lastRestoreDidWork = $false
    foreach ($kvp in $script:POINTER_MAP.GetEnumerator()) {
        $pointerPath = $kvp.Key
        $content     = $kvp.Value

        if (-not (Test-Path $pointerPath)) {
            # Missing entirely – recreate the pointer file
            [System.IO.File]::WriteAllText($pointerPath, $content)
            $script:lastRestoreDidWork = $true
            continue
        }

        $item = Get-Item $pointerPath -Force
        if ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
            cmd /c "rmdir /q `"$pointerPath`"" 2>&1 | Out-Null
            [System.IO.File]::WriteAllText($pointerPath, $content)
            $script:lastRestoreDidWork = $true
        }
    }
}

function Stop-ProcessOnPort {
    param([int]$Port)
    Log-Step "Killing processes on port $Port..."

    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
                   Where-Object { $_.State -eq 'Listen' }

    if ($connections) {
        $procIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($procId in $procIds) {
            try {
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                Log-Info "Killed PID $procId on port $Port"
            }
            catch {
                Log-Warn "Could not kill PID $procId on port $Port"
            }
        }
        Start-Sleep -Seconds 1
    }
    else {
        Log-Info "No process found on port $Port"
    }
}

function Test-PortListening {
    param([int]$Port)
    $conn = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
            Where-Object { $_.State -eq 'Listen' }
    return ($null -ne $conn)
}

function Test-HttpHealth {
    param(
        [string]$Url,
        [string]$Label,
        [string[]]$AcceptedCodes = @("200")
    )
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        $code = $response.StatusCode.ToString()
        if ($AcceptedCodes -contains $code) {
            Log-Info "OK $Label responded with HTTP $code"
            return $true
        }
        Log-Error "$Label responded with unexpected HTTP $code"
        return $false
    }
    catch {
        Log-Error "$Label is not reachable"
        return $false
    }
}

function Invoke-PnpmInstall {
    param([string]$Dir, [string]$Label)
    Log-App "Installing dependencies: $Label ..."
    Push-Location $Dir
    try {
        $result = cmd /c "pnpm install 2>&1" 2>&1
        $result | ForEach-Object { Write-Host $_ }
        if ($LASTEXITCODE -ne 0) { throw "pnpm install failed in $Dir" }
        Log-Info "OK $Label dependencies installed"
    }
    catch {
        throw
    }
    finally {
        Pop-Location
    }
}

function Invoke-PnpmBuild {
    param([string]$Dir, [string]$Label)
    Log-App "Building: $Label ..."
    Push-Location $Dir
    try {
        $result = cmd /c "pnpm run build 2>&1" 2>&1
        if ($LASTEXITCODE -ne 0) {
            $result | ForEach-Object { Write-Host $_ }
            throw "pnpm build failed in $Dir (exit code $LASTEXITCODE)"
        }
        Log-Info "OK $Label built successfully"
    }
    catch {
        throw
    }
    finally {
        Pop-Location
    }
}

# =============================================================================
# Commands
# =============================================================================

function Cmd-Install {
    Log-Step "Installing all dependencies..."

    Invoke-PnpmInstall -Dir $SCRIPT_DIR -Label "Root monorepo"
    Invoke-PnpmInstall -Dir (Join-Path $SCRIPT_DIR "packages\database") -Label "packages/database"
    Invoke-PnpmInstall -Dir (Join-Path $SCRIPT_DIR "packages\shared")   -Label "packages/shared"
    Invoke-PnpmInstall -Dir (Join-Path $SCRIPT_DIR "packages\video-composition") -Label "packages/video-composition"
    Invoke-PnpmInstall -Dir (Join-Path $SCRIPT_DIR "apps\web")            -Label "apps/web"
    Invoke-PnpmInstall -Dir (Join-Path $SCRIPT_DIR "apps\backend")        -Label "apps/backend"
    Invoke-PnpmInstall -Dir (Join-Path $SCRIPT_DIR "apps\render-service") -Label "apps/render-service"

    Log-Info "OK All dependencies installed"
}

function Cmd-Build {
    Log-Step "Building all packages and apps..."

    Invoke-PnpmBuild -Dir (Join-Path $SCRIPT_DIR "packages\database") -Label "packages/database"
    Invoke-PnpmBuild -Dir (Join-Path $SCRIPT_DIR "packages\shared")   -Label "packages/shared"
    Invoke-PnpmBuild -Dir (Join-Path $SCRIPT_DIR "packages\video-composition") -Label "packages/video-composition"
    Invoke-PnpmBuild -Dir (Join-Path $SCRIPT_DIR "apps\backend")        -Label "apps/backend"
    Invoke-PnpmBuild -Dir (Join-Path $SCRIPT_DIR "apps\web")            -Label "apps/web"
    Invoke-PnpmBuild -Dir (Join-Path $SCRIPT_DIR "apps\render-service") -Label "apps/render-service"

    Log-Info "OK All packages and apps built successfully"
}

function Cmd-Dev {
    Log-Step "Starting development mode - backend + web ..."

    Log-Info "Backend will be on port $BACKEND_PORT"
    Log-Info "Web will be on port $WEB_PORT"
    Write-Host ""

    Stop-ProcessOnPort $BACKEND_PORT
    Stop-ProcessOnPort $WEB_PORT

    $currentPath = $env:PATH

    Log-App "Starting Backend on port $BACKEND_PORT ..."
    $backendDir = Join-Path $SCRIPT_DIR "apps\backend"
    $script:backendJob = Start-Job -ScriptBlock {
        param($dir, $port, $pathVar)
        $env:PATH = $pathVar
        Set-Location $dir
        $env:PORT = $port
        # Replicate dev-wrapper.mjs env setup (local-safe mode)
        if (-not $env:REDIS_ENABLED)    { $env:REDIS_ENABLED = "false" }
        if (-not $env:RABBITMQ_ENABLED) { $env:RABBITMQ_ENABLED = "false" }
        cmd /c "pnpm exec nest start --watch 2>&1"
    } -ArgumentList $backendDir, $BACKEND_PORT, $currentPath

    Log-App "Starting Web on port $WEB_PORT ..."
    $webDir = Join-Path $SCRIPT_DIR "apps\web"
    $script:webJob = Start-Job -ScriptBlock {
        param($dir, $port, $pathVar)
        $env:PATH = $pathVar
        Set-Location $dir
        $env:PORT = $port
        cmd /c "pnpm run dev 2>&1"
    } -ArgumentList $webDir, $WEB_PORT, $currentPath

    Write-Host ""
    Log-Info "OK Both services started as background jobs"
    Log-Info "Backend Job ID: $($script:backendJob.Id)"
    Log-Info "Web Job ID: $($script:webJob.Id)"
    Write-Host ""
    Log-Info "API URL: http://localhost:${BACKEND_PORT}/api"
    Log-Info "Web URL: http://localhost:${WEB_PORT}"
    Write-Host ""
    Log-Info "Press Ctrl+C to stop both services"
    Write-Host ""

    try {
        while ($true) {
            $bo = Receive-Job -Job $script:backendJob -ErrorAction SilentlyContinue
            if ($bo) { foreach ($l in $bo) { Write-Host "[BACKEND] $l" } }

            $wo = Receive-Job -Job $script:webJob -ErrorAction SilentlyContinue
            if ($wo) { foreach ($l in $wo) { Write-Host "[WEB]     $l" } }

            if ($script:backendJob.State -eq 'Completed' -or $script:backendJob.State -eq 'Failed') {
                Log-Warn "Backend process exited with state: $($script:backendJob.State)"
                break
            }
            if ($script:webJob.State -eq 'Completed' -or $script:webJob.State -eq 'Failed') {
                Log-Warn "Web process exited with state: $($script:webJob.State)"
                break
            }

            Start-Sleep -Milliseconds 500
        }
    }
    finally {
        Log-Info "Stopping services..."
        Stop-Job -Job $script:backendJob -ErrorAction SilentlyContinue
        Stop-Job -Job $script:webJob -ErrorAction SilentlyContinue
        Remove-Job -Job $script:backendJob -Force -ErrorAction SilentlyContinue
        Remove-Job -Job $script:webJob -Force -ErrorAction SilentlyContinue
        Stop-ProcessOnPort $BACKEND_PORT
        Stop-ProcessOnPort $WEB_PORT
        Log-Info "OK Services stopped"
    }
}

function Cmd-Start {
    Log-Step "Full start: install then build then dev..."
    Show-Banner
    Assert-Dependencies

    Cmd-Install
    Cmd-Build
    Cmd-Dev
}

function Cmd-Prod {
    Log-Step "Starting production mode..."

    $backendDist = Join-Path $SCRIPT_DIR "apps\backend\dist"
    $webNext     = Join-Path $SCRIPT_DIR "apps\web\.next"

    if (-not (Test-Path $backendDist)) {
        Log-Warn "Backend build not found - building..."
        Invoke-PnpmBuild -Dir (Join-Path $SCRIPT_DIR "packages\database") -Label "packages/database"
        Invoke-PnpmBuild -Dir (Join-Path $SCRIPT_DIR "packages\shared")   -Label "packages/shared"
        Invoke-PnpmBuild -Dir (Join-Path $SCRIPT_DIR "apps\backend")      -Label "apps/backend"
    }
    if (-not (Test-Path $webNext)) {
        Log-Warn "Web build not found - building..."
        Invoke-PnpmBuild -Dir (Join-Path $SCRIPT_DIR "packages\video-composition") -Label "packages/video-composition"
        Invoke-PnpmBuild -Dir (Join-Path $SCRIPT_DIR "apps\web") -Label "apps/web"
    }

    Stop-ProcessOnPort $BACKEND_PORT
    Stop-ProcessOnPort $WEB_PORT

    $currentPath = $env:PATH

    Log-App "Starting Backend on port $BACKEND_PORT in production mode..."
    $backendDir = Join-Path $SCRIPT_DIR "apps\backend"
    $script:backendJob = Start-Job -ScriptBlock {
        param($dir, $port, $pathVar)
        $env:PATH = $pathVar
        Set-Location $dir
        $env:NODE_ENV = "production"
        $env:PORT = $port
        cmd /c "pnpm run start:prod 2>&1"
    } -ArgumentList $backendDir, $BACKEND_PORT, $currentPath

    Start-Sleep -Seconds 3

    Log-App "Starting Web on port $WEB_PORT in production mode..."
    $webDir = Join-Path $SCRIPT_DIR "apps\web"
    $script:webJob = Start-Job -ScriptBlock {
        param($dir, $port, $pathVar)
        $env:PATH = $pathVar
        Set-Location $dir
        $env:NODE_ENV = "production"
        $env:PORT = $port
        cmd /c "pnpm run start 2>&1"
    } -ArgumentList $webDir, $WEB_PORT, $currentPath

    Write-Host ""
    Log-Info "OK Production services started"
    Log-Info "Backend Job ID: $($script:backendJob.Id) - port $BACKEND_PORT"
    Log-Info "Web Job ID: $($script:webJob.Id) - port $WEB_PORT"
    Write-Host ""
    Log-Info "API URL: http://localhost:${BACKEND_PORT}/api"
    Log-Info "Web URL: http://localhost:${WEB_PORT}"
    Write-Host ""
    Log-Info "Press Ctrl+C to stop both services"

    try {
        while ($true) {
            $bo = Receive-Job -Job $script:backendJob -ErrorAction SilentlyContinue
            if ($bo) { foreach ($l in $bo) { Write-Host "[BACKEND] $l" } }
            $wo = Receive-Job -Job $script:webJob -ErrorAction SilentlyContinue
            if ($wo) { foreach ($l in $wo) { Write-Host "[WEB]     $l" } }
            if ($script:backendJob.State -in @('Completed','Failed')) {
                Log-Warn "Backend process exited with state: $($script:backendJob.State)"; break
            }
            if ($script:webJob.State -in @('Completed','Failed')) {
                Log-Warn "Web process exited with state: $($script:webJob.State)"; break
            }
            Start-Sleep -Milliseconds 500
        }
    }
    finally {
        Log-Info "Stopping production services..."
        Stop-Job -Job $script:backendJob -ErrorAction SilentlyContinue
        Stop-Job -Job $script:webJob -ErrorAction SilentlyContinue
        Remove-Job -Job $script:backendJob -Force -ErrorAction SilentlyContinue
        Remove-Job -Job $script:webJob -Force -ErrorAction SilentlyContinue
        Stop-ProcessOnPort $BACKEND_PORT
        Stop-ProcessOnPort $WEB_PORT
        Log-Info "OK Production services stopped"
    }
}

function Cmd-Status {
    Log-Step "Checking system status..."
    Show-Banner

    Write-Host ""
    Write-Host "=== Backend Server - Port $BACKEND_PORT ==="
    $backendOk = Test-HttpHealth -Url "http://localhost:${BACKEND_PORT}/api/v1/health" -Label "Backend health"
    if (-not $backendOk) {
        if (Test-PortListening -Port $BACKEND_PORT) {
            Log-Warn "Backend port is listening but health check failed"
        }
        else {
            Log-Error "Backend is not reachable"
        }
    }

    Write-Host ""
    Write-Host "=== Web Server - Port $WEB_PORT ==="
    $webOk = Test-HttpHealth -Url "http://localhost:${WEB_PORT}" -Label "Web app" -AcceptedCodes @("200","301","302","307","308")
    if (-not $webOk) {
        if (Test-PortListening -Port $WEB_PORT) {
            Log-Warn "Web port is listening but health check failed"
        }
        else {
            Log-Error "Web is not reachable"
        }
    }

    Write-Host ""
    Write-Host "=== Render Service - Port 4000 ==="
    $renderOk = Test-HttpHealth -Url "http://localhost:4000/health" -Label "Render-service health"
    if (-not $renderOk) {
        if (Test-PortListening -Port 4000) {
            Log-Warn "Render-service port is listening but health check failed"
        }
        else {
            Log-Error "Render-service is not reachable"
        }
    }
}

function Cmd-Stop {
    Log-Step "Stopping all services..."

    Stop-ProcessOnPort $BACKEND_PORT
    Stop-ProcessOnPort $WEB_PORT
    Stop-ProcessOnPort 4000

    Get-Job | Where-Object { $_.State -eq 'Running' } | Stop-Job -ErrorAction SilentlyContinue
    Get-Job | Remove-Job -Force -ErrorAction SilentlyContinue

    # Restore any lingering junctions back to pointer files
    Restore-AllPointers
    if ($script:lastRestoreDidWork) {
        Log-Info "Pointer files restored - git is clean"
    }

    Log-Info "OK All services stopped"
}

function Cmd-Cleanup {
    Log-Step "Cleaning up build artifacts..."

    $dirs = @(
        (Join-Path $SCRIPT_DIR "apps\backend\dist"),
        (Join-Path $SCRIPT_DIR "apps\web\.next"),
        (Join-Path $SCRIPT_DIR "apps\render-service\dist"),
        (Join-Path $SCRIPT_DIR "packages\database\dist"),
        (Join-Path $SCRIPT_DIR "packages\shared\dist"),
        (Join-Path $SCRIPT_DIR "packages\video-composition\dist")
    )

    foreach ($d in $dirs) {
        if (Test-Path $d) {
            Remove-Item -Recurse -Force $d
            Log-Info "Removed $d"
        }
    }

    Log-Info "OK Cleanup completed"
}

function Cmd-QaBackend {
    Log-Step "Starting QA backend locally via pnpm dev..."
    Show-Banner
    Assert-Dependencies

    $envQa = Join-Path $SCRIPT_DIR "apps\backend\.env.qa"
    if (Test-Path $envQa) {
        Log-Info "Loading apps/backend/.env.qa"
        Get-Content $envQa | ForEach-Object {
            if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
                [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
            }
        }
    }
    else {
        Log-Warn "apps/backend/.env.qa not found - running with existing environment"
    }

    if (-not $env:NODE_ENV) { $env:NODE_ENV = "development" }
    if (-not $env:PORT)     { $env:PORT = $BACKEND_PORT }

    Stop-ProcessOnPort $BACKEND_PORT

    Log-Info "Starting backend on port $env:PORT ..."
    Push-Location (Join-Path $SCRIPT_DIR "apps\backend")
    try {
        & pnpm run dev
    }
    catch {
        throw
    }
    finally {
        Pop-Location
    }
}

function Cmd-QaWeb {
    Log-Step "Starting QA web locally via pnpm dev with remote QA API..."
    Show-Banner
    Assert-Dependencies

    if (-not $env:NODE_ENV)            { $env:NODE_ENV = "development" }
    if (-not $env:PORT)                { $env:PORT = "4233" }
    if (-not $env:NEXT_PUBLIC_API_URL) { $env:NEXT_PUBLIC_API_URL = "https://apiqa.immostory.be/api/v1" }
    if (-not $env:NEXT_PUBLIC_APP_URL) { $env:NEXT_PUBLIC_APP_URL = "http://localhost:4233" }

    Stop-ProcessOnPort 4233

    Log-Info "Starting QA web on port $env:PORT - API: $env:NEXT_PUBLIC_API_URL ..."
    Push-Location (Join-Path $SCRIPT_DIR "apps\web")
    try {
        & pnpm run dev
    }
    catch {
        throw
    }
    finally {
        Pop-Location
    }
}

function Show-Help {
    Show-Banner
    Write-Host "Usage: .\start.ps1 [command]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  start              Full pipeline: install + build + dev"
    Write-Host "  install            Install pnpm dependencies for all packages"
    Write-Host "  build              Build all packages and apps"
    Write-Host "  dev                Start backend + web in dev mode"
    Write-Host "  prod               Start backend + web in production mode"
    Write-Host "  status             Check health of backend / web / render-service"
    Write-Host "  stop               Stop all services"
    Write-Host "  cleanup            Remove build artifacts"
    Write-Host "  qa-backend         Start QA backend locally with .env.qa"
    Write-Host "  qa-web             Start QA web locally with remote QA API"
    Write-Host "  help               Show this help message"
    Write-Host ""
    Write-Host "Configuration:"
    Write-Host "  Server IP:     $SERVER_IP"
    Write-Host "  API Domain:    $API_DOMAIN"
    Write-Host "  Web Domain:    $WEB_DOMAIN"
    Write-Host "  Backend Port:  $BACKEND_PORT"
    Write-Host "  Web Port:      $WEB_PORT"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\start.ps1 start         # First run: install + build + dev"
    Write-Host "  .\start.ps1 dev           # Quick start without install/build"
    Write-Host "  .\start.ps1 install       # Only install dependencies"
    Write-Host "  .\start.ps1 build         # Only build packages and apps"
    Write-Host "  .\start.ps1 status        # Check running services"
    Write-Host "  .\start.ps1 stop          # Stop everything"
}

# =============================================================================
# Main Entry Point
#
# Every invocation first checks for leftover junctions from a previous unclean
# exit (e.g. terminal closed, Ctrl+C that killed PowerShell).  This guarantees
# the repo self-heals automatically on the next run.
#
# Commands that need junctions (install, build, dev, start, prod, qa-*)
# are wrapped: Set-AllJunctions runs before, Restore-AllPointers after.
# =============================================================================

# --- Auto-heal stale junctions from previous unclean exit ---
Restore-AllPointers
if ($script:lastRestoreDidWork) {
    Log-Warn "Repaired stale junctions left from a previous unclean exit"
}

$needsJunctions = $Command.ToLower() -in @(
    "start", "install", "build", "dev", "prod", "qa-backend", "qa-web", "qaweb", "web"
)

if ($needsJunctions) {
    Log-Step "Setting up package junctions..."
    Set-AllJunctions
}

try {
    switch ($Command.ToLower()) {
        "start"       { Cmd-Start }
        "install"     { Cmd-Install }
        "build"       { Cmd-Build }
        "dev"         { Cmd-Dev }
        "prod"        { Cmd-Prod }
        "status"      { Cmd-Status }
        "stop"        { Cmd-Stop }
        "cleanup"     { Cmd-Cleanup }
        "qa-backend"  { Cmd-QaBackend }
        "qa-web"      { Cmd-QaWeb }
        "qaweb"       { Cmd-QaWeb }
        "web"         { Cmd-QaWeb }
        "help"        { Show-Help }
        "--help"      { Show-Help }
        "-h"          { Show-Help }
        ""            { Show-Help }
        default {
            Log-Error "Unknown command: $Command"
            Show-Help
            exit 1
        }
    }
}
finally {
    if ($needsJunctions) {
        Log-Step "Restoring package pointers..."
        Restore-AllPointers
        Log-Info "OK Pointer files restored - git is clean"
    }
}
