# Credihogar - Catálogo Móvil con Supabase

![Credihogar](https://img.shields.io/badge/Status-Producción-success) ![Netlify](https://img.shields.io/badge/Deploy-Netlify-blue)

## 📋 Descripción

Catálogo móvil profesional para Credihogar que permite al dueño gestionar productos con imágenes y a los clientes navegar el catálogo y comprar vía WhatsApp.

### ✨ Características

- **Panel de Administración**: CRUD completo de productos con carga de imágenes
- **Catálogo Público**: Navegación por categorías, búsqueda y filtros
- **Integración WhatsApp**: Compra directa con mensaje prellenado
- **Responsive**: Diseño mobile-first optimizado para todos los dispositivos
- **Almacenamiento Cloud**: Supabase PostgreSQL + Storage para imágenes
- **Autenticación**: Login seguro con Supabase Auth

## 🛠️ Stack Tecnológico

- **Frontend**: Vanilla JavaScript (ES6), HTML5, CSS3
- **Backend**: Supabase (PostgreSQL + Storage + Auth)
- **Hosting**: Netlify
- **Estilo**: Mobile-first responsive, Poppins font

## 📁 Estructura de Archivos

```
CH/
├── index.html          # Punto de entrada principal
├── app.js              # Lógica del catálogo público
├── admin.js            # Panel de administración
├── auth.js             # Sistema de autenticación
├── styles.css          # Estilos profesionales
├── config.js           # Configuración Supabase
├── netlify.toml        # Configuración de deployment
├── supabase_setup.sql  # Schema de base de datos
└── assets/             # Recursos estáticos
```

## 🚀 Deployment en Netlify

### Paso 1: Preparación

1. Asegúrate de tener una cuenta en [Netlify](https://netlify.com)
2. Instala Git si no lo tienes (opcional pero recomendado)

### Paso 2: Configurar Supabase

1. Ve a tu proyecto en [Supabase](https://supabase.com/dashboard)
2. En **Settings → API**, copia tu `URL` y `anon key`
3. En **Configuration → URL Configuration**, agrega tu dominio de Netlify:
   ```
   https://tu-sitio.netlify.app
   ```

### Paso 3: Deploy con Netlify

#### Opción A: Desde Git (Recomendado)

1. Crea un repositorio en GitHub con tu código
2. En Netlify, haz clic en "Import from Git"
3. Selecciona tu repositorio
4. Configuración automática (lee `netlify.toml`)
5. Haz clic en "Deploy"

#### Opción B: Deploy Manual (Arrastrar y Soltar)

1. Ve a [Netlify Drop](https://app.netlify.com/drop)
2. Arrastra toda la carpeta del proyecto (excepto `node_modules` si existe)
3. Netlify desplegará automáticamente

### Paso 4: Configuración Post-Deploy

1. **Actualizar Supabase CORS**:
   - Ve a Supabase → Settings → API
   - Agrega tu URL de Netlify a la whitelist de CORS

2. **Configurar dominio personalizado** (opcional):
   - En Netlify: Site settings → Domain management
   - Agrega tu dominio personalizado

3. **Verificar deployment**:
   - Abre tu URL de Netlify
   - Prueba el login con tu usuario admin
   - Verifica que las imágenes cargan correctamente

## 🧪 Desarrollo Local

### Requisitos

- Node.js v18+ (solo para live-server)
- Cuenta Supabase configurada

### Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/credihogar.git
cd credihogar
```

2. Instala live-server (opcional):
```bash
npm install -g live-server
```

3. Configura `config.js` con tus credenciales de Supabase:
```javascript
window.SUPABASE_URL = "tu_url_de_supabase";
window.SUPABASE_ANON_KEY = "tu_anon_key";
```

4. Ejecuta el servidor local:
```bash
live-server
```

5. Abre http://127.0.0.1:8080

## 🗄️ Configuración de Base de Datos

Ejecuta el script `supabase_setup.sql` en tu SQL Editor de Supabase:

```sql
-- Crea las tablas: products, profiles
-- Configura Row Level Security (RLS)
-- Ver supabase_setup.sql para el script completo
```

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

- Row Level Security (RLS) habilitado en todas las tablas
- Autenticación con Supabase Auth
- Políticas de Storage para lectura pública y escritura autenticada
- CORS configurado solo para dominios autorizados

## 📞 WhatsApp Integration

Configurado para enviar mensajes a: **+57 314 618 9060**

Formato del mensaje:
```
Hola, estoy interesado en el producto [Nombre del Producto]
```

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
