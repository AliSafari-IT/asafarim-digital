#!/usr/bin/env pwsh

param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Commands
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

function Print-Usage {
    @"
Usage: .\start.ps1 [COMMAND] [OPTIONS]

Commands:
  install       Install dependencies using pnpm
  build         Build all apps (requires dependencies installed)
  dev           Start development servers for all apps
  dev:portal    Start only the portal app in development mode
  dev:ops       Start only the ops-hub app in development mode
  db:push       Sync Prisma schema to local database (no migration file)
  db:seed       Re-run the database seed (idempotent upserts)
  db:reset      Drop & recreate local DB, apply schema, then seed
  clean         Remove node_modules, .next, and .turbo directories

Options:
  -Help         Show this help message

Default behavior (no args): runs 'install dev'
"@
}

$AppDirs = @("apps/portal", "apps/content-generator", "apps/ops-hub")
$PackageDirs = @("packages/auth", "packages/db", "packages/ui", "packages/types", "packages/config")

function Test-WorkspaceReady {
    foreach ($dir in ($AppDirs + $PackageDirs)) {
        $pkgJson = Join-Path $scriptDir "$dir/package.json"
        if (-not (Test-Path $pkgJson)) { continue }
        $hasDeps = $false
        try {
            $json = Get-Content $pkgJson -Raw | ConvertFrom-Json
            if ($json.dependencies -or $json.devDependencies) { $hasDeps = $true }
        } catch { $hasDeps = $true }
        if ($hasDeps) {
            $nodeModules = Join-Path $scriptDir "$dir/node_modules"
            if (-not (Test-Path $nodeModules)) {
                Write-Host "  [missing] node_modules in $dir" -ForegroundColor Yellow
                return $false
            }
        }
    }
    $prismaClient = Join-Path $scriptDir "node_modules/.pnpm"
    if (-not (Test-Path $prismaClient)) { return $false }
    return $true
}

function Invoke-PrismaGenerate {
    Write-Host "[prisma] Generating client..." -ForegroundColor Cyan
    pnpm --filter @asafarim/db exec prisma generate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[prisma] Generate failed (likely file lock). Close dev servers and retry." -ForegroundColor Yellow
    }
}

function Run-Install {
    Write-Host "[install] Installing workspace dependencies..." -ForegroundColor Cyan
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[install] pnpm install failed. Retrying with --ignore-scripts..." -ForegroundColor Yellow
        pnpm install --ignore-scripts
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[install] FAILED even with --ignore-scripts" -ForegroundColor Red
            exit 1
        }
        Invoke-PrismaGenerate
    }
    if (-not (Test-WorkspaceReady)) {
        Write-Host "[install] Some packages missing node_modules. Re-running..." -ForegroundColor Yellow
        pnpm install --ignore-scripts
        Invoke-PrismaGenerate
    }
    Write-Host "[install] Done." -ForegroundColor Green
}

function Confirm-Deps {
    if (-not (Test-WorkspaceReady)) {
        Write-Host "[deps] Workspace not fully installed. Installing..." -ForegroundColor Cyan
        Run-Install
    }
}

function Run-Build {
    Write-Host "[build] Building all apps..." -ForegroundColor Cyan
    pnpm build
    Write-Host "[build] Done." -ForegroundColor Green
}

function Run-Dev {
    Confirm-Deps
    Write-Host "[dev] Starting all dev servers..." -ForegroundColor Cyan
    pnpm dev
}

function Run-Dev-Portal {
    Confirm-Deps
    Write-Host "[dev] Starting portal..." -ForegroundColor Cyan
    pnpm dev:portal
}

function Start-Dev-Ops {
    Confirm-Deps
    Write-Host "[dev] Starting ops-hub..." -ForegroundColor Cyan
    pnpm dev:ops
}

function Run-Clean {
    Write-Host "[clean] Cleaning workspace..." -ForegroundColor Cyan
    pnpm clean
    Write-Host "[clean] Done." -ForegroundColor Green
}

function Get-DatabaseUrl {
    $envFile = Join-Path $scriptDir ".env"
    if (Test-Path $envFile) {
        $line = Get-Content $envFile | Where-Object { $_ -match "^\s*DATABASE_URL\s*=" } | Select-Object -First 1
        if ($line) {
            return ($line -replace "^\s*DATABASE_URL\s*=\s*", "").Trim()
        }
    }
    if ($env:DATABASE_URL) { return $env:DATABASE_URL }
    Write-Host "[db] DATABASE_URL not found in root .env or environment." -ForegroundColor Red
    exit 1
}

function Invoke-DbPush {
    Confirm-Deps
    $dbUrl = Get-DatabaseUrl
    Write-Host "[db:push] Syncing Prisma schema to database..." -ForegroundColor Cyan
    $env:DATABASE_URL = $dbUrl
    pnpm --filter @asafarim/db exec prisma db push
    Write-Host "[db:push] Done." -ForegroundColor Green
}

function Invoke-DbSeed {
    Confirm-Deps
    $dbUrl = Get-DatabaseUrl
    Write-Host "[db:seed] Running seed..." -ForegroundColor Cyan
    $env:DATABASE_URL = $dbUrl
    pnpm --filter @asafarim/db db:seed
    Write-Host "[db:seed] Done." -ForegroundColor Green
}

function Invoke-DbReset {
    Confirm-Deps
    $dbUrl = Get-DatabaseUrl
    Write-Host "[db:reset] Force-resetting database (schema push + seed)..." -ForegroundColor Yellow
    $env:DATABASE_URL = $dbUrl
    pnpm --filter @asafarim/db exec prisma db push --force-reset --accept-data-loss
    pnpm --filter @asafarim/db db:seed
    Write-Host "[db:reset] Done." -ForegroundColor Green
}

if ($Commands.Count -eq 0) {
    Run-Install
    Run-Dev
    exit 0
}

foreach ($cmd in $Commands) {
    switch ($cmd) {
        "install"    { Run-Install }
        "build"      { Run-Build }
        "dev"        { Run-Dev }
        "dev:portal" { Run-Dev-Portal }
        "dev:ops"    { Start-Dev-Ops }
        "db:push"    { Invoke-DbPush }
        "db:seed"    { Invoke-DbSeed }
        "db:reset"   { Invoke-DbReset }
        "clean"      { Run-Clean }
        "-Help"      { Print-Usage; exit 0 }
        default      {
            Write-Host "[error] Unknown command: $cmd" -ForegroundColor Red
            Print-Usage
            exit 1
        }
    }
}
