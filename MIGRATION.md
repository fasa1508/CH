# 🚀 Guía de Migración - Supabase a MySQL + Hosting Linux

Esta guía detalla el proceso completo de migración de Credihogar desde Supabase/Netlify a MySQL/PHP en hosting Linux.

## 📋 Índice

1. [Cambios Realizados](#cambios-realizados)
2. [Requisitos del Hosting](#requisitos-del-hosting)
3. [Instalación en Hosting Linux](#instalación-en-hosting-linux)
4. [Configuración de Base de Datos](#configuración-de-base-de-datos)
5. [Pruebas Locales con XAMPP](#pruebas-locales-con-xampp)
6. [Deployment en Producción](#deployment-en-producción)
7. [Solución de Problemas](#solución-de-problemas)

---

## 🔄 Cambios Realizados

### Estructura Nueva del Proyecto

```
CH/
├── api/                      # 🆕 Backend PHP
│   ├── config.php           # Configuración DB (NO subir a Git)
│   ├── config.example.php   # Ejemplo de configuración
│   ├── auth.php             # API de autenticación
│   ├── products.php         # API de productos
│   ├── categories.php       # API de categorías
│   ├── upload.php           # API de subida de imágenes
│   └── .htaccess           # Configuración Apache
├── uploads/                 # 🆕 Almacenamiento de imágenes
│   └── products/
├── index.html              # Frontend (sin cambios mayores)
├── app.js                  # Frontend (sin cambios)
├── admin.js                # Frontend (sin cambios)
├── auth.js                 # Frontend (sin cambios)
├── config-mysql.js         # 🆕 Cliente API (reemplazo de Supabase)
├── mysql_setup.sql         # 🆕 Schema MySQL
├── .htaccess               # 🆕 Configuración Apache
└── styles.css              # Frontend (sin cambios)
```

### Archivos Eliminados/Reemplazados

- ❌ `config.js` (Supabase) → ✅ `config-mysql.js` (API PHP)
- ❌ `supabase_setup.sql` (PostgreSQL) → ✅ `mysql_setup.sql` (MySQL)
- ❌ `netlify.toml` → Ya no necesario
- ❌ Dependencia de Supabase CDN → Cliente API propio

### Tecnologías Nuevas

- **Backend:** PHP 7.4+ con PDO
- **Base de Datos:** MySQL 5.7+ / MariaDB 10.3+
- **Servidor Web:** Apache 2.4+ con mod_rewrite
- **Autenticación:** Sesiones PHP + Tokens
- **Storage:** Sistema de archivos local

---

## 🖥️ Requisitos del Hosting

### Mínimos

- PHP 7.4 o superior
- MySQL 5.7 o superior (o MariaDB 10.3+)
- Apache 2.4 con mod_rewrite habilitado
- 500 MB de espacio en disco
- SSL/TLS (HTTPS recomendado)

### Extensiones PHP Requeridas

```
- php-pdo
- php-pdo-mysql
- php-gd (para procesamiento de imágenes)
- php-json
- php-mbstring
- php-session
```

### Configuración PHP Recomendada

```ini
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 60
memory_limit = 128M
session.cookie_httponly = 1
session.cookie_secure = 1  (si tienes HTTPS)
```

---

## 🔧 Instalación en Hosting Linux

### Paso 1: Preparar Archivos

1. **Descargar el proyecto actualizado:**
```bash
git pull origin main
```

2. **Crear archivo de configuración API:**
```bash
cd api
cp config.example.php config.php
```

3. **Editar `api/config.php` con tus credenciales:**
```php
define('DB_HOST', 'localhost');              // Host de tu hosting
define('DB_NAME', 'tu_base_de_datos');       // Nombre de tu BD
define('DB_USER', 'tu_usuario');             // Usuario MySQL
define('DB_PASS', 'tu_password');            // Password MySQL
define('BASE_URL', 'https://tudominio.com'); // Tu dominio
```

4. **Editar `config-mysql.js` con tu URL:**
```javascript
window.API_BASE_URL = 'https://tudominio.com/api';
```

### Paso 2: Subir Archivos por FTP

1. **Conectar vía FTP/SFTP** a tu hosting

2. **Subir todo el proyecto** a la carpeta `public_html` o `www`:
```
/public_html/
├── api/
├── uploads/
├── assets/
├── index.html
├── config-mysql.js
├── app.js
├── admin.js
├── auth.js
├── styles.css
├── .htaccess
└── ... (todos los archivos)
```

3. **Establecer permisos:**
```bash
chmod 755 api/
chmod 755 uploads/
chmod 777 uploads/products/  # Escritura para uploads
chmod 644 api/*.php
chmod 644 *.html *.js *.css
```

### Paso 3: Configurar Base de Datos

1. **Acceder a phpMyAdmin** (desde el panel de tu hosting)

2. **Crear nueva base de datos:**
   - Nombre: `credihogar_db` (o el que prefieras)
   - Cotejamiento: `utf8mb4_unicode_ci`

3. **Crear usuario MySQL:**
   - Usuario: `credihogar_user`
   - Password: (genera uno seguro)
   - Privilegios: Todos sobre `credihogar_db`

4. **Importar schema:**
   - Ir a la pestaña "SQL"
   - Copiar y pegar el contenido de `mysql_setup.sql`
   - Click en "Ejecutar"

5. **Verificar tablas creadas:**
   ```
   ✅ users
   ✅ categories
   ✅ products
   ✅ sessions
   ```

6. **Cambiar password del admin:**
```sql
-- En phpMyAdmin, ejecutar:
UPDATE users 
SET password_hash = '$2y$10$NUEVO_HASH_AQUI' 
WHERE email = 'admin@credihogar.com';
```

Para generar un nuevo hash, usa este código PHP:
```php
<?php
echo password_hash('tu_nuevo_password', PASSWORD_DEFAULT);
?>
```

---

## 🧪 Pruebas Locales con XAMPP

### Instalación en XAMPP (Windows)

1. **Descargar e instalar XAMPP:**
   - https://www.apachefriends.org/download.html

2. **Copiar proyecto a htdocs:**
```
C:\xampp\htdocs\CH\
```

3. **Iniciar Apache y MySQL** desde el panel de XAMPP

4. **Crear base de datos:**
   - Abrir http://localhost/phpmyadmin
   - Crear base de datos `credihogar_db`
   - Importar `mysql_setup.sql`

5. **Configurar API:**

Editar `api/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'credihogar_db');
define('DB_USER', 'root');           // Usuario por defecto de XAMPP
define('DB_PASS', '');               // Sin password en XAMPP por defecto
define('BASE_URL', 'http://localhost/CH');
```

Editar `config-mysql.js`:
```javascript
window.API_BASE_URL = 'http://localhost/CH/api';
```

6. **Abrir en navegador:**
```
http://localhost/CH/
```

7. **Probar funcionalidades:**
   - ✅ Login (admin@credihogar.com / admin123)
   - ✅ Crear producto
   - ✅ Subir imagen
   - ✅ Ver catálogo público
   - ✅ Botón WhatsApp

---

## 🌐 Deployment en Producción

### Opción A: FTP Manual

1. **Comprimir archivos locales** (excluyendo node_modules, .git)
2. **Subir vía FTP** a tu hosting
3. **Configurar permisos** como se indicó arriba
4. **Crear base de datos** en el panel del hosting
5. **Importar SQL** en phpMyAdmin
6. **Actualizar config.php y config-mysql.js** con URLs de producción
7. **Probar** en tu dominio

### Opción B: Git + SSH (Hosting Avanzado)

Si tu hosting soporta SSH:

```bash
# Conectar por SSH
ssh usuario@tudominio.com

# Clonar repositorio
cd public_html
git clone https://github.com/fasa1508/CH.git .

# Copiar configuración
cd api
cp config.example.php config.php
nano config.php  # Editar con tus datos

# Establecer permisos
chmod 777 uploads/products/

# Salir
exit
```

### Checklist Post-Deployment

- [ ] Sitio carga correctamente (index.html)
- [ ] No hay errores en consola del navegador
- [ ] Login funciona
- [ ] Panel admin accesible
- [ ] Subida de imágenes funciona
- [ ] Listado de productos funciona
- [ ] Botón WhatsApp funciona
- [ ] HTTPS habilitado (recomendado)

---

## 🔐 Seguridad

### Configuraciones Importantes

1. **Cambiar password del admin inmediatamente**

2. **Generar JWT_SECRET único en config.php:**
```php
define('JWT_SECRET', 'CLAVE_ALEATORIA_SEGURA_64_CARACTERES_MINIMO');
```

3. **Proteger config.php:**
```apache
# Ya está en api/.htaccess
<Files "config.php">
    Order allow,deny
    Deny from all
</Files>
```

4. **Habilitar HTTPS:**
   - Solicitar certificado SSL en tu hosting
   - Forzar HTTPS en .htaccess (descomentar líneas)

5. **Backups regulares:**
   - Base de datos (exportar desde phpMyAdmin)
   - Carpeta uploads/

---

## 🐛 Solución de Problemas

### Error: "No se pudo conectar a la base de datos"

**Causa:** Credenciales incorrectas en `api/config.php`

**Solución:**
1. Verificar en el panel del hosting: nombre de BD, usuario, password
2. Verificar que el usuario tenga privilegios sobre la BD
3. Revisar que DB_HOST sea correcto (puede ser `localhost` o una IP)

### Error: "Failed to load resource: 404" en /api/

**Causa:** mod_rewrite no habilitado o .htaccess no funciona

**Solución:**
1. Verificar que `.htaccess` existe en la raíz
2. Contactar al hosting para habilitar mod_rewrite
3. Verificar AllowOverride en configuración de Apache

### Error: "Permission denied" al subir imágenes

**Causa:** Permisos incorrectos en carpeta uploads

**Solución:**
```bash
chmod 777 uploads/products/
# O desde FTP, establecer permisos de escritura
```

### Las imágenes no se muestran

**Causa:** URL de BASE_URL incorrecta

**Solución:**
1. Editar `api/config.php` y establecer BASE_URL correcto
2. Verificar que uploads/ sea accesible públicamente

### Session expired constantemente

**Causa:** Configuración de sesiones PHP

**Solución:**
Agregar al inicio de `api/config.php`:
```php
ini_set('session.gc_maxlifetime', 86400);
ini_set('session.cookie_lifetime', 86400);
session_set_cookie_params(86400);
```

---

## 📊 Comparativa: Antes vs Después

| Aspecto | Antes (Supabase/Netlify) | Después (MySQL/Linux) |
|---------|-------------------------|---------------------|
| **Backend** | Supabase (Cloud) | PHP propio (Hosting) |
| **Base de Datos** | PostgreSQL (Cloud) | MySQL (Hosting) |
| **Autenticación** | Supabase Auth | Sesiones PHP |
| **Storage** | Supabase Storage | Sistema de archivos |
| **Deployment** | Git push automático | FTP manual o Git |
| **Costo** | Gratis (límites) | Hosting (pago) |
| **Control** | Limitado | Total |
| **Escalabilidad** | Alta | Media |
| **Mantenimiento** | Bajo | Medio |

---

## 📞 Soporte

Si tienes problemas durante la migración:

1. **Revisa los logs de PHP:**
   - En el hosting: `error_log` o panel de control
   - En XAMPP: `C:\xampp\apache\logs\error.log`

2. **Revisa la consola del navegador** (F12)

3. **Verifica permisos** de archivos y carpetas

4. **Contacta al soporte de tu hosting** para:
   - Habilitar extensiones PHP
   - Configurar mod_rewrite
   - Ajustar límites de PHP

---

## ✅ Checklist de Migración Completa

- [ ] Backend PHP creado en carpeta `api/`
- [ ] Base de datos MySQL configurada
- [ ] Schema importado (`mysql_setup.sql`)
- [ ] `api/config.php` configurado con credenciales reales
- [ ] `config-mysql.js` configurado con URL de producción
- [ ] Archivos subidos al hosting vía FTP
- [ ] Permisos establecidos correctamente
- [ ] `.htaccess` funcionando
- [ ] Login funciona
- [ ] CRUD de productos funciona
- [ ] Upload de imágenes funciona
- [ ] Catálogo público se muestra
- [ ] WhatsApp funciona
- [ ] HTTPS habilitado (recomendado)
- [ ] Password de admin cambiado
- [ ] Backup inicial realizado

---

**¡Migración completada!** 🎉

Tu proyecto Credihogar ahora funciona con MySQL y PHP en tu propio hosting Linux.
