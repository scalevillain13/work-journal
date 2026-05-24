#Requires -Version 5.1
<#
.SYNOPSIS
  Запуск backend и frontend в двух окнах PowerShell (без Docker).
  Перед этим: PostgreSQL должен работать, выполните scripts\setup-db.ps1
#>
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

foreach ($dir in @($backend, $frontend)) {
    if (-not (Test-Path (Join-Path $dir "node_modules"))) {
        Write-Host "Установка зависимостей в $dir ..." -ForegroundColor Cyan
        Push-Location $dir
        npm install
        Pop-Location
    }
}

Write-Host "Запуск backend (порт 3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$backend'; npm run dev"
)

Start-Sleep -Seconds 2

Write-Host "Запуск frontend (порт 5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$frontend'; npm run dev"
)

Write-Host ""
Write-Host "Откройте в браузере: http://localhost:5173" -ForegroundColor Green
Write-Host "API: http://localhost:3001/api/health" -ForegroundColor Green
