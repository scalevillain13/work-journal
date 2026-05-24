#Requires -Version 5.1
<#
.SYNOPSIS
  Подготовка БД: миграции и seed (нужен запущенный PostgreSQL).
#>
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root "backend"

if (-not (Test-Path (Join-Path $backend ".env"))) {
    Copy-Item (Join-Path $backend ".env.example") (Join-Path $backend ".env")
    Write-Host "Создан backend\.env из .env.example" -ForegroundColor Yellow
}

Set-Location $backend

if (-not (Test-Path "node_modules")) {
    Write-Host "Установка зависимостей backend..." -ForegroundColor Cyan
    npm install
}

Write-Host "Миграции..." -ForegroundColor Cyan
npx prisma migrate deploy

Write-Host "Seed справочника видов работ..." -ForegroundColor Cyan
npx prisma db seed

Write-Host "База данных готова." -ForegroundColor Green
