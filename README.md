# Las Flores Elevated - Web App

Bienvenido al repositorio de **Las Flores**, un restaurante enfocado en la comida andina y ayacuchana con una propuesta moderna (elevada).

## 🚀 Tecnologías Principales

- **Frontend:** React, TypeScript, TanStack Router
- **Estilos:** Tailwind CSS, Lucide React
- **Build Tool:** Vite, Bun/NPM

## 🛠 Instalación y Configuración Local

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd las-flores-web
   ```

2. **Instalar dependencias:**
   Puedes usar `npm` o `bun`:
   ```bash
   npm install
   # o
   bun install
   ```

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:5173](http://localhost:5173) para ver la aplicación.

## 📂 Estructura del Proyecto

- `/src`: Contiene todo el código fuente de la aplicación (componentes, rutas, contextos).
- `/public`: Archivos estáticos como imágenes y el favicon. Las imágenes reales de los platos están en `/public/imagenes-reales`.
- `/scripts`: Scripts de utilería (como optimización de imágenes).
- `/docs`: Archivos de referencia y documentación del negocio/diseño.

## 📜 Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo local.
- `npm run build`: Compila la aplicación para producción.
- `npm run preview`: Previsualiza la aplicación compilada localmente.

### Scripts de Optimización (Carpeta `/scripts`)
Si necesitas optimizar imágenes grandes antes de subirlas o usarlas:
- `node scripts/optimize-carta-images.cjs`: Optimiza (reduce resolución y peso) las imágenes dentro de `public/imagenes-reales/CARTA`.
- `node scripts/build-static.js`: (Utility script de build si aplica).

## ⚠️ Reglas de Contribución y Seguridad

1. **Datos Sensibles:** Nunca subas archivos `.env`, tokens de API, contraseñas de bases de datos o servicios en la nube al repositorio. Existe un `.gitignore` preconfigurado para evitarlos. Si necesitas crear variables de entorno, hazlo en un archivo local `.env` y documenta las variables requeridas en un `.env.example`.
2. **Archivos Grandes:** Evita subir archivos o imágenes de mucha resolución (>2MB). Utiliza los scripts de optimización proporcionados en la carpeta `scripts/` antes de realizar tus commits.
3. **Flujo de Trabajo:** Trabajen en ramas (`feature/nombre-de-rama`, `fix/problema`) y realicen Pull Requests (PR) hacia la rama `main` o `develop`.
