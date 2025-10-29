# Script de actualizacion automatica para Credihogar
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ACTUALIZANDO REPOSITORIO CREDIHOGAR" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si estamos en un repositorio Git
if (-not (Test-Path .git)) {
    Write-Host "ERROR: No estas en un repositorio Git" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Verificar si hay cambios
$changes = git status --porcelain
if (-not $changes) {
    Write-Host "OK: No hay cambios para subir" -ForegroundColor Green
    Write-Host ""
    Read-Host "Presiona Enter para continuar"
    exit 0
}

# Mostrar cambios
Write-Host "CAMBIOS DETECTADOS:" -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "Agregando archivos al staging area..." -ForegroundColor Blue
git add .

Write-Host ""
$message = Read-Host "Describe los cambios realizados (Enter para mensaje automatico)"

if ([string]::IsNullOrWhiteSpace($message)) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $message = "Actualizacion automatica - $timestamp"
}

Write-Host ""
Write-Host "Creando commit..." -ForegroundColor Blue
git commit -m "AUTO: $message"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo crear el commit" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""
Write-Host "Subiendo cambios a GitHub..." -ForegroundColor Blue
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudieron subir los cambios" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""
Write-Host "EXITO: Cambios subidos a GitHub!" -ForegroundColor Green
Write-Host "INFO: Los cambios se desplegaran automaticamente en Netlify" -ForegroundColor Cyan
Write-Host ""

# Mostrar informacion util
Write-Host "INFORMACION DEL REPOSITORIO:" -ForegroundColor Magenta
Write-Host "   Repositorio: $(git config --get remote.origin.url)" -ForegroundColor Gray
Write-Host "   Rama actual: $(git branch --show-current)" -ForegroundColor Gray
$lastCommit = git log -1 --pretty=format:"%h - %s"
Write-Host "   Ultimo commit: $lastCommit" -ForegroundColor Gray

Write-Host ""
Read-Host "Presiona Enter para continuar"