# 🚀 Actualización Automática del Repositorio

Este repositorio incluye scripts para actualizar automáticamente los cambios en GitHub y Netlify.

## 📁 Archivos de Actualización

- `update.bat` - Script para Windows (Command Prompt)
- `update.ps1` - Script para Windows (PowerShell)

## 🔄 Cómo Actualizar el Repositorio

### Método 1: Script Batch (Más Simple)
1. Haz doble clic en `update.bat`
2. Describe los cambios que realizaste
3. ¡Listo! Los cambios se suben automáticamente

### Método 2: Script PowerShell (Más Detallado)
1. Clic derecho en `update.ps1` → "Ejecutar con PowerShell"
2. Describe los cambios que realizaste
3. ¡Listo! Los cambios se suben automáticamente

### Método 3: Terminal Manual
```bash
# Agregar cambios
git add .

# Crear commit
git commit -m "Descripción de los cambios"

# Subir a GitHub
git push origin main
```

## 🌐 Despliegue Automático

Una vez que los cambios se suben a GitHub:
1. **GitHub** actualiza automáticamente el código
2. **Netlify** detecta los cambios y redespliega
3. **Tu sitio web** se actualiza en 2-3 minutos

## 💻 Descargar en Otra Computadora

Para obtener la versión más reciente en otra computadora:

```bash
# Clonar por primera vez
git clone https://github.com/fasa1508/CH.git

# O actualizar si ya tienes el repositorio
git pull origin main
```

## 🔧 Configuración Inicial (Solo primera vez)

Si usas una computadora nueva:

```bash
# Configurar usuario
git config --global user.name "fasa1508"
git config --global user.email "tu_email@gmail.com"

# Autenticarse con GitHub
gh auth login
```

## ⚡ Flujo de Trabajo Recomendado

1. **Hacer cambios** en los archivos
2. **Ejecutar** `update.bat` o `update.ps1`
3. **Esperar** 2-3 minutos para el deploy en Netlify
4. **Probar** el sitio en producción

## 🆘 Solución de Problemas

### Error: "Permission denied"
- Ejecuta: `gh auth login`
- Asegúrate de usar la cuenta `fasa1508`

### Error: "Not a git repository"  
- Verifica que estás en la carpeta correcta
- Debe contener la carpeta `.git`

### Error: "Nothing to commit"
- No hay cambios nuevos para subir
- Esto es normal si no modificaste archivos

## 📞 Contacto

Si tienes problemas, verifica:
1. Conexión a internet
2. Permisos de GitHub
3. Que estés en la carpeta correcta del proyecto