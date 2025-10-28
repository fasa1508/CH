# GUÍA DE DEPLOYMENT PASO A PASO - CREDIHOGAR

## 🔧 Paso 1: Configurar CORS en Supabase (ANTES de hacer deploy)

### Accede a tu panel de Supabase:
1. Ve a: https://supabase.com/dashboard/project/psylshyplwtekvmyjjbv/settings/api
2. Inicia sesión si es necesario

### Configura las URLs permitidas:
3. Busca la sección **"Configuration"** o **"API Settings"**
4. Encuentra el campo **"Additional Allowed URLs"** o **"CORS Allowed Origins"**
5. Agrega las siguientes URLs (mantén las existentes):

```
http://127.0.0.1:8080
http://127.0.0.1:5500
https://*.netlify.app
```

6. Haz clic en **Save** o **Update**

---

## ✅ Paso 2: Probar Localmente (ANTES de deploy)

### Iniciar servidor local:
```powershell
cd "C:\Users\FernanandresSanchezA\OneDrive - FLYR Inc\Escritorio\CH"
live-server --port=8080
```

### Checklist de pruebas:

- [ ] **1. Autenticación**
  - Abre http://127.0.0.1:8080 (o el puerto que live-server asigne)
  - Click en "Iniciar Sesión"
  - Login: `credi@credihogar.com`
  - Verifica que NO hay errores en la consola (F12)

- [ ] **2. Panel Admin**
  - Verifica que aparece el botón "Panel Admin"
  - Haz click y verifica que se abre el panel lateral
  - Verifica que se cargan los productos existentes

- [ ] **3. Subir Imagen**
  - En Panel Admin, agrega un producto nuevo
  - Nombre: "Producto de Prueba"
  - Precio: 50000
  - Categoría: Cualquiera
  - Sube una imagen (JPG/PNG)
  - Click en "Guardar"
  - **VERIFICA EN CONSOLA**: debe decir "✅ Producto guardado con éxito"

- [ ] **4. Verificar Imagen Uniforme**
  - El producto aparece en el catálogo
  - La imagen tiene **aspect ratio 1:1** (cuadrada)
  - No se ve distorsionada
  - Al hacer hover, la imagen hace zoom suave

- [ ] **5. Catálogo**
  - Los productos se muestran en grid (2 columnas en móvil)
  - El filtro por categoría funciona
  - La búsqueda funciona
  - Click en un producto abre el modal con imagen en 4:3

- [ ] **6. WhatsApp**
  - Click en "Comprar por WhatsApp"
  - Se abre WhatsApp Web con mensaje prellenado
  - El número es: +57 314 618 9060

---

## 🚀 Paso 3: Deploy en Netlify

### Opción A: Deploy Manual (Más Rápido)

1. Ve a: https://app.netlify.com/drop
2. Arrastra **TODA LA CARPETA** `CH` al navegador
3. Netlify hará el deploy automáticamente
4. Copia la URL que te da (ejemplo: `https://tu-sitio-123.netlify.app`)

### Opción B: Deploy desde Git (Recomendado para producción)

1. **Crear repositorio en GitHub**:
   ```powershell
   cd "C:\Users\FernanandresSanchezA\OneDrive - FLYR Inc\Escritorio\CH"
   git init
   git add .
   git commit -m "Initial commit - Credihogar v2.0"
   git branch -M main
   git remote add origin https://github.com/fasa1508/CH.git
   git push -u origin main
   ```

2. **Conectar con Netlify**:
   - Ve a: https://app.netlify.com
   - Click en "Import from Git"
   - Selecciona GitHub y autoriza
   - Selecciona el repositorio `CH`
   - Netlify detectará el `netlify.toml` automáticamente
   - Click en "Deploy site"

3. **Espera 1-2 minutos** mientras Netlify hace el build

---

## 🔄 Paso 4: Actualizar CORS con URL de Netlify

Después del deploy, Netlify te dará una URL como:
```
https://credihogar-abc123.netlify.app
```

1. **Copia esa URL exacta**
2. Ve a Supabase → Settings → API
3. Agrega la URL a "Additional Allowed URLs"
4. Guarda los cambios

---

## ✅ Paso 5: Probar en Producción

Abre tu URL de Netlify y repite las pruebas:

- [ ] Login funciona sin errores CORS
- [ ] Panel Admin se abre
- [ ] Puedes agregar productos con imágenes
- [ ] Las imágenes se suben a Supabase Storage
- [ ] El catálogo se ve correctamente
- [ ] WhatsApp funciona

---

## 🐛 Troubleshooting

### Error: "CORS policy blocked"
- ✅ **Solución**: Agrega tu URL de Netlify a Supabase CORS

### Error: "Error al subir imagen"
- ✅ **Solución**: Verifica que el bucket 'images' existe y tiene políticas públicas

### Error: "Products table not found"
- ✅ **Solución**: Ejecuta `supabase_setup.sql` en SQL Editor de Supabase

### Error: "Invalid login credentials"
- ✅ **Solución**: Ve a Supabase Auth → Users y verifica que existe tu usuario

---

## 📞 Soporte

Si encuentras problemas, verifica:
1. La consola del navegador (F12)
2. La pestaña "Network" en DevTools
3. Los logs de Supabase (Dashboard → Logs)

---

**¡Listo para producción! 🚀**
