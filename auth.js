// auth.js - Manejo de autenticación para Credihogar

class AuthManager {
    constructor() {
        // Esperar a que el cliente de Supabase esté disponible
        if (!window.supabaseClient) {
            console.error('Error: Cliente Supabase no encontrado');
            return;
        }

        // Usar el cliente inicializado
        this.supabase = window.supabaseClient;

        // Elementos UI
        this.ui = {
            loginBtn: document.getElementById('login-btn'),
            logoutBtn: document.getElementById('logout-btn'),
            adminBtn: document.getElementById('admin-toggle'),
            authModal: document.getElementById('auth-modal'),
            authForm: document.getElementById('auth-form'),
            authError: document.getElementById('auth-error'),
            modalClose: document.getElementById('auth-modal-close')
        };

        // Modo cliente (oculta botones de autenticación completamente)
        const params = new URLSearchParams(window.location.search);
        this.clientMode = params.has('cliente') || params.get('view') === 'public';
        if (this.clientMode) {
            document.querySelector('.topbar-actions')?.classList.add('hidden');
            // No inicializar listeners de auth en modo cliente
            return;
        }

        this.setupEventListeners();
        this.checkInitialSession();
    }

    setupEventListeners() {
        // Login button
        this.ui.loginBtn?.addEventListener('click', () => {
            this.ui.authModal?.classList.remove('hidden');
            this.hideError();
        });

        // Close modal
        this.ui.modalClose?.addEventListener('click', () => {
            this.closeModal();
        });

        // Login form
        this.ui.authForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });

        // Logout button
        this.ui.logoutBtn?.addEventListener('click', async () => {
            await this.handleLogout();
        });
    }

    closeModal() {
        this.ui.authModal?.classList.add('hidden');
        this.hideError();
        this.hideRegisterOption();
    }

    showError(message) {
        if (this.ui.authError) {
            this.ui.authError.textContent = message;
            this.ui.authError.classList.remove('hidden');
        }
    }

    hideError() {
        this.ui.authError?.classList.add('hidden');
    }

    async handleLogin() {
        try {
            const email = document.getElementById('email')?.value;
            const password = document.getElementById('password')?.value;

            if (!email || !password) {
                this.showError('Por favor completa todos los campos');
                return;
            }

            this.hideError();
            console.log('Intentando iniciar sesión con:', email);
            
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                console.error('Error de Supabase:', error);
                
                if (error.message === 'Invalid login credentials') {
                    this.showError('Usuario no encontrado. ¿Deseas crear una cuenta con estos datos?');
                    this.showRegisterOption();
                    return;
                }
                
                this.showError(`Error: ${error.message}`);
                return;
            }

            if (!data?.user) {
                console.error('No se recibieron datos de usuario');
                this.showError('Error al obtener datos del usuario');
                return;
            }

            console.log('✅ Login exitoso:', data.user.email);
            this.closeModal();
            this.ui.authForm?.reset();
            await this.updateUIState(data.user);
            
        } catch (error) {
            console.error('Error inesperado durante el login:', error);
            this.showError('Error inesperado. Por favor intenta de nuevo.');
        }
    }

    showRegisterOption() {
        // Crear botón de registro si no existe
        if (!document.getElementById('register-option')) {
            const registerBtn = document.createElement('button');
            registerBtn.id = 'register-option';
            registerBtn.type = 'button';
            registerBtn.className = 'btn-secondary';
            registerBtn.textContent = 'Crear Cuenta';
            registerBtn.style.marginTop = '10px';
            registerBtn.style.width = '100%';
            registerBtn.onclick = () => this.handleRegister();
            
            const formParent = this.ui.authForm?.parentElement;
            formParent?.appendChild(registerBtn);
        }
    }

    hideRegisterOption() {
        const registerBtn = document.getElementById('register-option');
        if (registerBtn) {
            registerBtn.remove();
        }
    }

    async handleRegister() {
        try {
            const email = document.getElementById('email')?.value;
            const password = document.getElementById('password')?.value;

            if (!email || !password) {
                this.showError('Por favor completa todos los campos');
                return;
            }

            this.hideError();
            console.log('Creando cuenta para:', email);

            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin
                }
            });

            if (error) {
                console.error('Error al registrar:', error);
                this.showError(`Error al crear cuenta: ${error.message}`);
                return;
            }

            console.log('Registro exitoso:', data);
            
            // Si requiere confirmación de email
            if (data.user && !data.session) {
                this.showError('Cuenta creada. Revisa tu email para confirmar tu cuenta.');
            } else if (data.session) {
                // Login automático exitoso
                this.ui.authModal?.classList.add('hidden');
                this.ui.authForm?.reset();
                this.hideRegisterOption();
                await this.updateUIState(data.user);
            }

        } catch (error) {
            console.error('Error inesperado durante el registro:', error);
            this.showError('Error inesperado al crear cuenta.');
        }
    }

    async handleLogout() {
        try {
            await this.supabase.auth.signOut();
            await this.updateUIState(null);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    }

    async updateUIState(user) {
        if (user) {
            this.ui.loginBtn?.classList.add('hidden');
            this.ui.logoutBtn?.classList.remove('hidden');

            try {
                const { data: profile } = await this.supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single();

                if (profile?.is_admin) {
                    this.ui.adminBtn?.classList.remove('hidden');
                }
            } catch (error) {
                console.error('Error al verificar rol de admin:', error);
            }
        } else {
            this.ui.loginBtn?.classList.remove('hidden');
            this.ui.logoutBtn?.classList.add('hidden');
            this.ui.adminBtn?.classList.add('hidden');
        }
    }

    showError(message) {
        if (this.ui.authError) {
            this.ui.authError.textContent = message;
            this.ui.authError.classList.remove('hidden');
        }
    }

    hideError() {
        this.ui.authError?.classList.add('hidden');
    }

    checkInitialSession() {
        // No hacer onAuthStateChange inmediatamente para evitar peticiones extra
        // Solo verificar sesión cuando sea necesario
        this.supabase.auth.getSession().then(({ data: { session }}) => {
            if (session?.user) {
                this.updateUIState(session.user);
            }
        }).catch(err => {
            console.error('Error al obtener sesión inicial:', err);
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.authManager = new AuthManager();
    }, 100); // Pequeño delay para asegurar que todo esté cargado
});