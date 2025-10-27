Supabase & Migration Guide (Resumen rápido)

1) Crear proyecto Supabase
 - Ve a https://app.supabase.com/ y crea un proyecto (plan gratuito).
 - Copia la `Project URL` y la `anon public key` (Settings -> API).
 - Crea un bucket llamado `images` en Storage y marca como público (o configura políticas para URLs públicas).

2) Ejecutar SQL
 - Abre SQL Editor y ejecuta el contenido de `supabase_setup.sql` provisto en el repo.

3) Configuración local del frontend
 - Copia `config.example.js` a `config.js` en la raíz del proyecto.
 - Rellena `window.SUPABASE_URL` y `window.SUPABASE_ANON_KEY` con tus valores.

4) Migración de imágenes desde tu carpeta `Catalog`
 - Crea un archivo `.env` con:
   SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
 - Instala dependencias:
   npm install
 - Ejecuta:
   npm run upload-catalog
 - El script subirá imágenes a `images` bucket y creará registros en la tabla `products`.

5) Probar la app
 - Abre `index.html` (o despliega el sitio en Netlify) y verifica que el catálogo aparece y las imágenes son públicas.

Notas de seguridad
 - NUNCA peques ni subas el `SERVICE_ROLE_KEY` en el frontend. Solo úsalo en el script de migración local.
 - Para operaciones desde el navegador usa la `anon` key y las políticas RLS definidas.
