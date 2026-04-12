#!/usr/bin/env pwsh

param(
    [Parameter(ValueFromRemainingArguments=$true)]
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
  clean         Remove node_modules, .next, and .turbo directories

Options:
  -Help         Show this help message

Examples:
  .\start.ps1 install
  .\start.ps1 install build
  .\start.ps1 install dev
  .\start.ps1 dev
  .\start.ps1 clean

Default behavior (no args): runs 'install dev'
"@
}

function Run-Install {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    pnpm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
}

function Run-Build {
    Write-Host "🔨 Building all apps..." -ForegroundColor Cyan
    pnpm build
    Write-Host "✅ Build complete" -ForegroundColor Green
}

function Run-Dev {
    Write-Host "🚀 Starting development servers..." -ForegroundColor Cyan
    pnpm dev
}

function Run-Dev-Portal {
    Write-Host "🚀 Starting portal development server..." -ForegroundColor Cyan
    pnpm dev:portal
}

function Run-Clean {
    Write-Host "🧹 Cleaning up..." -ForegroundColor Cyan
    pnpm clean
    Write-Host "✅ Cleanup complete" -ForegroundColor Green
}

if ($Commands.Count -eq 0) {
    Run-Install
    Run-Dev
    exit 0
}

foreach ($cmd in $Commands) {
    switch ($cmd) {
        "install" {
            Run-Install
        }
        "build" {
            Run-Build
        }
        "dev" {
            Run-Dev
        }
        "dev:portal" {
            Run-Dev-Portal
        }
        "clean" {
            Run-Clean
        }
        "-Help" {
            Print-Usage
            exit 0
        }
        default {
            Write-Host "❌ Unknown command: $cmd" -ForegroundColor Red
            Print-Usage
            exit 1
        }
    }
}
