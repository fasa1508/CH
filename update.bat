@echo off
echo ========================================
echo    ACTUALIZANDO REPOSITORIO CREDIHOGAR
echo ========================================
echo.

:: Verificar si hay cambios
git status --porcelain > temp_status.txt
set /p changes=<temp_status.txt
del temp_status.txt

if "%changes%"=="" (
    echo ✅ No hay cambios para subir
    echo.
    pause
    exit /b 0
)

:: Mostrar cambios
echo 📝 Cambios detectados:
git status --short

echo.
echo 🔄 Agregando archivos al staging area...
git add .

echo.
set /p message="💬 Describe los cambios realizados: "

if "%message%"=="" (
    set message=Actualización automática
)

echo.
echo 📦 Creando commit...
git commit -m "🚀 %message%"

if %errorlevel% neq 0 (
    echo ❌ Error al crear commit
    pause
    exit /b 1
)

echo.
echo ⬆️  Subiendo cambios a GitHub...
git push origin main

if %errorlevel% neq 0 (
    echo ❌ Error al subir cambios a GitHub
    pause
    exit /b 1
)

echo.
echo ✅ ¡Cambios subidos exitosamente a GitHub!
echo 🌐 Los cambios se desplegarán automáticamente en Netlify
echo.
pause