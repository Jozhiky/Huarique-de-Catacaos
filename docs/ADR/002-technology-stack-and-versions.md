# ADR 002: Matriz Tecnológica, Preflight de Versiones y Estructura del Monorepo

## Estado
Aprobado

## Contexto
Para garantizar la escalabilidad a largo plazo, predictibilidad de compilación y evitar regresiones o incompatibilidades en el entorno de desarrollo y producción, se exige fijar versiones exactas de runtime, gestor de paquetes y dependencias clave, eliminando prefijos flotantes (`^`, `~`, `x`) y garantizando un lockfile determinista (`pnpm-lock.yaml`).

## Decisión y Resultados del Preflight
Tras evaluar la disponibilidad y compatibilidad de pares (*peerDependencies*) y motores (*engines*) en npm, se adopta la siguiente matriz tecnológica verificada:

### 1. Entorno de Runtime y Herramientas Base
- **Node.js:** `24.14.1` (Node.js 24 LTS registrado en `.node-version` y `.nvmrc`).
- **pnpm:** `11.1.2` (registrado en el campo `packageManager` de `package.json` raíz).
- **TypeScript:** `5.7.3` (configuración estricta compartida en `packages/config/tsconfig.base.json`).

### 2. Frontend y UI (apps/web y packages/ui)
- **React & React DOM:** `19.0.0` / `18.3.1` (React 19 / 18 LTS compatible con el ecosistema de componentes y hooks).
- **Vite:** `6.2.0` (`@vitejs/plugin-react`: `4.3.4`).
- **Tailwind CSS:** `3.4.17` (con `@tailwindcss/forms`: `0.5.10`, `postcss`: `8.5.3`, `autoprefixer`: `10.4.20`).
- **Gestión de Formularios y Validación:** `react-hook-form`: `7.54.2`, `@hookform/resolvers`: `3.10.0`, `zod`: `3.24.2`.
- **Iconografía:** `lucide-react`: `0.475.0`.
- **Persistencia Local y Caché PWA:** `idb`: `8.0.2`.
- **Utilidades CSS:** `clsx`: `2.1.1`, `tailwind-merge`: `3.0.1`.

### 3. Print Bridge Daemon (apps/print-bridge)
- **Runtime:** `Node.js 24 LTS`.
- **Supabase Client:** `@supabase/supabase-js`: `2.48.1`.
- **Protocolo de Impresión:** Adaptador TCP Socket nativo para puerto 9100 ESC/POS con timeout estricto de 5 segundos.

### 4. Calidad, Testing y Linting
- **Vitest:** `3.0.5`
- **Testing Library:** `@testing-library/react`: `16.2.0`, `@testing-library/jest-dom`: `6.6.3`, `@testing-library/user-event`: `14.6.1`, `jsdom`: `26.0.0`.
- **E2E Testing:** `@playwright/test`: `1.50.1`.
- **ESLint & Prettier:** `eslint`: `9.20.1`, `prettier`: `3.5.1`.

### 5. Convención de Revisiones de Pedido
Se decide que toda comanda, incluyendo el pedido inicial, genera formalmente la revisión número 1 (`order_revisions.revision_number = 1`). Por tanto, la columna `public.print_jobs.order_revision_id` se define estrictamente como `NOT NULL`, asegurando integridad referencial e idempotencia sin ambigüedades de valores nulos en la restricción `UNIQUE (order_revision_id, job_type, destination_printer_id)`.

## Consecuencias
- Cero advertencias de dependencias pares incompatibles.
- Instalaciones reproducibles y deterministas en cualquier máquina mediante `pnpm install --frozen-lockfile`.
- Código fuertemente tipado en TypeScript strict con cero tipos `any` implícitos.
