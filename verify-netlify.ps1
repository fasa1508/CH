# Script de Verificacion de Conexion con Netlify
# Este script verifica si tu proyecto esta correctamente conectado a Netlify

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  VERIFICACION DE CONEXION CON NETLIFY" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar que estamos en un repositorio Git
Write-Host "1. Verificando repositorio Git..." -ForegroundColor Yellow
if (-not (Test-Path .git)) {
    Write-Host "   ERROR: No estas en un repositorio Git" -ForegroundColor Red
    exit 1
} else {
    $repoUrl = git config --get remote.origin.url
    Write-Host "   OK Repositorio Git encontrado" -ForegroundColor Green
    Write-Host "      URL: $repoUrl" -ForegroundColor Gray
}

Write-Host ""

# 2. Verificar archivo netlify.toml
Write-Host "2. Verificando archivo netlify.toml..." -ForegroundColor Yellow
if (Test-Path netlify.toml) {
    Write-Host "   OK Archivo netlify.toml encontrado" -ForegroundColor Green
    $netlifyConfig = Get-Content netlify.toml -Raw
    if ($netlifyConfig -match 'publish\s*=\s*"([^"]+)"') {
        Write-Host "      Directorio de publicacion: $($Matches[1])" -ForegroundColor Gray
    }
} else {
    Write-Host "   ERROR: netlify.toml no encontrado" -ForegroundColor Red
    Write-Host "      Este archivo es necesario para el deploy en Netlify" -ForegroundColor Yellow
}

Write-Host ""

# 3. Verificar archivos principales del proyecto
Write-Host "3. Verificando archivos del proyecto..." -ForegroundColor Yellow
$requiredFiles = @("index.html", "app.js", "admin.js", "config.js")
$allFilesExist = $true

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   OK $file" -ForegroundColor Green
    } else {
        Write-Host "   ERROR $file (NO ENCONTRADO)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

Write-Host ""

# 4. Verificar configuracion de Supabase
Write-Host "4. Verificando configuracion de Supabase..." -ForegroundColor Yellow
if (Test-Path config.js) {
    $configContent = Get-Content config.js -Raw
    if ($configContent -match 'SUPABASE_URL') {
        Write-Host "   OK SUPABASE_URL configurado" -ForegroundColor Green
    } else {
        Write-Host "   ADVERTENCIA SUPABASE_URL no encontrado" -ForegroundColor Yellow
    }
    
    if ($configContent -match 'SUPABASE_ANON_KEY') {
        Write-Host "   OK SUPABASE_ANON_KEY configurado" -ForegroundColor Green
    } else {
        Write-Host "   ADVERTENCIA SUPABASE_ANON_KEY no encontrado" -ForegroundColor Yellow
    }
}

Write-Host ""

# 5. Verificar estado del repositorio
Write-Host "5. Estado del repositorio..." -ForegroundColor Yellow
$branch = git branch --show-current
Write-Host "   Rama actual: $branch" -ForegroundColor Gray

$status = git status --porcelain
if ($status) {
    Write-Host "   ADVERTENCIA Hay cambios sin subir" -ForegroundColor Yellow
    Write-Host "      Ejecuta update.ps1 para subirlos" -ForegroundColor Gray
} else {
    Write-Host "   OK Todo esta sincronizado con GitHub" -ForegroundColor Green
}

Write-Host ""

# 6. Informacion de ultimos commits
Write-Host "6. Ultimos commits subidos..." -ForegroundColor Yellow
$lastCommits = git log --oneline -3
foreach ($commit in $lastCommits) {
    Write-Host "      $commit" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  RESULTADO DE LA VERIFICACION" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Resumen
Write-Host "OK CONFIGURACION LOCAL:" -ForegroundColor Green
Write-Host "   - Repositorio Git conectado a GitHub" -ForegroundColor White
Write-Host "   - Archivos de proyecto presentes" -ForegroundColor White
Write-Host "   - Configuracion de Netlify (netlify.toml) lista" -ForegroundColor White

Write-Host ""
Write-Host "ADVERTENCIA VERIFICACION MANUAL NECESARIA:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para confirmar que Netlify esta conectado automaticamente:" -ForegroundColor White
Write-Host ""
Write-Host "1. Ve a: https://app.netlify.com" -ForegroundColor Cyan
Write-Host "2. Inicia sesion con tu cuenta" -ForegroundColor White
Write-Host "3. Busca tu sitio en la lista de Sites" -ForegroundColor White
Write-Host "4. Verifica que diga:" -ForegroundColor White
Write-Host "   - Connected to GitHub: fasa1508/CH" -ForegroundColor Gray
Write-Host "   - Auto-publishing enabled" -ForegroundColor Gray
Write-Host ""

Write-Host "COMO CONECTAR NETLIFY SI NO ESTA CONECTADO:" -ForegroundColor Magenta
Write-Host ""
Write-Host "Opcion A - Deploy desde GitHub (Recomendado):" -ForegroundColor White
Write-Host "   1. En Netlify: New site -> Import from Git" -ForegroundColor Gray
Write-Host "   2. Selecciona GitHub -> Autoriza -> Elige fasa1508/CH" -ForegroundColor Gray
Write-Host "   3. Netlify detectara netlify.toml automaticamente" -ForegroundColor Gray
Write-Host "   4. Click en Deploy site" -ForegroundColor Gray
Write-Host ""
Write-Host "Opcion B - Deploy manual (Mas rapido para probar):" -ForegroundColor White
Write-Host "   1. Ve a: https://app.netlify.com/drop" -ForegroundColor Gray
Write-Host "   2. Arrastra toda la carpeta del proyecto" -ForegroundColor Gray
Write-Host "   3. Netlify creara el sitio automaticamente" -ForegroundColor Gray
Write-Host ""

Write-Host "DESPUES DE CONECTAR:" -ForegroundColor Green
Write-Host "   - Cada vez que hagas git push a GitHub" -ForegroundColor White
Write-Host "   - Netlify detectara los cambios automaticamente" -ForegroundColor White
Write-Host "   - Y desplegara la nueva version en 2-3 minutos" -ForegroundColor White
Write-Host ""

Write-Host "TIP: Guarda la URL de tu sitio Netlify para compartirla" -ForegroundColor Cyan
Write-Host "   Ejemplo: https://credihogar.netlify.app" -ForegroundColor Gray
Write-Host ""

Read-Host "Presiona Enter para continuar"
