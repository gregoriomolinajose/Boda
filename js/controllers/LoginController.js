import { Auth } from '../core/Auth.js';

export class LoginController {
    constructor() {
        this.loadingOverlay = document.getElementById('loading');
        this.init();
    }

    init() {
        // Exponer función de login al scope global para el botón
        window.handleGoogleLogin = this.handleGoogleLogin.bind(this);

        // Iniciar observador de sesión de Firebase
        this.observeSession();
    }

    observeSession() {
        // Redirigir si ya tiene sesión activa
        Auth.waitForAuthInit().then(() => {
            Auth.onSessionChange((user) => {
                if (user) {
                    window.location.href = 'portal.html';
                }
            });
        });
    }

    showLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'flex';
        }
    }

    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
    }

    async handleGoogleLogin() {
        this.showLoading();

        try {
            await Auth.loginWithGoogle();
            // El onAuthStateChange atrapará el login exitoso y nos redirigirá a portal
        } catch (err) {
            this.hideLoading();
            if (err.code !== 'auth/popup-closed-by-user') {
                alert("Error en el Popup de Google. Si usas Safari considera deshabilitar el bloqueo de ventanas emergentes.");
            }
        }
    }
}

// Inicializar controlador al cargar
document.addEventListener('DOMContentLoaded', () => {
    new LoginController();
});
