# Guía de Despliegue en GitHub Pages - LogiCirc

**LogiCirc** está diseñado como una SPA (Single Page Application) moderna con Vite y React, donde el 100% de la lógica CAD, motor de simulación digital, validador de diseño DRC, osciloscopio, parseador DSL/HDL y exportación corren directamente en el navegador del cliente (Client-Side). Por tanto, **es 100% compatible con GitHub Pages**.

---

## 🚀 Método Recomendado: Despliegue Automático con GitHub Actions

El proyecto ya incluye el flujo de trabajo automatizado en `.github/workflows/deploy.yml`.

### Pasos en GitHub:
1. Sube tu código a un repositorio en GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: LogiCirc CAD & Simulator"
   git remote add origin https://github.com/<tu-usuario>/<tu-repositorio>.git
   git branch -M main
   git push -u origin main
   ```
2. Entra en tu repositorio en GitHub y ve a:
   **Settings** (Configuración) ➔ **Pages** (en el menú lateral izquierdo).
3. En la sección **Build and deployment**:
   - En **Source**, selecciona: **`GitHub Actions`** (en lugar de `Deploy from a branch`).
4. ¡Listo! En cada `git push` a la rama `main`:
   - Se ejecutarán las 11 pruebas unitarias (`npm test`).
   - Se compilará el bundle optimizado (`npm run build`).
   - Se publicará automáticamente en:
     `https://<tu-usuario>.github.io/<tu-repositorio>/`

---

## 🛠️ Configuración de Rutas Relativas (`base: './'`)

En `vite.config.ts`, ya se ha configurado:
```typescript
export default defineConfig(() => {
  return {
    base: './', // Asegura que los scripts y estilos carguen bien en subdirectorios de GitHub Pages
    ...
  };
});
```
Esto garantiza que los archivos generados en `dist/assets/` se referencien de manera relativa (`./assets/...`) y no causen errores 404 al alojarse en `https://<usuario>.github.io/<repositorio>/`.

---

## 🧪 Método Alternativo: Despliegue Manual con `gh-pages`

Si prefieres desplegar manualmente sin GitHub Actions:
1. Instala `gh-pages` como dependencia de desarrollo:
   ```bash
   npm install -D gh-pages
   ```
2. Añade este script a tu `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
3. Ejecuta:
   ```bash
   npm run deploy
   ```
4. En GitHub **Settings** ➔ **Pages**, selecciona la rama **`gh-pages`** y carpeta `/(root)`.

---

## 🤖 ¿Qué ocurre con el Asistente IA (Gemini) en GitHub Pages?

GitHub Pages solo sirve archivos estáticos (HTML/CSS/JS) y no ejecuta servidores Node.js (`server.ts`).

- **Todo el sistema CAD funciona 100% en GitHub Pages**:
  - Arrastrar y soltar de compuertas, flip-flops, memorias y aritmética.
  - Simulación síncrona/asíncrona y análisis en osciloscopio.
  - Validación de reglas de diseño (DRC) en tiempo real.
  - Editor bidireccional HDL / DSL y auto-organizador topológico.
  - Generación de chips personalizados e importación/exportación de archivos `.json`, `.hdl` e imágenes/PDF de alta resolución.
  - Diagramas de arquitectura UML interactivos.

- **Para el Asistente IA con Gemini**:
  - Si deseas usar la IA en producción fuera de AI Studio, puedes alojar el endpoint `/api/gemini/circuit-ai` en una función serverless gratuita (como Vercel Serverless Function, Cloudflare Workers, Netlify Function o Google Cloud Run), o bien configurar el SDK directamente con una clave de API.
