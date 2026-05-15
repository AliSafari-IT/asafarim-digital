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
# vionto-schemas) are source-only and are handled by transpilePackages in each app's
# next.config.ts - no separate build step needed.
$PACKAGES_BUILD_ORDER = @(
    "packages\db",         # prisma generate
    "packages\auth",       # tsc
    "packages\payments",   # tsup
    "packages\ui",         # tsup
    "packages\navigation", # tsup (publishable to npm)
    "packages\location"    # tsc --noEmit (type-check only, no output)
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
    param([int]$Port, [int]$WaitSeconds = 3)
    $startTime = Get-Date

    # Use kill-port for faster process termination
    try {
        $null = & npx kill-port $Port 2>&1
        Log-Info "Killed process on port $Port using kill-port"
    } catch {
        # Fallback to manual method if kill-port fails
        $pids = netstat -ano 2>$null |
            Select-String ":$Port\s" |
            ForEach-Object { ($_ -split '\s+')[-1] } |
            Where-Object { $_ -match '^\d+$' } |
            Sort-Object -Unique

        if ($pids) {
            foreach ($p in $pids) {
                try {
                    $proc = Get-Process -Id ([int]$p) -ErrorAction SilentlyContinue
                    if ($proc) {
                        $null = cmd /c "taskkill /PID $p /T /F 2>nul"
                        Log-Info "Stopped process tree $p on port $Port (fallback)"
                    }
                } catch {}
            }
        }
    }

    # Verify port is freed with timeout
    $elapsed = ((Get-Date) - $startTime).TotalSeconds
    while ($elapsed -lt $WaitSeconds) {
        $stillListening = netstat -ano 2>$null | Select-String ":$Port\s.*LISTENING"
        if (-not $stillListening) { return $true }
        Start-Sleep -Milliseconds 200
        $elapsed = ((Get-Date) - $startTime).TotalSeconds
    }

    return $true
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

function Stop-AppPorts {
    Log-Step "Releasing app ports before dependency work..."
    foreach ($kv in $APP_PORTS.GetEnumerator()) {
        Stop-ProcessOnPort -Port $kv.Value | Out-Null
    }
}

function Stop-WorkspaceNodeProcesses {
    param([int]$WaitSeconds = 1)

    $repoPath = $SCRIPT_DIR
    $processes = Get-CimInstance Win32_Process -Filter "name = 'node.exe'" -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -like "*$repoPath*" }

    if (-not $processes) { return }

    foreach ($proc in $processes) {
        try {
            Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
            Log-Info "Stopped workspace Node process $($proc.ProcessId)"
        } catch {}
    }

    if ($WaitSeconds -gt 0) { Start-Sleep -Seconds $WaitSeconds }
}

function Test-PrismaGeneratedClientExists {
    $pnpmDir = Join-Path $SCRIPT_DIR "node_modules\.pnpm"
    if (-not (Test-Path $pnpmDir)) { return $false }

    $engine = Get-ChildItem `
        -Path $pnpmDir `
        -Filter "query_engine-windows.dll.node" `
        -Recurse `
        -File `
        -ErrorAction SilentlyContinue |
        Select-Object -First 1

    return ($null -ne $engine)
}

function Test-PrismaWindowsRenameLock {
    param($Output)
    $text = ($Output | Out-String)
    return ($text -match "EPERM: operation not permitted, rename" -and
            $text -match "query_engine-windows\.dll\.node")
}

function Invoke-PrismaGenerate {
    Log-Info ">>> packages\db (prisma generate)"
    $dbDir = Join-Path $SCRIPT_DIR "packages\db"
    Push-Location $dbDir
    $previousErrorActionPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = "Continue"
        $output = & pnpm.cmd exec prisma generate 2>&1
        $exitCode = $LASTEXITCODE
        if ($output) {
            $output |
                ForEach-Object { $_.ToString() } |
                Where-Object { $_ -notmatch "^System\.Management\.Automation\." } |
                ForEach-Object { Write-Host $_ }
        }

        if ($exitCode -eq 0) { return }

        if ((Test-PrismaWindowsRenameLock -Output $output) -and (Test-PrismaGeneratedClientExists)) {
            Log-Warn "Prisma generate hit a Windows file lock while replacing the query engine DLL."
            Log-Warn "An existing generated Prisma client is present, so startup will continue."
            Log-Warn "If schema changes are missing, close dev servers/VS Code TypeScript server and run: pnpm --filter @asafarim/db exec prisma generate"
            return
        }

        throw "prisma generate failed"
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
        Pop-Location
    }
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

        # Single `docker ps` call returning state instead of two separate calls.
        $state = docker ps -a --filter "name=^${name}$" --format "{{.State}}" 2>$null

        if ($state -eq "running") {
            Log-Info "OK $name already running — reusing"
            continue
        }

        if ($state) {
            # Container exists but is stopped → just start it (very fast, ~0.5s)
            Log-Info "Starting existing container: $name"
            docker start $name | Out-Null
        } else {
            # First-time creation. Only pull if the image isn't already local.
            $hasImage = docker image inspect $image 2>$null
            if (-not $hasImage) {
                Log-Info "Pulling image: $image"
                docker pull $image | Out-Null
            }
            Log-Info "Creating container: $name on $ports"
            $runCmd = "docker run -d --name $name $ports --restart unless-stopped $image"
            Invoke-Expression $runCmd | Out-Null
        }

        # Wait up to 10s for the port to be ready
        $port = ($ports -replace '.*-p (\d+):.*','$1')
        $ready = $false
        for ($i = 0; $i -lt 10; $i++) {
            if (Test-PortListening -Port ([int]$port)) { $ready = $true; break }
            Start-Sleep -Milliseconds 300
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
    # Stop all services in parallel. Use `docker stop -t 1` so the daemon waits
    # at most 1s before SIGKILL; we don't need graceful shutdown for dev Redis.
    # We do NOT `rm -f` — keeping the container around lets `start` reuse it
    # instantly instead of recreating (~3-5s saved per service on Windows).
    $names = $DOCKER_SERVICES | ForEach-Object { $_.Name }
    if (-not $names) { return }

    $stopJobs = @()
    foreach ($name in $names) {
        $sj = Start-Job -ScriptBlock {
            param($n)
            # `docker stop` is a no-op if the container is already stopped or missing.
            docker stop -t 1 $n 2>$null | Out-Null
        } -ArgumentList $name
        $stopJobs += $sj
    }
    $stopJobs | Wait-Job -Timeout 5 | Out-Null
    $stopJobs | Remove-Job -Force -ErrorAction SilentlyContinue
    Log-Info "OK Docker services stopped (containers preserved for fast restart)"
}

# =============================================================================
# Commands
# =============================================================================

function Cmd-Install {
    Log-Step "Installing all dependencies (pnpm install from root)..."
    Push-Location $SCRIPT_DIR
    try {
        pnpm install
        if ($LASTEXITCODE -ne 0) {
            Log-Warn "pnpm install failed. Retrying with --ignore-scripts, then running Prisma generate separately..."
            pnpm install --ignore-scripts
            if ($LASTEXITCODE -ne 0) { throw "pnpm install failed" }
            Invoke-PrismaGenerate
        }
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
            if ($pkg -eq "packages\db") {
                Invoke-PrismaGenerate
            } else {
                Invoke-PnpmCommand -Dir $dir -Label $pkg -PnpmArgs "build"
            }
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
        # NOTE: We use `pnpm.cmd` (not `pnpm` which is the PowerShell wrapper) and
        # invoke it as an external process inside the job. The previous `cmd /c
        # "pnpm run dev 2>&1"` form exited prematurely on Next.js 16 because
        # cmd.exe couldn't keep its parent handle alive in a PS background job
        # — Next.js itself kept running but the job reported "Completed" and the
        # supervisor lost output. Calling `pnpm.cmd` directly keeps the job
        # tethered to the real dev process.
        $job = Start-Job -ScriptBlock {
            param($dir, $pathVar)
            $env:PATH = $pathVar
            $env:FORCE_COLOR = "0"
            Set-Location $dir
            & pnpm.cmd run dev 2>&1
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
        $reported = @{}
        while ($true) {
            foreach ($kv in $jobs.GetEnumerator()) {
                $out = Receive-Job -Job $kv.Value -ErrorAction SilentlyContinue
                if ($out) { foreach ($l in $out) { Write-Host "[$($kv.Key)] $l" } }
                if (-not $reported[$kv.Key] -and $kv.Value.State -in @('Completed','Failed')) {
                    Log-Warn "$($kv.Key) exited with state: $($kv.Value.State)"
                    $reported[$kv.Key] = $true
                }
            }
            Start-Sleep -Milliseconds 400
        }
    } finally {
        Log-Info "Stopping all dev servers..."
        $stopStart = Get-Date

        # Kill ports FIRST - fastest way to stop dev servers
        $stopJobs = @()
        foreach ($kv in $jobs.GetEnumerator()) {
            $port = $toStart[$kv.Key]
            $sj = Start-Job -ScriptBlock {
                param($p)
                # Use kill-port for faster termination
                try { $null = & npx kill-port $p 2>&1 } catch {}
                # Fallback to taskkill if kill-port fails
                $pids = netstat -ano 2>$null | Select-String ":$p\s" | ForEach-Object { ($_ -split '\s+')[-1] } | Where-Object { $_ -match '^\d+$' }
                foreach ($id in $pids) { cmd /c "taskkill /PID $id /T /F 2>nul" | Out-Null }
            } -ArgumentList $port
            $stopJobs += $sj
        }

        # Wait for all stop jobs with 2 second timeout
        $stopJobs | Wait-Job -Timeout 2 | Out-Null
        $stopJobs | Remove-Job -Force -ErrorAction SilentlyContinue

        # Then stop PowerShell jobs (cleanup)
        foreach ($kv in $jobs.GetEnumerator()) {
            Stop-Job -Job $kv.Value -ErrorAction SilentlyContinue
            Remove-Job -Job $kv.Value -Force -ErrorAction SilentlyContinue
        }

        # Final verification - kill any remaining quickly
        foreach ($kv in $jobs.GetEnumerator()) {
            Stop-ProcessOnPort -Port $toStart[$kv.Key] -WaitSeconds 1 | Out-Null
        }

        $stopDuration = ((Get-Date) - $stopStart).TotalSeconds
        Log-Info "OK All dev servers stopped in $([math]::Round($stopDuration,1))s"
    }
}

function Cmd-Start {
    Log-Step "Full pipeline: install, build packages, then dev..."
    Show-Banner
    Assert-Dependencies
    Stop-AppPorts
    Stop-WorkspaceNodeProcesses
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
    $stopStart = Get-Date

    # Kill ports FIRST - fastest way to stop dev servers
    Log-Info "Killing all app ports first..."
    $stopJobs = @()
    foreach ($kv in $APP_PORTS.GetEnumerator()) {
        $port = $kv.Value
        $sj = Start-Job -ScriptBlock {
            param($p)
            # Use kill-port for faster termination
            try { $null = & npx kill-port $p 2>&1 } catch {}
            # Fallback to taskkill if kill-port fails
            $pids = netstat -ano 2>$null | Select-String ":$p\s" | ForEach-Object { ($_ -split '\s+')[-1] } | Where-Object { $_ -match '^\d+$' }
            foreach ($id in $pids) { cmd /c "taskkill /PID $id /T /F 2>nul" | Out-Null }
        } -ArgumentList $port
        $stopJobs += $sj
    }

    # Wait for parallel kills with 2 second timeout
    $stopJobs | Wait-Job -Timeout 2 | Out-Null
    $stopJobs | Remove-Job -Force -ErrorAction SilentlyContinue

    # Then stop workspace processes (cleanup)
    Stop-WorkspaceNodeProcesses -WaitSeconds 0

    # Clean up any PowerShell jobs
    Get-Job | Stop-Job -ErrorAction SilentlyContinue
    Get-Job | Remove-Job -Force -ErrorAction SilentlyContinue

    Stop-DockerServices

    $stopDuration = ((Get-Date) - $stopStart).TotalSeconds
    Log-Info "OK All services stopped in $([math]::Round($stopDuration,1))s"
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
