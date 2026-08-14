-- ==============================================================================
-- Suite de Pruebas de Seguridad y Dominio con pgTAP
-- Proyecto: El Huarique de Catacaos — Sistema POS
-- ==============================================================================

BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap SCHEMA extensions;
SET search_path = public, extensions;

-- Asegurar permisos y search_path para roles durante la sesión de prueba
GRANT USAGE ON SCHEMA public, extensions TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public, extensions TO anon, authenticated;

SELECT no_plan();

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONES Y ESQUEMAS
-- ------------------------------------------------------------------------------
SELECT has_extension('uuid-ossp', 'Extensión uuid-ossp debe estar instalada');
SELECT has_extension('pgcrypto', 'Extensión pgcrypto debe estar instalada');
SELECT has_schema('app_private', 'Esquema app_private debe existir');
SELECT schema_owner_is('app_private', 'postgres', 'Esquema app_private debe pertenecer a postgres');

-- ------------------------------------------------------------------------------
-- 2. COBERTURA TOTAL DE RLS (Cero tablas públicas sin RLS)
-- ------------------------------------------------------------------------------
SELECT is_empty(
    $$
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND rowsecurity = false;
    $$,
    'Todas las tablas del esquema public deben tener RLS explícitamente habilitado'
);

-- ------------------------------------------------------------------------------
-- 3. RECHAZO TOTAL AL ROL ANÓNIMO (Revocación universal de permisos)
-- SQLSTATE 42501 = insufficient_privilege / permission denied
-- ------------------------------------------------------------------------------
SET LOCAL ROLE anon;
SET LOCAL search_path = public, extensions;
SET LOCAL "request.jwt.claims" = '{"role": "anon"}';

SELECT throws_ok(
    $$ SELECT * FROM public.restaurants $$,
    '42501',
    'Rol anon no tiene permiso SELECT en restaurants'
);
SELECT throws_ok(
    $$ SELECT * FROM public.profiles $$,
    '42501',
    'Rol anon no tiene permiso SELECT en profiles'
);
SELECT throws_ok(
    $$ SELECT * FROM public.menu_categories $$,
    '42501',
    'Rol anon no tiene permiso SELECT en menu_categories'
);
SELECT throws_ok(
    $$ SELECT * FROM public.products $$,
    '42501',
    'Rol anon no tiene permiso SELECT en products'
);
SELECT throws_ok(
    $$ SELECT * FROM public.product_variants $$,
    '42501',
    'Rol anon no tiene permiso SELECT en product_variants'
);

-- ------------------------------------------------------------------------------
-- 4. FIXTURES LOCALES Y AISLAMIENTO MULTI-TENANT
-- ------------------------------------------------------------------------------
SET LOCAL ROLE postgres;
SET LOCAL search_path = public, extensions;

-- Insertar cuentas en auth.users para pruebas si no existen
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES
    ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000010', 'authenticated', 'authenticated', 'admin@huarique.pe', 'hash', now(), '{"provider":"email"}', '{"staff_role":"admin"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000020', 'authenticated', 'authenticated', 'waiter@huarique.pe', 'hash', now(), '{"provider":"email"}', '{"staff_role":"waiter"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000030', 'authenticated', 'authenticated', 'cashier@huarique.pe', 'hash', now(), '{"provider":"email"}', '{"staff_role":"cashier"}', now(), now()),
    ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000040', 'authenticated', 'authenticated', 'printer@huarique.pe', 'hash', now(), '{"provider":"email"}', '{"staff_role":"printer_agent"}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Insertar perfiles en public.profiles
INSERT INTO public.profiles (
    id, restaurant_id, user_id, first_name, last_name, staff_code, staff_role, active
) VALUES
    ('00000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'Rosa', 'Morales', '1001', 'admin', true),
    ('00000000-0000-0000-0000-000000000120', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000020', 'Carlos', 'Sánchez', '2001', 'waiter', true),
    ('00000000-0000-0000-0000-000000000130', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000030', 'Elena', 'Flores', '3001', 'cashier', true),
    ('00000000-0000-0000-0000-000000000140', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000040', 'Agente', 'Impresión', '4001', 'printer_agent', true)
ON CONFLICT (user_id) DO NOTHING;

-- Simular usuario Administrador (Rosa Morales)
SET LOCAL ROLE authenticated;
SET LOCAL search_path = public, extensions;
SET LOCAL "request.jwt.claims" = '{"sub": "00000000-0000-0000-0000-000000000010", "role": "authenticated"}';

SELECT results_eq(
    $$ SELECT count(*)::integer FROM public.profiles $$,
    ARRAY[4],
    'Administrador debe ver los 4 perfiles de su restaurante'
);

SELECT results_eq(
    $$ SELECT count(*)::integer FROM public.dining_rooms $$,
    ARRAY[3],
    'Debe ver exactamente los 3 salones del restaurante'
);

SELECT results_eq(
    $$ SELECT count(*)::integer FROM public.restaurant_tables $$,
    ARRAY[80],
    'Debe ver exactamente las 80 mesas configuradas'
);

SELECT results_eq(
    $$ SELECT count(*)::integer FROM public.menu_categories $$,
    ARRAY[9],
    'Debe ver las 9 categorías oficiales'
);

-- Simular usuario Mozo (Carlos Sánchez)
SET LOCAL ROLE authenticated;
SET LOCAL search_path = public, extensions;
SET LOCAL "request.jwt.claims" = '{"sub": "00000000-0000-0000-0000-000000000020", "role": "authenticated"}';

SELECT results_eq(
    $$ SELECT count(*)::integer FROM public.profiles $$,
    ARRAY[1],
    'Mozo solo debe ver su propio perfil en public.profiles'
);

-- ------------------------------------------------------------------------------
-- 5. CARTA Y VARIANTES: RLS DIFERENCIADO (Admin vs Operativo)
-- ------------------------------------------------------------------------------
-- El mozo no debe ver variantes con price_needs_validation = true ni is_orderable = false
SELECT is_empty(
    $$
    SELECT *
    FROM public.product_variants
    WHERE price_needs_validation = true
       OR is_orderable = false;
    $$,
    'Mozo no debe recibir variantes que requieran validación o no sean ordenables'
);

-- El administrador sí debe verlas todas
SET LOCAL ROLE authenticated;
SET LOCAL search_path = public, extensions;
SET LOCAL "request.jwt.claims" = '{"sub": "00000000-0000-0000-0000-000000000010", "role": "authenticated"}';

SELECT isnt_empty(
    $$
    SELECT *
    FROM public.product_variants
    WHERE price_needs_validation = true;
    $$,
    'Administrador debe poder ver las variantes marcadas como VALIDAR'
);

-- ------------------------------------------------------------------------------
-- 6. ZERO-STALE-TRUST: USUARIOS DESACTIVADOS OBTIENEN 0 FILAS
-- ------------------------------------------------------------------------------
-- Desactivar temporalmente al mozo
SET LOCAL ROLE postgres;
SET LOCAL search_path = public, extensions;
UPDATE public.profiles
SET active = false
WHERE user_id = '00000000-0000-0000-0000-000000000020';

-- Intentar leer como mozo desactivado
SET LOCAL ROLE authenticated;
SET LOCAL search_path = public, extensions;
SET LOCAL "request.jwt.claims" = '{"sub": "00000000-0000-0000-0000-000000000020", "role": "authenticated"}';

SELECT is_empty(
    $$ SELECT * FROM public.profiles $$,
    'Mozo inactivo no debe ver ninguna fila en profiles (ni siquiera la propia)'
);
SELECT is_empty(
    $$ SELECT * FROM public.menu_categories $$,
    'Mozo inactivo no debe ver categorías'
);
SELECT is_empty(
    $$ SELECT * FROM public.products $$,
    'Mozo inactivo no debe ver productos'
);

-- Restaurar mozo activo
SET LOCAL ROLE postgres;
SET LOCAL search_path = public, extensions;
UPDATE public.profiles
SET active = true
WHERE user_id = '00000000-0000-0000-0000-000000000020';

-- ------------------------------------------------------------------------------
-- 7. RESTRICCIONES CHECK Y REGLAS DE NEGOCIO (VALIDAR, Precios, etc.)
-- SQLSTATE 23514 = check_violation
-- ------------------------------------------------------------------------------
SET LOCAL ROLE postgres;
SET LOCAL search_path = public, extensions;

-- Intento de insertar variante ordenable con price_needs_validation = true (debe fallar)
SELECT throws_ok(
    $$
    INSERT INTO public.product_variants (
        restaurant_id, product_id, variant_name, price, is_orderable, price_needs_validation
    ) VALUES (
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0100-000000000001',
        'Prueba Ilegal',
        25.00,
        true,
        true
    );
    $$,
    '23514',
    'Variante no puede ser is_orderable=true y price_needs_validation=true simultáneamente'
);

-- Intento de insertar variante con precio <= 0 y is_orderable = true (debe fallar)
SELECT throws_ok(
    $$
    INSERT INTO public.product_variants (
        restaurant_id, product_id, variant_name, price, is_orderable, price_needs_validation
    ) VALUES (
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0100-000000000001',
        'Prueba Gratis',
        0.00,
        true,
        false
    );
    $$,
    '23514',
    'Variante ordenable no puede tener precio 0'
);

-- ------------------------------------------------------------------------------
-- 8. TABLAS INMUTABLES (APPEND-ONLY TRIGGERS)
-- SQLSTATE 23001 = restrict_violation (ERRCODE usado en el trigger)
-- ------------------------------------------------------------------------------
-- Insertar movimiento de prueba
INSERT INTO public.inventory_movements (
    id, restaurant_id, ingredient_id, movement_type, quantity, notes
) VALUES (
    '00000000-0000-0000-9999-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0300-000000000001',
    'initial_load',
    10.000,
    'Carga inicial test'
);

-- Intento de UPDATE en inventory_movements (debe fallar)
SELECT throws_ok(
    $$
    UPDATE public.inventory_movements
    SET quantity = 20.000
    WHERE id = '00000000-0000-0000-9999-000000000001';
    $$,
    '23001',
    'UPDATE en inventory_movements debe ser rechazado por trigger append-only'
);

-- Intento de DELETE en inventory_movements (debe fallar)
SELECT throws_ok(
    $$
    DELETE FROM public.inventory_movements
    WHERE id = '00000000-0000-0000-9999-000000000001';
    $$,
    '23001',
    'DELETE en inventory_movements debe ser rechazado por trigger append-only'
);

-- ------------------------------------------------------------------------------
-- 9. RPCs ADMINISTRATIVAS DE CARTA Y CONFIRMACIÓN DE PRECIO
-- ------------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SET LOCAL search_path = public, extensions;
SET LOCAL "request.jwt.claims" = '{"sub": "00000000-0000-0000-0000-000000000010", "role": "authenticated"}';

-- Confirmar precio de la variante 'Fuente' de Caballa saltpresa (era VALIDAR S/ 100)
SELECT lives_ok(
    $$
    SELECT public.admin_confirm_validated_price('00000000-0000-0000-0200-000000000018', 110.00);
    $$,
    'Admin debe poder confirmar precio VALIDAR'
);

-- Verificar que se actualizó a S/ 110, price_needs_validation = false y is_orderable = true
SELECT results_eq(
    $$
    SELECT price, price_needs_validation, is_orderable
    FROM public.product_variants
    WHERE id = '00000000-0000-0000-0200-000000000018';
    $$,
    $$ VALUES (110.00::numeric(12,2), false, true) $$,
    'Variante confirmada debe tener nuevo precio y ser ordenable'
);

-- Verificar que authenticated no puede leer directamente audit_logs
-- SQLSTATE 42501 = permission denied
SELECT throws_ok(
    $$ SELECT * FROM public.audit_logs $$,
    '42501',
    'Rol authenticated no debe tener permiso SELECT en audit_logs en Fase 2'
);

-- Como postgres, verificar que la acción administrativa se registró en audit_logs
SET LOCAL ROLE postgres;
SET LOCAL search_path = public, extensions;

SELECT results_eq(
    $$
    SELECT action
    FROM public.audit_logs
    WHERE record_id = '00000000-0000-0000-0200-000000000018'
    ORDER BY created_at DESC
    LIMIT 1;
    $$,
    ARRAY['CONFIRM_VALIDATED_PRICE'],
    'La acción administrativa debe registrarse en audit_logs'
);

-- Mozo intentando ejecutar RPC administrativa (debe fallar)
-- SQLSTATE 42501 = insufficient_privilege (ERRCODE en las RPCs admin)
SET LOCAL ROLE authenticated;
SET LOCAL search_path = public, extensions;
SET LOCAL "request.jwt.claims" = '{"sub": "00000000-0000-0000-0000-000000000020", "role": "authenticated"}';

SELECT throws_ok(
    $$
    SELECT public.admin_create_category('Postres', 10);
    $$,
    '42501',
    'Mozo no debe poder ejecutar admin_create_category'
);

-- ------------------------------------------------------------------------------
-- 10. RE-EJECUCIÓN DE SEMILLA IDEMPOTENTE Y NO DESTRUCTIVA
-- ------------------------------------------------------------------------------
SET LOCAL ROLE postgres;
SET LOCAL search_path = public, extensions;

-- Simulación de re-ejecución de semilla con ON CONFLICT DO NOTHING sobre la fila modificada
INSERT INTO public.product_variants (
    id, restaurant_id, product_id, variant_name, price, price_needs_validation, is_orderable, is_active, display_order
) VALUES (
    '00000000-0000-0000-0200-000000000018',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0100-000000000012',
    'Fuente',
    100.00,
    true,
    false,
    true,
    2
) ON CONFLICT (id) DO NOTHING;

-- Verificar que el precio confirmado por Rosa (S/ 110.00) NO fue sobreescrito por la semilla
SELECT results_eq(
    $$
    SELECT price, price_needs_validation, is_orderable
    FROM public.product_variants
    WHERE id = '00000000-0000-0000-0200-000000000018';
    $$,
    $$ VALUES (110.00::numeric(12,2), false, true) $$,
    'Re-ejecutar seed.sql NO debe sobreescribir las modificaciones manuales'
);

SELECT * FROM finish();
ROLLBACK;
