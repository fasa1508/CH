# Verificacion Rapida de Netlify

## Estado Actual de tu Proyecto

### ✅ GitHub - CONECTADO
- **Repositorio:** https://github.com/fasa1508/CH.git
- **Rama:** main
- **Estado:** Sincronizado y funcionando
- **Ultimo commit:** 29 de octubre, 2025

### ❓ Netlify - REQUIERE VERIFICACION MANUAL

## Como Verificar si Netlify Esta Conectado

### Paso 1: Ir al Dashboard de Netlify
1. Abre tu navegador
2. Ve a: **https://app.netlify.com**
3. Inicia sesion con tu cuenta

### Paso 2: Verificar Tu Sitio
Busca tu sitio en la lista. Deberia mostrar:
- ✅ Nombre del sitio (ejemplo: credihogar-catalog)
- ✅ URL activa (ejemplo: https://nombre-sitio.netlify.app)
- ✅ "Connected to GitHub: fasa1508/CH"
- ✅ Estado: "Published" o "Building"

### Paso 3: Verificar Deploy Automatico
1. Haz clic en tu sitio
2. Ve a "Site settings" -> "Build & deploy"
3. En la seccion "Continuous Deployment":
   - Deberia decir: **"GitHub" - Connected**
   - Branch to deploy: **main**
   - Auto publishing: **Enabled**

## Si Netlify NO Esta Conectado

### Opcion A: Conectar con GitHub (Deploy Automatico)

**Ventaja:** Cada push a GitHub actualiza automaticamente el sitio

1. En Netlify Dashboard, haz clic en **"Add new site"**
2. Selecciona **"Import an existing project"**
3. Elige **"Deploy with GitHub"**
4. Autoriza a Netlify para acceder a tu cuenta GitHub
5. Busca y selecciona el repositorio: **fasa1508/CH**
6. Configuracion de build:
   - Branch to deploy: **main**
   - Build command: *dejar vacio* (netlify.toml lo maneja)
   - Publish directory: **.** (punto, raiz del proyecto)
7. Haz clic en **"Deploy site"**
8. Espera 1-2 minutos mientras se despliega

**Resultado:** 
- URL generada automaticamente (ejemplo: https://random-name-123.netlify.app)
- Cada vez que hagas `git push` a GitHub, Netlify se actualiza automaticamente

### Opcion B: Deploy Manual Rapido (Sin GitHub)

**Ventaja:** Mas rapido para probar, pero debes actualizar manualmente

1. Ve a: **https://app.netlify.com/drop**
2. Arrastra la carpeta completa del proyecto
3. Suelta en el area de "Drop"
4. Netlify desplegara automaticamente

**Resultado:**
- Sitio publicado en 30-60 segundos
- Para actualizar, debes arrastrar de nuevo la carpeta

## Despues de Conectar

### Flujo de Trabajo Automatico (Opcion A)
```
Tu PC -> git push -> GitHub -> Netlify (automatico) -> Sitio actualizado
```

1. Haces cambios en tu codigo
2. Ejecutas `update.ps1` o `update.bat`
3. Los cambios suben a GitHub
4. **Netlify detecta los cambios automaticamente**
5. Netlify reconstruye y despliega en 2-3 minutos
6. Tu sitio web esta actualizado

### Flujo Manual (Opcion B)
```
Tu PC -> Arrastrar carpeta -> Netlify -> Sitio actualizado
```

## Como Verificar que Todo Funciona

### Prueba Rapida:
1. Haz un cambio minimo en `index.html` (ejemplo: cambia el titulo)
2. Ejecuta `update.ps1` para subir a GitHub
3. Ve a tu dashboard de Netlify
4. Deberia aparecer un nuevo deploy "Building..."
5. Espera 2-3 minutos
6. Abre la URL de tu sitio y verifica el cambio

## URLs Importantes

- **GitHub Repo:** https://github.com/fasa1508/CH
- **Netlify Dashboard:** https://app.netlify.com
- **Netlify Drop (deploy manual):** https://app.netlify.com/drop
- **Tu sitio web:** (obtenerla de Netlify despues de conectar)

## Configuracion Adicional Recomendada

### Cambiar Nombre del Sitio
1. En Netlify: Site settings -> General -> Site details
2. Click en "Change site name"
3. Elige un nombre personalizado: `credihogar-catalog`
4. Tu URL sera: https://credihogar-catalog.netlify.app

### Configurar Dominio Personalizado (Opcional)
1. Si tienes un dominio (ejemplo: credihogar.com)
2. En Netlify: Site settings -> Domain management
3. Click "Add custom domain"
4. Sigue las instrucciones para configurar DNS

### Actualizar CORS en Supabase
Despues de obtener tu URL de Netlify:
1. Ve a Supabase Dashboard
2. Settings -> API -> URL Configuration
3. Agrega tu URL de Netlify a la lista permitida
4. Ejemplo: `https://credihogar-catalog.netlify.app`

## Solucion de Problemas

### "Site not found" en Netlify
- Significa que aun no has conectado/creado el sitio
- Sigue los pasos de "Opcion A" o "Opcion B" arriba

### Deploy falla con error
1. Verifica que netlify.toml este en la raiz del proyecto
2. Revisa los logs del deploy en Netlify
3. Asegurate de que config.js tenga las credenciales correctas

### Cambios no se reflejan
1. Espera 2-3 minutos (tiempo de build)
2. Limpia cache del navegador (Ctrl + Shift + R)
3. Verifica en Netlify que el deploy fue exitoso

### "Connection refused" o errores de CORS
- Actualiza CORS en Supabase con tu URL de Netlify
- Ver seccion "Actualizar CORS en Supabase" arriba

## Comandos Utiles

```powershell
# Verificar estado de Git
git status

# Ver repositorio remoto
git remote -v

# Ver ultimos commits
git log --oneline -5

# Subir cambios
.\update.ps1

# Verificar conexion Netlify
.\verify-netlify.ps1
```

## Resumen

**Tu proyecto esta preparado para Netlify**, solo necesitas:
1. ✅ Codigo listo
2. ✅ GitHub conectado
3. ✅ netlify.toml configurado
4. ❓ **Conectar Netlify al repositorio GitHub** (ultimo paso)

Una vez conectes Netlify, tendras deploy automatico completo.
