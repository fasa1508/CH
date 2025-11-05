// config.js - Configuración para API PHP/MySQL
// Cambia API_BASE_URL según tu entorno

// URL de la API (cambiar en producción)
window.API_BASE_URL = 'http://localhost/CH/api'; // Desarrollo local
// window.API_BASE_URL = 'https://tudominio.com/api'; // Producción

// Configuración de la aplicación
window.APP_CONFIG = {
    // WhatsApp
    whatsappPhone: '573177884743',
    
    // Moneda
    currency: 'COP',
    currencySymbol: '$',
    
    // Nombre de la aplicación
    appName: 'Credihogar',
    
    // Imágenes
    maxImageSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

// Cliente API - Reemplazo de Supabase
class APIClient {
    constructor() {
        this.baseURL = window.API_BASE_URL;
        this.token = null;
        this.user = null;
        
        // Recuperar sesión del localStorage
        this.loadSession();
    }
    
    // Guardar sesión en localStorage
    saveSession(user, token) {
        this.user = user;
        this.token = token;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
    }
    
    // Cargar sesión desde localStorage
    loadSession() {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (userStr && token) {
            this.user = JSON.parse(userStr);
            this.token = token;
        }
    }
    
    // Limpiar sesión
    clearSession() {
        this.user = null;
        this.token = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }
    
    // Hacer request a la API
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}/${endpoint}`;
        
        const config = {
            ...options,
            credentials: 'include', // Incluir cookies de sesión
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Error en la petición');
            }
            
            return { data, error: null };
        } catch (error) {
            console.error('API Error:', error);
            return { data: null, error };
        }
    }
    
    // AUTH: Login
    async signInWithPassword({ email, password }) {
        const result = await this.request('auth.php?action=login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        
        if (result.data && result.data.user) {
            this.saveSession(result.data.user, result.data.session.token);
        }
        
        return result;
    }
    
    // AUTH: Registro
    async signUp({ email, password }) {
        const result = await this.request('auth.php?action=register', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        
        if (result.data && result.data.user) {
            this.saveSession(result.data.user, result.data.session.token);
        }
        
        return result;
    }
    
    // AUTH: Logout
    async signOut() {
        await this.request('auth.php?action=logout', {
            method: 'POST',
        });
        
        this.clearSession();
        return { error: null };
    }
    
    // AUTH: Obtener sesión actual
    async getSession() {
        if (!this.user || !this.token) {
            return { data: { session: null, user: null }, error: null };
        }
        
        const result = await this.request('auth.php?action=session');
        
        if (result.error) {
            this.clearSession();
            return { data: { session: null, user: null }, error: result.error };
        }
        
        return {
            data: {
                session: { user: result.data.user },
                user: result.data.user
            },
            error: null
        };
    }
    
    // DATABASE: Obtener datos de una tabla
    async from(table) {
        return {
            select: (columns = '*') => ({
                eq: (column, value) => ({
                    single: async () => {
                        const result = await this.request(`${table}.php?${column}=${value}`);
                        return { data: result.data ? result.data[0] : null, error: result.error };
                    }
                }),
                order: (column, options = {}) => this.fetchTable(table, { orderBy: column, ascending: options.ascending }),
                then: (resolve) => this.fetchTable(table).then(resolve)
            }),
            insert: (values) => ({
                select: async () => {
                    const result = await this.request(`${table}.php`, {
                        method: 'POST',
                        body: JSON.stringify(values),
                    });
                    return result;
                }
            }),
            update: (values) => ({
                eq: (column, value) => ({
                    select: async () => {
                        const result = await this.request(`${table}.php?id=${value}`, {
                            method: 'PUT',
                            body: JSON.stringify(values),
                        });
                        return result;
                    }
                })
            }),
            delete: () => ({
                eq: (column, value) => this.request(`${table}.php?id=${value}`, {
                    method: 'DELETE',
                })
            })
        };
    }
    
    // Obtener datos de una tabla
    async fetchTable(table, options = {}) {
        let endpoint = `${table}.php`;
        
        if (options.orderBy) {
            // Los filtros se manejan en el backend
        }
        
        return await this.request(endpoint);
    }
    
    // STORAGE: Upload de archivo
    async uploadFile(bucket, file) {
        const formData = new FormData();
        formData.append('image', file);
        
        const url = `${this.baseURL}/upload.php`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Error al subir archivo');
            }
            
            return { data: { path: data.url }, error: null };
        } catch (error) {
            console.error('Upload Error:', error);
            return { data: null, error };
        }
    }
    
    // Obtener URL pública de un archivo
    getPublicUrl(bucket, path) {
        return {
            data: {
                publicUrl: path.startsWith('http') ? path : `${window.API_BASE_URL.replace('/api', '')}/${path}`
            }
        };
    }
}

// Crear instancia global del cliente API
window.apiClient = new APIClient();

// Objeto auth compatible con Supabase
window.apiClient.auth = {
    signInWithPassword: (credentials) => window.apiClient.signInWithPassword(credentials),
    signUp: (credentials) => window.apiClient.signUp(credentials),
    signOut: () => window.apiClient.signOut(),
    getSession: () => window.apiClient.getSession(),
};

// Objeto storage compatible con Supabase
window.apiClient.storage = {
    from: (bucket) => ({
        upload: (path, file) => window.apiClient.uploadFile(bucket, file),
        getPublicUrl: (path) => window.apiClient.getPublicUrl(bucket, path),
    })
};

// Alias para compatibilidad
window.supabaseClient = window.apiClient;

console.log('✅ API Client inicializado:', window.API_BASE_URL);
