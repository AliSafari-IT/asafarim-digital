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

# Docker services required by vionto (and any app that needs them)
$DOCKER_SERVICES = @(
    @{ Name = "redis-local"; Image = "redis:7-alpine"; Ports = "-p 6379:6379" }
)

# App ports (must match each app's package.json "dev" script)
$APP_PORTS = @{
    "portal"              = 3000
    "content-generator"   = 3001
    "ops-hub"             = 3003
    "marketing-content"   = 3004
    "edumatch"            = 3005
    "vionto"              = 3006
}

# Only packages that have a "build" script in their package.json, in dependency order.
# Packages without a build script (config, types, shared-i18n, country-language-selector,
# navigation, vionto-schemas) are source-only and are handled by transpilePackages in
# each app's next.config.ts - no separate build step needed.
$PACKAGES_BUILD_ORDER = @(
    "packages\db",       # prisma generate
    "packages\auth",     # tsc
    "packages\payments", # tsup
    "packages\ui",       # tsup
    "packages\location"  # tsc --noEmit (type-check only, no output)
)

# =============================================================================
# Logging
# =============================================================================

function Log-Info  { param([string]$Msg) Write-Host "[INFO]  $Msg" -ForegroundColor Green }
function Log-Warn  { param([string]$Msg) Write-Host "[WARN]  $Msg" -ForegroundColor Yellow }
function Log-Error { param([string]$Msg) Write-Host "[ERROR] $Msg" -ForegroundColor Red }
function Log-Step  { param([string]$Msg) Write-Host "`n[STEP]  $Msg" -ForegroundColor Cyan }
function Log-App   { param([string]$Msg) Write-Host "[APP]   $Msg" -ForegroundColor Magenta }

function Show-Banner {
    Write-Host ""
    Write-Host "+================================================================+" -ForegroundColor Cyan
    Write-Host "|  ASafariM Digital - Monorepo Dev Launcher                      |" -ForegroundColor Green
    Write-Host "+================================================================+" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Apps:" -ForegroundColor DarkGray
    foreach ($kv in $APP_PORTS.GetEnumerator() | Sort-Object Key) {
        Write-Host ("    {0,-22} -> http://localhost:{1}" -f $kv.Key, $kv.Value) -ForegroundColor DarkGray
    }
    Write-Host ""
}

# =============================================================================
# Helpers
# =============================================================================

function Test-CommandExists {
    param([string]$Name)
    return ($null -ne (Get-Command $Name -ErrorAction SilentlyContinue))
}

function Assert-Dependencies {
    Log-Step "Checking dependencies..."
    $missing = $false
    foreach ($tool in @("node", "pnpm")) {
        if (-not (Test-CommandExists $tool)) {
            Log-Error "$tool is not installed or not in PATH"
            $missing = $true
        } else {
            $ver = & $tool --version 2>&1
            Log-Info "$tool $ver"
        }
    }
    if ($missing) { exit 1 }
    Log-Info "All dependencies present"
}

function Stop-ProcessOnPort {
    param([int]$Port)
    $pids = netstat -ano 2>$null |
        Select-String ":$Port\s" |
        ForEach-Object { ($_ -split '\s+')[-1] } |
        Where-Object { $_ -match '^\d+$' } |
        Sort-Object -Unique

    foreach ($p in $pids) {
        try {
            Stop-Process -Id ([int]$p) -Force -ErrorAction SilentlyContinue
            Log-Info "Stopped process $p on port $Port"
        } catch {}
    }
}

function Test-PortListening {
    param([int]$Port)
    $result = netstat -ano 2>$null | Select-String ":$Port\s.*LISTENING"
    return ($null -ne $result)
}

function Test-HttpHealth {
    param([string]$Url, [string]$Label, [string[]]$AcceptedCodes = @("200"))
    try {
        $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        if ($AcceptedCodes -contains [string]$resp.StatusCode) {
            Log-Info "OK $Label ($($resp.StatusCode))"
            return $true
        }
    } catch {}
    Log-Warn "$Label not responding at $Url"
    return $false
}

function Invoke-PnpmCommand {
    param([string]$Dir, [string]$Label, [string]$PnpmArgs)
    if (-not (Test-Path $Dir)) {
        Log-Warn "Skipping $Label - directory not found: $Dir"
        return
    }
    Log-Info ">>> $Label"
    Push-Location $Dir
    try {
        $cmd = "pnpm $PnpmArgs"
        Invoke-Expression $cmd
        if ($LASTEXITCODE -ne 0) { throw "Command failed in $Label" }
    } finally {
        Pop-Location
    }
}

function Start-DockerServices {
    if (-not (Test-CommandExists "docker")) {
        Log-Warn "docker not found — skipping Docker service startup"
        return
    }
    Log-Step "Starting Docker services (Redis)..."
    foreach ($svc in $DOCKER_SERVICES) {
        $name  = $svc.Name
        $image = $svc.Image
        $ports = $svc.Ports

        Log-Info "Pulling latest image: $image"
        docker pull $image | Out-Null

        $existing = docker ps -a --filter "name=^${name}$" --format "{{.Names}}" 2>$null
        if ($existing) {
            Log-Info "Removing existing container: $name"
            docker rm -f $name | Out-Null
        }

        Log-Info "Starting container: $name on $ports"
        $runCmd = "docker run -d --name $name $ports --restart unless-stopped $image"
        Invoke-Expression $runCmd | Out-Null

        # Wait up to 10s for the port to be ready
        $port = ($ports -replace '.*-p (\d+):.*','$1')
        $ready = $false
        for ($i = 0; $i -lt 10; $i++) {
            if (Test-PortListening -Port ([int]$port)) { $ready = $true; break }
            Start-Sleep -Seconds 1
        }
        if ($ready) {
            Log-Info "OK $name is ready on port $port"
        } else {
            Log-Warn "$name may not be ready yet on port $port"
        }
    }
}

function Stop-DockerServices {
    if (-not (Test-CommandExists "docker")) { return }
    Log-Step "Stopping Docker services..."
    foreach ($svc in $DOCKER_SERVICES) {
        $name = $svc.Name
        $existing = docker ps -a --filter "name=^${name}$" --format "{{.Names}}" 2>$null
        if ($existing) {
            docker rm -f $name | Out-Null
            Log-Info "Removed container: $name"
        }
    }
}

# =============================================================================
# Commands
# =============================================================================

function Cmd-Install {
    Log-Step "Installing all dependencies (pnpm install from root)..."
    Push-Location $SCRIPT_DIR
    try {
        pnpm install
        if ($LASTEXITCODE -ne 0) { throw "pnpm install failed" }
    } finally {
        Pop-Location
    }
    Log-Info "OK All dependencies installed"
}

function Cmd-Build {
    Log-Step "Building packages in dependency order..."
    foreach ($pkg in $PACKAGES_BUILD_ORDER) {
        $dir = Join-Path $SCRIPT_DIR $pkg
        if (Test-Path $dir) {
            Invoke-PnpmCommand -Dir $dir -Label $pkg -PnpmArgs "build"
        }
    }
    Log-Info "OK All packages built"
}

function Cmd-Dev {
    param([string[]]$Apps)

    # Decide which apps to start
    if ($Apps -and $Apps.Count -gt 0) {
        $toStart = @{}
        foreach ($a in $Apps) {
            if ($APP_PORTS.ContainsKey($a)) {
                $toStart[$a] = $APP_PORTS[$a]
            } else {
                Log-Warn "Unknown app '$a'. Known apps: $($APP_PORTS.Keys -join ', ')"
            }
        }
    } else {
        $toStart = $APP_PORTS
    }

    if ($toStart.Count -eq 0) { Log-Error "No valid apps to start"; exit 1 }

    Start-DockerServices

    Log-Step "Starting dev servers..."
    foreach ($kv in $toStart.GetEnumerator()) {
        Stop-ProcessOnPort $kv.Value
    }

    $currentPath = $env:PATH
    $jobs = @{}

    foreach ($kv in $toStart.GetEnumerator()) {
        $appName = $kv.Key
        $port    = $kv.Value
        $appDir  = Join-Path $SCRIPT_DIR "apps\$appName"

        if (-not (Test-Path $appDir)) {
            Log-Warn "Skipping $appName - directory not found: $appDir"
            continue
        }

        Log-App "Starting $appName on port $port..."
        $job = Start-Job -ScriptBlock {
            param($dir, $pathVar)
            $env:PATH = $pathVar
            Set-Location $dir
            cmd /c "pnpm run dev 2>&1"
        } -ArgumentList $appDir, $currentPath

        $jobs[$appName] = $job
    }

    Write-Host ""
    Log-Info "Dev servers running:"
    foreach ($kv in $jobs.GetEnumerator()) {
        $port = $toStart[$kv.Key]
        Log-Info "  $($kv.Key) [Job $($kv.Value.Id)] -> http://localhost:$port"
    }
    Write-Host ""
    Log-Info "Press Ctrl+C to stop all."
    Write-Host ""

    try {
        while ($true) {
            foreach ($kv in $jobs.GetEnumerator()) {
                $out = Receive-Job -Job $kv.Value -ErrorAction SilentlyContinue
                if ($out) { foreach ($l in $out) { Write-Host "[$($kv.Key)] $l" } }
                if ($kv.Value.State -in @('Completed','Failed')) {
                    Log-Warn "$($kv.Key) exited with state: $($kv.Value.State)"
                }
            }
            Start-Sleep -Milliseconds 400
        }
    } finally {
        Log-Info "Stopping all dev servers..."
        foreach ($kv in $jobs.GetEnumerator()) {
            Stop-Job   -Job $kv.Value -ErrorAction SilentlyContinue
            Remove-Job -Job $kv.Value -Force -ErrorAction SilentlyContinue
            Stop-ProcessOnPort $toStart[$kv.Key]
        }
        Log-Info "OK All dev servers stopped"
    }
}

function Cmd-Start {
    Log-Step "Full pipeline: install, build packages, then dev..."
    Show-Banner
    Assert-Dependencies
    Cmd-Install
    Cmd-Build
    Cmd-Dev -Apps $ExtraArgs
}

function Cmd-Status {
    Log-Step "Checking service health..."
    Show-Banner
    foreach ($kv in $APP_PORTS.GetEnumerator() | Sort-Object Key) {
        $url  = "http://localhost:$($kv.Value)"
        $name = $kv.Key
        Test-HttpHealth -Url $url -Label $name -AcceptedCodes @("200","301","302","307","308") | Out-Null
    }
}

function Cmd-Stop {
    Log-Step "Stopping all services..."
    foreach ($kv in $APP_PORTS.GetEnumerator()) {
        Stop-ProcessOnPort $kv.Value
    }
    Get-Job | Where-Object { $_.State -eq 'Running' } | Stop-Job -ErrorAction SilentlyContinue
    Get-Job | Remove-Job -Force -ErrorAction SilentlyContinue
    Stop-DockerServices
    Log-Info "OK All services stopped"
}

function Cmd-Cleanup {
    Log-Step "Removing build artifacts..."
    $patterns = @(".next", "dist", ".turbo")
    Get-ChildItem -Path $SCRIPT_DIR -Recurse -Directory -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -in $patterns -and $_.FullName -notmatch '\\node_modules\\' } |
        ForEach-Object {
            Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
            Log-Info "Removed $($_.FullName)"
        }
    Log-Info "OK Cleanup done"
}

function Show-Help {
    Show-Banner
    Write-Host "Usage: .\start.ps1 [command] [app...]" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor White
    Write-Host "  start               Install + build packages + start all dev servers"
    Write-Host "  install             pnpm install from the root (installs everything)"
    Write-Host "  build               Build all packages in dependency order"
    Write-Host "  dev [app ...]       Start one or more (or all) apps in dev mode (auto-starts Redis)"
    Write-Host "  status              HTTP health-check all apps"
    Write-Host "  stop                Stop all running dev servers and Docker services"
    Write-Host "  cleanup             Delete .next / dist / .turbo build artefacts"
    Write-Host "  help                Show this help"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host "  .\start.ps1 start"
    Write-Host "  .\start.ps1 dev"
    Write-Host "  .\start.ps1 dev edumatch"
    Write-Host "  .\start.ps1 dev portal edumatch"
    Write-Host "  .\start.ps1 build"
    Write-Host "  .\start.ps1 status"
    Write-Host "  .\start.ps1 stop"
    Write-Host ""
}

# =============================================================================
# Entry point
# =============================================================================

$cmd = $Command.ToLower()
if     ($cmd -eq 'start')   { Show-Banner; Assert-Dependencies; Cmd-Start }
elseif ($cmd -eq 'install') { Show-Banner; Assert-Dependencies; Cmd-Install }
elseif ($cmd -eq 'build')   { Show-Banner; Assert-Dependencies; Cmd-Build }
elseif ($cmd -eq 'dev')     { Show-Banner; Cmd-Dev -Apps $ExtraArgs }
elseif ($cmd -eq 'status')  { Cmd-Status }
elseif ($cmd -eq 'stop')    { Cmd-Stop }
elseif ($cmd -eq 'cleanup') { Cmd-Cleanup }
else                        { Show-Help }
