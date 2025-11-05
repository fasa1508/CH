// admin.js - Panel de administración para el dueño

// Lista centralizada de categorías (usada también en app.js)
const DEFAULT_CATEGORIES = [
    'Accesorios de baño',
    'Almohadas y rellenos',
    'Catálogo navideño',
    'Cobijas',
    'Cojines',
    'Cortinas',
    'Manteleria',
    'Protectores',
    'Sabanas',
    'Tendidos estandar',
    'Tendidos premium',
    'Toallas'
];

class AdminPanel {
    constructor() {
        if (!window.supabaseClient) {
            console.error('❌ Cliente de API no encontrado');
            return;
        }

        this.supabase = window.supabaseClient;
        this.currentProduct = null;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Botón para abrir el panel
        const adminBtn = document.getElementById('admin-toggle');
        adminBtn?.addEventListener('click', () => {
            this.openPanel();
        });

        // Botón para cerrar el panel
        const closeBtn = document.getElementById('admin-close');
        closeBtn?.addEventListener('click', () => {
            this.closePanel();
        });

        // Formulario de producto
        const productForm = document.getElementById('product-form');
        productForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveProduct();
        });

        // Botón limpiar formulario
        const clearBtn = document.getElementById('clear-form');
        clearBtn?.addEventListener('click', () => {
            this.clearForm();
        });

        // Cargar categorías en el select
        this.loadCategoriesIntoSelect();
    }

    async loadCategoriesIntoSelect() {
        try {
            const { data, error } = await this.supabase
                .from('categories')
                .select('*')
                .order('name');

            const categorySelect = document.getElementById('p-category');
            if (!categorySelect) return;

            categorySelect.innerHTML = '';

            if (error || !data || data.length === 0) {
                // Usar categorías por defecto
                DEFAULT_CATEGORIES.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat;
                    option.textContent = cat;
                    categorySelect.appendChild(option);
                });
            } else {
                data.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.name;
                    option.textContent = cat.name;
                    categorySelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error al cargar categorías:', error);
        }
    }

    async openPanel() {
        const panel = document.getElementById('admin-panel');
        panel?.classList.remove('hidden');
        
        // Cargar productos existentes
        await this.loadProductsList();
    }

    closePanel() {
        const panel = document.getElementById('admin-panel');
        panel?.classList.add('hidden');
        this.clearForm();
    }

    async saveProduct() {
        try {
            const name = document.getElementById('p-name').value;
            const description = document.getElementById('p-desc').value;
            const price = parseFloat(document.getElementById('p-price').value);
            const category = document.getElementById('p-category').value;
            const imageFile = document.getElementById('p-image').files[0];

            if (!name || !price || !category) {
                alert('Por favor completa todos los campos requeridos');
                return;
            }

            let imageUrl = this.currentProduct?.image_url || null;

            // Si hay una nueva imagen, subirla
            if (imageFile) {
                imageUrl = await this.uploadImage(imageFile);
                if (!imageUrl) {
                    alert('Error al subir la imagen');
                    return;
                }
            }

            const productData = {
                name,
                description,
                price,
                category,
                image_url: imageUrl,
                updated_at: new Date().toISOString()
            };

            // Si estamos editando, actualizar; si no, crear
            if (this.currentProduct) {
                const { error } = await this.supabase
                    .from('products')
                    .update(productData)
                    .eq('id', this.currentProduct.id)
                    .select();

                if (error) throw error;
                alert('✅ Producto actualizado exitosamente');
            } else {
                const { error } = await this.supabase
                    .from('products')
                    .insert(productData)
                    .select();

                if (error) throw error;
                alert('✅ Producto creado exitosamente');
            }

            // Limpiar formulario y recargar lista
            this.clearForm();
            await this.loadProductsList();
            
            // Recargar catálogo principal
            if (window.catalogApp) {
                await window.catalogApp.loadProducts();
            }

        } catch (error) {
            console.error('Error al guardar producto:', error);
            alert('❌ Error al guardar el producto: ' + error.message);
        }
    }

    async uploadImage(file) {
        try {
            console.log('Subiendo imagen...');

            const { data, error } = await this.supabase.storage
                .from('images')
                .upload('', file);

            if (error) {
                console.error('Error al subir imagen:', error);
                throw error;
            }
            // Obtener URL pública a partir de la ruta devuelta por la API
            const { data: urlData } = this.supabase.storage
                .from('images')
                .getPublicUrl(data.path);

            console.log('✅ Imagen subida:', urlData.publicUrl);
            return urlData.publicUrl;

        } catch (error) {
            console.error('Error en uploadImage:', error);
            return null;
        }
    }

    async loadProductsList() {
        try {
            const { data, error } = await this.supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const productList = document.getElementById('product-list');
            if (!productList) return;

            if (!data || data.length === 0) {
                productList.innerHTML = '<p style="color: #999;">No hay productos todavía</p>';
                return;
            }

            productList.innerHTML = '';

            data.forEach(product => {
                const item = document.createElement('div');
                item.className = 'product-item';
                let value = parseFloat(product.price);
                if (isFinite(value) && value < 1000) {
                    value = value * 1000;
                }
                const formattedPrice = new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(value);
                
                item.innerHTML = `
                    <div class="admin-product-item">
                        <img src="${product.image_url || 'assets/placeholder.jpg'}" 
                             alt="${product.name}" 
                             style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; flex-shrink: 0;">
                        <div class="admin-product-info">
                            <strong style="font-size: 15px; color: #1e293b; display: block; margin-bottom: 4px;">${product.name}</strong>
                            <p style="color: var(--blue); font-size: 14px; font-weight: 600; margin: 4px 0;">${formattedPrice}</p>
                            <small style="color: var(--muted); font-size: 12px;">${product.category}</small>
                        </div>
                        <div class="admin-product-actions">
                            <button onclick="window.adminPanel.editProduct('${product.id}')" 
                                    class="btn edit">
                                Editar
                            </button>
                            <button onclick="window.adminPanel.deleteProduct('${product.id}')" 
                                    class="btn delete">
                                Eliminar
                            </button>
                        </div>
                    </div>
                `;
                productList.appendChild(item);
            });

        } catch (error) {
            console.error('Error al cargar lista de productos:', error);
        }
    }

    async editProduct(productId) {
        try {
            const { data, error } = await this.supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw error;

            this.currentProduct = data;

            // Llenar formulario
            document.getElementById('p-name').value = data.name || '';
            document.getElementById('p-desc').value = data.description || '';
            document.getElementById('p-price').value = data.price || '';
            document.getElementById('p-category').value = data.category || '';

            // Scroll al formulario
            document.getElementById('product-form').scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Error al cargar producto para editar:', error);
            alert('Error al cargar el producto');
        }
    }

    async deleteProduct(productId) {
        if (!confirm('¿Estás seguro de eliminar este producto?')) {
            return;
        }

        try {
            const { error } = await this.supabase
                .from('products')
                .delete()
                .eq('id', productId);

            if (error) throw error;

            alert('✅ Producto eliminado exitosamente');
            
            // Recargar lista
            await this.loadProductsList();
            
            // Recargar catálogo principal
            if (window.catalogApp) {
                await window.catalogApp.loadProducts();
            }

        } catch (error) {
            console.error('Error al eliminar producto:', error);
            alert('❌ Error al eliminar el producto: ' + error.message);
        }
    }

    clearForm() {
        this.currentProduct = null;
        document.getElementById('p-name').value = '';
        document.getElementById('p-desc').value = '';
        document.getElementById('p-price').value = '';
        document.getElementById('p-image').value = '';
        // No limpiar la categoría para mantenerla seleccionada
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.adminPanel = new AdminPanel();
    }, 300);
});
