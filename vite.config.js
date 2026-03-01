import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    // Base pública, dependiendo de dónde se aloje (ej. GitHub Pages: '/Boda/')
    base: './',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                portal: resolve(__dirname, 'portal.html'),
                generator: resolve(__dirname, 'generator.html'),
                login: resolve(__dirname, 'login.html')
            }
        }
    },
    server: {
        port: 3000,
        open: true,
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin-allow-popups"
        }
    }
});
