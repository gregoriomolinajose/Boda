# Proyecto Boda (Bellfy)

Plataforma integral para la gestión y visualización de invitaciones digitales para bodas. Este proyecto está diseñado con los principios de diseño de **Material 3 (M3) Expressive**, priorizando la fluidez, la estética moderna y una experiencia de usuario excepcional tanto en dispositivos móviles como de escritorio.

## Características Principales

1. **Portal del Anfitrión (`portal.html`)**
   - Panel de control general donde los anfitriones pueden gestionar sus eventos.
   - Creación, archivado y eliminación de eventos.
   - Autenticación segura mediante Firebase.

2. **Generador de Invitaciones (`generator.html`)**
   - Interfaz de administración de invitados para un evento específico.
   - **Métricas en tiempo real**: Tarjetas de estadísticas (Material 3) que muestran el ratio de confirmaciones vs total de invitados.
   - **Gestión de Lista**: Tabla moderna con opciones para agregar, editar, activar/desactivar y eliminar invitados.
   - **Generación de Enlaces Únicos**: Creación automática de URLs parametrizadas con límites autorizados de invitados (adultos y niños).

3. **Invitación Final (`index.html`)**
   - Interfaz visual impresionante para el invitado.
   - Soporte para confirmación de asistencia (RSVP).
   - **Seguridad en RSVP**: Validación estricta en tiempo real y pre-envío que impide a los invitados registrar a más personas de las estrictamente autorizadas en su pase.
   - Integración con Firebase Firestore para guardar las confirmaciones automáticamente.

## Stack Tecnológico

- **Frontend**: HTML5, Vanilla JavaScript, CSS3 (Custom Properties para Theming).
- **Diseño**: Material 3 (M3) Expressive Design System.
- **Backend/BaaS**: Firebase (Authentication, Firestore Database).
- **Bundler & Build Tool**: Vite.js.
- **Despliegue**: GitHub Pages (Dominio Personalizado: `bellfy.app`).

## Scripts Disponibles

El proyecto utiliza npm y Vite. En el directorio raíz, puedes ejecutar:

- `npm run dev`: Inicia el servidor de desarrollo local en `localhost:3000`.
- `npm run build`: Compila la aplicación para producción en la carpeta `dist`.
- `npm run preview`: Previsualiza localmente el build de producción.
- `npm run deploy`: Ejecuta el build y despliega la carpeta `dist` a la rama `gh-pages` para su publicación.

## Despliegue en Producción

El proyecto está configurado para desplegarse automáticamente en GitHub Pages utilizando la librería `gh-pages`. El despliegue incluye un archivo `CNAME` que apunta a **`bellfy.app`**.

Para lanzar una nueva versión a producción:
```bash
npm run deploy
```

## Arquitectura de Estado

La aplicación utiliza un manejador de estado centralizado (`Store.js`) basado en el patrón Observer, que se sincroniza bidireccionalmente con Firebase Firestore. Esto permite que los cambios realizados en el portal de administración se reflejen en tiempo real o tras recargar la aplicación cliente de los invitados, manteniendo siempre una única fuente de la verdad.
