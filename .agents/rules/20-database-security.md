# Regla de Base de Datos y Seguridad: El Huarique de Catacaos

## Referencia
Esta regla implementa los estándares de seguridad, transaccionalidad y RLS descritos en `docs/PROJECT_SPEC.md` (Secciones 11 y 12) y `docs/ADR/001-auth-staff-pin.md`.

## Estándares de Seguridad en Base de Datos
1. **Row Level Security (RLS) Obligatorio:**
   - Toda tabla creada en el esquema `public` debe ejecutar explícitamente `ALTER TABLE public.<tabla> ENABLE ROW LEVEL SECURITY;` y `FORCE ROW LEVEL SECURITY`.
   - La existencia de políticas no exime de la ejecución explícita de `ENABLE RLS`.
2. **Exposición Explícita a Data API (PostgREST):**
   - No asumir exposición automática.
   - Conceder `GRANT SELECT TO authenticated` exclusivamente a tablas y vistas que el frontend requiera consultar.
   - Mantener revocados `INSERT`, `UPDATE` y `DELETE` directos en tablas transaccionales (`orders`, `order_items`, `order_revisions`, `print_jobs`, `inventory_movements`).
3. **Hardening de Funciones Transaccionales (RPCs):**
   - Configurar `ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;`.
   - Todas las funciones de mutación deben crearse con:
     `SECURITY DEFINER SET search_path = ''`
   - Calificar el 100% de tablas y funciones con su esquema explícito (`public.orders`, `auth.uid()`, etc.).
   - Revocar `ALL` y conceder `EXECUTE` explícitamente solo a `authenticated`.
4. **Validación Interna Exhaustiva en RPCs:**
   Cada función comprueba en SQL:
   - `auth.uid()` no nulo.
   - `public.profiles.active = true` consultado directamente en la base de datos (Zero-Stale-Trust).
   - Coincidencia de `restaurant_id` del registro con el `restaurant_id` del usuario.
   - `staff_role` autorizado para la acción.
   - Máquina de estados válida.
   - Idempotencia mediante claves únicas.
5. **Claims Canónicos de JWT:**
   - Inyectados vía Custom Access Token Hook en:
     - `auth.jwt()->>'restaurant_id'`
     - `auth.jwt()->>'staff_role'`
   - Conservar intactos los claims estándar de Supabase (`role = 'authenticated'`, `sub`, etc.).
6. **Inventario Inmutable:**
   - La tabla `inventory_movements` es append-only (prohibido `UPDATE` y `DELETE`).
   - Las anulaciones `after_prep` se registran con par de reclasificación atómica (`cancellation_reversal` $+Q$ y `spoilage_waste` $-Q$) con efecto neto $0$ sobre el stock disponible y auditoría del consumo producido.
