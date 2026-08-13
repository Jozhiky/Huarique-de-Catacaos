# Workflow: Verificación de Entrega y Calidad (release-check)

Este workflow valida que el proyecto cumple con la **Definición de Terminado (DoD)** antes de solicitar revisión o dar por concluida una fase.

## Checklist de Verificación

- [ ] **Typecheck:** `pnpm typecheck` termina con código de salida 0 y cero errores.
- [ ] **Linter:** `pnpm lint` pasa limpiamente sin advertencias ni errores.
- [ ] **Pruebas Automatizadas:** `pnpm test` ejecuta todos los tests con 100% de éxito.
- [ ] **Seguridad:** Ninguna clave `service_role` ni secreto de Supabase expuesto en variables `VITE_*` o código del frontend.
- [ ] **Integridad Visual:**
  - [ ] Tokens de color oficiales (`#0B3156`, `#C3A55F`, `#1677A6`, `#F6F0E4`, `#D9C79D`).
  - [ ] Logo oficial con transparencia alfa real intacta.
  - [ ] Targets táctiles $\ge 48 \times 48\text{ px}$.
  - [ ] Cero degradados ni plantillas genéricas.
  - [ ] Sin scroll global en resoluciones $1280 \times 800$ y $1024 \times 600$.
- [ ] **Datos Reales:** Todos los datos corresponden al contexto de Catacaos (platos típicos, moneda `S/`, mozos con nombres peruanos).
- [ ] **Control de Versiones:** `pnpm-lock.yaml` actualizado y limpio.
