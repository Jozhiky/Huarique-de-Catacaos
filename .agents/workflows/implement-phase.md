# Workflow: Implementación de Fase (implement-phase)

Este workflow define los pasos sistemáticos para implementar una fase en Antigravity para **El Huarique de Catacaos**:

## Pasos de Ejecución
1. **Lectura y Validación de Requisitos:**
   - Leer `docs/PROJECT_SPEC.md` y la sección correspondiente a la fase.
   - Revisar las reglas en `.agents/rules/` y ADRs relacionados.
   - Trabajar en **Planning Mode** si existen decisiones arquitectónicas o incertidumbres.
2. **Desarrollo por Capas:**
   - Dominio y Tipos (`packages/domain`).
   - Componentes Visuales y Tokens (`packages/ui`).
   - Lógica de Aplicación / Rutas (`apps/web` o `apps/print-bridge`).
   - Migraciones y Políticas de Base de Datos (`supabase/migrations/`).
3. **Control de Calidad Continuo:**
   - Ejecutar `pnpm typecheck` para asegurar cero errores de tipos.
   - Ejecutar `pnpm lint` para cumplir el estándar de estilo.
   - Ejecutar `pnpm test` para validar lógica unitaria y de integración.
4. **Verificación Visual:**
   - Levantar la app (`pnpm dev`) y abrir en navegador.
   - Probar en resolución $1280 \times 800$ y $1024 \times 600$.
   - Capturar evidencia visual.
5. **Cierre de Fase:**
   - Ejecutar el workflow `release-check.md`.
   - Detenerse y solicitar revisión formal con el checklist de criterios de aceptación cumplidos.
