# El Huarique de Catacaos — Sistema Operativo POS, Comandas e Inventario

Sistema de punto de venta (POS), comandas en tiempo real para cocina, gestión de salones/mesas, control de caja e inventario con escandallo (recetas) desarrollado específicamente para **El Huarique de Catacaos** (Catacaos, Piura, Perú).

## Especificación y Arquitectura
- **Especificación maestra:** [`docs/PROJECT_SPEC.md`](docs/PROJECT_SPEC.md) (Versión 1.2)
- **ADR-001:** [`docs/ADR/001-auth-staff-pin.md`](docs/ADR/001-auth-staff-pin.md) (Autenticación Supabase y PIN de personal)
- **ADR-002:** [`docs/ADR/002-technology-stack-and-versions.md`](docs/ADR/002-technology-stack-and-versions.md) (Matriz tecnológica y versiones exactas)

## Estructura del Monorepo
```text
el-huarique-pos/
├── apps/
│   ├── web/                     # Aplicación PWA React + Vite + Tailwind para tablets Android
│   └── print-bridge/            # Daemon Node.js para impresión térmica TCP ESC/POS
├── packages/
│   ├── domain/                  # Entidades, tipos, validación Zod y lógica pura de negocio
│   ├── ui/                      # Design System y componentes táctiles (tokens oficiales)
│   └── config/                  # Configuraciones compartidas (TSConfig, Tailwind, ESLint)
├── docs/                        # Documentación viva y registros de decisiones arquitectónicas
├── .agents/                     # Reglas y workflows para desarrollo en Antigravity
└── supabase/                    # Migraciones SQL, funciones RPC, RLS y semillas (Fase 2+)
```

## Requisitos de Entorno
- **Node.js:** `v24.14.1` (o compatible `Node.js 24 LTS`)
- **pnpm:** `11.1.2`

## Comandos Principales

### 1. Instalación de dependencias
```bash
pnpm install
```

### 2. Desarrollo local
```bash
pnpm dev
```
Inicia la aplicación web en `http://localhost:5173`.

### 3. Verificación de Tipos (TypeScript Strict)
```bash
pnpm typecheck
```

### 4. Linter de Código
```bash
pnpm lint
```

### 5. Pruebas Automatizadas (Vitest)
```bash
pnpm test
```

### 6. Formato de Código
```bash
pnpm format
```

## Identidad Visual y Tokens
- **`brand.navy`:** `#0B3156` (Encabezados y navegación)
- **`brand.gold`:** `#C3A55F` (Acentos de marca y selección)
- **`brand.coastal`:** `#1677A6` (Acciones secundarias)
- **`brand.cream`:** `#F6F0E4` (Fondo cálido)
- **`brand.sand`:** `#D9C79D` (Superficies secundarias)
- **Tipografías:** `Barlow Condensed` (títulos y categorías) e `Inter` (interfaz y cifras numéricas).
