#!/usr/bin/env powershell
#Requires -Version 5.1

# Local Dev Docker Cleanup Script (Windows)
# Removes old Docker images and build cache to free up disk space
# Usage: .\scripts\dev-cleanup.ps1 [-DryRun] [-Force] [-AgeHours HOURS]

param(
    [switch]$DryRun,
    [switch]$Force,
    [int]$AgeHours = 3
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = "Stop"

$MIN_FREE_SPACE_GB = 25
$ROOT_PATH = Split-Path -Parent $PSScriptRoot
$DRIVE_LETTER = (Split-Path -Qualifier $ROOT_PATH).TrimEnd(":")

Write-Host "[*] Local Dev Docker Cleanup Script" -ForegroundColor Cyan
Write-Host "Age threshold: $AgeHours hours" -ForegroundColor Gray
Write-Host "Minimum free space: ${MIN_FREE_SPACE_GB}GB" -ForegroundColor Gray
Write-Host "Dry run: $DryRun" -ForegroundColor Gray
Write-Host "Force cleanup: $Force" -ForegroundColor Gray
Write-Host ""

# Check disk space
Write-Host "[*] Checking disk space..." -ForegroundColor Cyan
$drive = Get-PSDrive -Name $DRIVE_LETTER
$availableGB = [math]::Round($drive.Free / 1GB, 2)
Write-Host "Available disk space (${DRIVE_LETTER}:): ${availableGB}GB" -ForegroundColor Gray

# Determine if cleanup is needed
$CleanupNeeded = $false
if ($Force) {
    Write-Host "[!] Force cleanup enabled" -ForegroundColor Yellow
    $CleanupNeeded = $true
} elseif ($availableGB -lt $MIN_FREE_SPACE_GB) {
    Write-Host "[!] Disk space below threshold (${MIN_FREE_SPACE_GB}GB), cleanup needed" -ForegroundColor Yellow
    $CleanupNeeded = $true
} else {
    Write-Host "[OK] Sufficient disk space, cleanup optional" -ForegroundColor Green
}

# Show Docker usage
Write-Host ""
Write-Host "[*] Docker usage:" -ForegroundColor Cyan
Push-Location $ROOT_PATH
docker system df

Write-Host ""
Write-Host "[*] Docker images (showing oldest 20):" -ForegroundColor Cyan
docker images --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}\t{{.Size}}" | Select-Object -First 20

# Perform cleanup
Write-Host ""
if ($DryRun) {
    Write-Host "[DRY RUN] Showing what would be cleaned..." -ForegroundColor Magenta
    Write-Host "Would run: docker image prune -af --filter `"until=${AgeHours}h`"" -ForegroundColor Gray
    Write-Host "Would run: docker builder prune -af --filter `"until=${AgeHours}h`"" -ForegroundColor Gray
} else {
    if ($CleanupNeeded -or -not $Force) {
        Write-Host "[*] Cleaning Docker images older than ${AgeHours} hours..." -ForegroundColor Yellow
        docker image prune -af --filter "until=${AgeHours}h"
        
        Write-Host "[*] Cleaning build cache older than ${AgeHours} hours..." -ForegroundColor Yellow
        docker builder prune -af --filter "until=${AgeHours}h"
    } else {
        Write-Host "[-] Skipping cleanup (use -Force to clean anyway)" -ForegroundColor Gray
    }
}

# Check results
Write-Host ""
Write-Host "[*] Docker usage after cleanup:" -ForegroundColor Cyan
docker system df

# Check container health
Write-Host ""
Write-Host "[*] Checking container health:" -ForegroundColor Cyan
docker compose ps

# Summary
$driveAfter = Get-PSDrive -Name $DRIVE_LETTER
$availableGBAfter = [math]::Round($driveAfter.Free / 1GB, 2)
$freed = [math]::Round($availableGBAfter - $availableGB, 2)

Write-Host ""
Write-Host "[*] Cleanup Summary:" -ForegroundColor Cyan
Write-Host "  Disk space: ${availableGB}GB -> ${availableGBAfter}GB" -ForegroundColor Gray
if ($freed -gt 0) {
    Write-Host "  Space freed: ${freed}GB" -ForegroundColor Green
} elseif ($freed -lt 0) {
    Write-Host "  Space change: ${freed}GB (other processes may have used space)" -ForegroundColor Yellow
} else {
    Write-Host "  Space freed: ~0GB (images were newer than ${AgeHours}h)" -ForegroundColor Gray
}

if ($DryRun) {
    Write-Host "  Mode: Dry run (no actual cleanup performed)" -ForegroundColor Magenta
} else {
    Write-Host "  Mode: Cleanup completed" -ForegroundColor Green
}

Write-Host "[OK] Done!" -ForegroundColor Green
Pop-Location
