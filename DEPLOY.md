# Credihogar - Catálogo Móvil (PHP + MySQL)

![Credihogar](https://img.shields.io/badge/Status-Producción-success) ![Hosting](https://img.shields.io/badge/Deploy-Hosting%20Linux-blue)

## 📋 Descripción

Catálogo móvil profesional para Credihogar que permite al dueño gestionar productos con imágenes y a los clientes navegar el catálogo y comprar vía WhatsApp.

### ✨ Características

- **Panel de Administración**: CRUD completo de productos con carga de imágenes
- **Catálogo Público**: Navegación por categorías, búsqueda y filtros
- **Integración WhatsApp**: Compra directa con mensaje prellenado
- **Responsive**: Diseño mobile-first optimizado para todos los dispositivos
- **Almacenamiento**: Sistema de archivos local (carpeta uploads/) con optimización de imágenes
- **Autenticación**: Sesiones PHP (login seguro con hash de contraseña)

## 🛠️ Stack Tecnológico

- **Frontend**: Vanilla JavaScript (ES6), HTML5, CSS3
- **Backend**: PHP + MySQL (PDO) + sesiones
- **Hosting**: Linux (Apache con mod_rewrite)
- **Estilo**: Mobile-first responsive, Poppins font

## 📁 Estructura de Archivos

```
CH/
├── index.html          # Punto de entrada principal
├── app.js              # Lógica del catálogo público
├── admin.js            # Panel de administración
├── auth.js             # Sistema de autenticación
├── styles.css          # Estilos profesionales
├── config-mysql.js     # Configuración API PHP (reemplaza config.js)
├── mysql_setup.sql     # Esquema de base de datos MySQL
├── api/                # API PHP (auth, products, categories, upload)
├── uploads/            # Carpeta pública de imágenes
└── assets/             # Recursos estáticos
```

## 🚀 Deployment en Hosting Linux (Apache + PHP + MySQL)

### Paso 1: Preparación

1. Hosting Linux con PHP 7.4+, MySQL 5.7+ (o MariaDB 10.3+) y Apache 2.4 con mod_rewrite
2. Acceso a phpMyAdmin o consola MySQL
3. Acceso FTP/SFTP o Git en el servidor

### Paso 2: Crear Base de Datos MySQL

1. Entra a phpMyAdmin (o consola) y crea una base de datos (ej: `credihogar_db`)
2. Importa el archivo `mysql_setup.sql`
3. Crea un usuario con permisos sobre esa base de datos

### Paso 3: Configurar API PHP

1. Copia `api/config.example.php` a `api/config.php`
2. Edita `api/config.php` con tus credenciales de MySQL y tu dominio (`BASE_URL`)
3. Asegura que el directorio `uploads/products/` exista y tenga permisos de escritura (chmod 777 si es necesario)

### Paso 4: Subir Archivos al Hosting

1. Sube todo el contenido del proyecto a `public_html/` (o la carpeta pública de tu hosting)
2. Verifica que existe `.htaccess` en la raíz y en `api/`
3. Edita `config-mysql.js` y establece `window.API_BASE_URL` con la URL de tu dominio

### Paso 5: Verificación Post-Deploy

1. Abre tu dominio en el navegador
2. Inicia sesión con el usuario admin (por defecto: `admin@credihogar.com` / `admin123`) y CAMBIA la contraseña
3. Crea un producto de prueba y sube una imagen
4. Verifica que el catálogo público muestre los productos y las imágenes

## 🧪 Desarrollo Local (XAMPP/WAMP/Laragon)

### Requisitos

- PHP + MySQL (incluidos en XAMPP/WAMP/Laragon)

### Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/credihogar.git
cd credihogar
```

2. Configura API local:
   - Copia `api/config.example.php` a `api/config.php`
   - Usa credenciales locales (XAMPP: usuario `root`, sin password)
   - BASE_URL: `http://localhost/CH`

3. Configura frontend:
   - En `config-mysql.js` establece `window.API_BASE_URL = 'http://localhost/CH/api'`

4. Abre en el navegador: `http://localhost/CH`

## 🗄️ Configuración de Base de Datos

Ejecuta el script `mysql_setup.sql` en phpMyAdmin o consola MySQL para crear las tablas necesarias:

- users
- categories
- products
- sessions

## 📱 Uso

### Como Administrador

1. Accede a la app e inicia sesión
2. Haz clic en "Panel Admin"
3. Agrega productos con:
   - Nombre y descripción
   - Precio
   - Categoría (12 categorías predefinidas)
   - Imagen (se sube a Supabase Storage)
4. Edita o elimina productos existentes

### Como Cliente

1. Navega el catálogo por categorías
2. Usa la búsqueda para encontrar productos específicos
3. Toca un producto para ver detalles
4. Haz clic en "Comprar por WhatsApp" para contactar al vendedor

## 🔐 Seguridad

- Cambia la contraseña del usuario admin por defecto
- Genera una clave única para `JWT_SECRET` en `api/config.php`
- Mantén `api/config.php` fuera del control de versiones (está en `.gitignore`)
- Asegura permisos correctos en `uploads/`

## 📞 Integración con WhatsApp

El botón "Comprar por WhatsApp" abre un chat con mensaje prellenado:
- Nombre del producto
- Descripción
- Precio formateado
- Enlace a la imagen (vista previa automática)

## 🎨 Categorías Disponibles

1. Accesorios de baño
2. Almohadas y rellenos
3. Catálogo navideño
4. Cobijas
5. Cojines
6. Cortinas
7. Manteleria
8. Protectores
9. Sabanas
10. Tendidos estándar
11. Tendidos premium
12. Toallas

## 📝 Notas de Versión

### v2.0 - Versión Supabase (Actual)
- ✅ Migración completa a Supabase
- ✅ Panel de administración profesional
- ✅ Imágenes con aspect ratio uniforme (1:1)
- ✅ Diseño mejorado con animaciones y sombras
- ✅ Preparado para deployment en Netlify

### v1.0 - Versión Local
- localStorage para persistencia
- Sin backend
- Imágenes en base64

## 🤝 Soporte

Para problemas o preguntas, contacta al desarrollador o abre un issue en GitHub.

## 📄 Licencia

Propiedad de Credihogar - Todos los derechos reservados

---

**Desarrollado con ❤️ para Credihogar**
