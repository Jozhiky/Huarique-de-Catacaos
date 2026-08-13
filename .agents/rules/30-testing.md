# Regla de Calidad y Estrategia de Pruebas: El Huarique de Catacaos

## Referencia

Esta regla define los estándares de calidad de software y verificación estricta descritos en `docs/PROJECT_SPEC.md` (Secciones 20 y 21).

## Principios de Calidad No Negociables

1. **Tolerancia Cero a Errores:**
   - Prohibido avanzar de fase con errores de TypeScript (`tsc --noEmit`), advertencias de linter (`eslint`), pruebas fallidas (`vitest`) o excepciones en la consola del navegador.
2. **Pirámide de Pruebas Obligatoria:**
   - **Pruebas Unitarias (Vitest):** Formateo de moneda peruana (`S/`), validación de esquemas Zod de pedidos y compras, cálculo de recetas y balances de inventario con precisión decimal (`numeric`).
   - **Pruebas de Integración y Seguridad (pgTAP):**
     - Verificación de que toda tabla en `public` posee RLS habilitado.
     - Pruebas de aislamiento multi-tenant con dos `restaurant_id` distintos para prevenir vulnerabilidades IDOR/BOLA.
     - Verificación de que usuarios inactivos o roles no autorizados son bloqueados en las RPCs.
     - Validación de leasing en cola de impresión (`ack_print_job` rechaza leases vencidos).
   - **Pruebas End-to-End (Playwright):**
     - Flujos completos en viewports táctiles ($1280 \times 800$ y $1024 \times 600$).
     - Flujo Mozo: PIN $\to$ Mesa $\to$ Pedido $\to$ Comanda.
     - Flujo Adicionales: Comanda parcial solo con nuevos platos.
     - Flujo Caja: Solicitud de cuenta $\to$ Cobro mixto $\to$ Vuelto $\to$ Cierre.
     - Flujo Inventario: Compra $\to$ Venta $\to$ Merma $\to$ Ajuste de cierre.
3. **Verificación Visual:**
   - Toda pantalla debe verificarse en el navegador con DevTools en resoluciones horizontales de tablet.
   - Comprobación de que no existe scroll global no deseado y que todos los controles táctiles cumplen con el área mínima de $48 \times 48\text{ px}$.
