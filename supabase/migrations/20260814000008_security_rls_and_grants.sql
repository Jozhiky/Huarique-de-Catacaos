-- ==============================================================================
-- Migración 8: Revocación Universal, Habilitación de RLS, Políticas y Concesión Mínima
-- Proyecto: El Huarique de Catacaos — Sistema POS (Fase 2)
-- ==============================================================================

-- 1. Revocación Universal Inicial de Permisos (Principio de Menor Privilegio)
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated, PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated, PUBLIC;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated, PUBLIC;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    REVOKE EXECUTE ON ROUTINES FROM PUBLIC, anon, authenticated;

-- 2. Habilitación y Forzado Estricto de Row Level Security (RLS) en TODAS las tablas públicas
DO $$
DECLARE
    t record;
BEGIN
    FOR t IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t.tablename);
        EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY;', t.tablename);
    END LOOP;
END $$;

-- 3. POLÍTICAS RLS ZERO-STALE-TRUST (Con initPlan mediante SELECT encapsulado)

-- 3.1 Restaurantes (Tenants)
CREATE POLICY "restaurants_select_active" ON public.restaurants
    FOR SELECT TO authenticated
    USING (
        id = (SELECT app_private.get_auth_restaurant_id())
        AND (SELECT app_private.is_active_staff())
    );

-- 3.2 Perfiles (Zero-Stale-Trust: si está inactivo devuelve 0 filas)
CREATE POLICY "profiles_read_own" ON public.profiles
    FOR SELECT TO authenticated
    USING (
        user_id = (SELECT auth.uid())
        AND active = true
    );

CREATE POLICY "profiles_admin_read_tenant" ON public.profiles
    FOR SELECT TO authenticated
    USING (
        restaurant_id = (SELECT app_private.get_auth_restaurant_id())
        AND (SELECT app_private.get_auth_staff_role()) = 'admin'
    );

-- 3.3 Salones y Mesas
CREATE POLICY "dining_rooms_select_tenant" ON public.dining_rooms
    FOR SELECT TO authenticated
    USING (
        restaurant_id = (SELECT app_private.get_auth_restaurant_id())
        AND (SELECT app_private.is_active_staff())
    );

CREATE POLICY "restaurant_tables_select_tenant" ON public.restaurant_tables
    FOR SELECT TO authenticated
    USING (
        restaurant_id = (SELECT app_private.get_auth_restaurant_id())
        AND (SELECT app_private.is_active_staff())
    );

CREATE POLICY "shifts_select_tenant" ON public.shifts
    FOR SELECT TO authenticated
    USING (
        restaurant_id = (SELECT app_private.get_auth_restaurant_id())
        AND (SELECT app_private.is_active_staff())
    );

-- 3.4 Categorías del Menú
CREATE POLICY "menu_categories_admin_all" ON public.menu_categories
    FOR SELECT TO authenticated
    USING (
        restaurant_id = (SELECT app_private.get_auth_restaurant_id())
        AND (SELECT app_private.get_auth_staff_role()) = 'admin'
    );

CREATE POLICY "menu_categories_staff_active" ON public.menu_categories
    FOR SELECT TO authenticated
    USING (
        restaurant_id = (SELECT app_private.get_auth_restaurant_id())
        AND (SELECT app_private.is_active_staff())
        AND is_active = true
    );

-- 3.5 Productos
CREATE POLICY "products_admin_all" ON public.products
    FOR SELECT TO authenticated
    USING (
        restaurant_id = (SELECT app_private.get_auth_restaurant_id())
        AND (SELECT app_private.get_auth_staff_role()) = 'admin'
    );

CREATE POLICY "products_staff_active" ON public.products
    FOR SELECT TO authenticated
    USING (
        restaurant_id = (SELECT app_private.get_auth_restaurant_id())
        AND (SELECT app_private.is_active_staff())
        AND is_active = true
    );

-- 3.6 Variantes de Producto
CREATE POLICY "product_variants_admin_all" ON public.product_variants
    FOR SELECT TO authenticated
    USING (
        restaurant_id = (SELECT app_private.get_auth_restaurant_id())
        AND (SELECT app_private.get_auth_staff_role()) = 'admin'
    );

CREATE POLICY "product_variants_staff_orderable" ON public.product_variants
    FOR SELECT TO authenticated
    USING (
        restaurant_id = (SELECT app_private.get_auth_restaurant_id())
        AND (SELECT app_private.is_active_staff())
        AND is_active = true
        AND is_orderable = true
        AND price_needs_validation = false
    );

-- 3.7 Reglas de Disponibilidad
CREATE POLICY "avail_rules_select_tenant" ON public.product_availability_rules
    FOR SELECT TO authenticated
    USING (
        restaurant_id = (SELECT app_private.get_auth_restaurant_id())
        AND (SELECT app_private.is_active_staff())
    );

-- 3.8 Modificadores
CREATE POLICY "modifier_groups_select_tenant" ON public.modifier_groups
    FOR SELECT TO authenticated
    USING (
        restaurant_id = (SELECT app_private.get_auth_restaurant_id())
        AND (SELECT app_private.is_active_staff())
    );

CREATE POLICY "modifiers_select_tenant" ON public.modifiers
    FOR SELECT TO authenticated
    USING (
        restaurant_id = (SELECT app_private.get_auth_restaurant_id())
        AND (SELECT app_private.is_active_staff())
    );

CREATE POLICY "product_modifier_groups_select_tenant" ON public.product_modifier_groups
    FOR SELECT TO authenticated
    USING (
        restaurant_id = (SELECT app_private.get_auth_restaurant_id())
        AND (SELECT app_private.is_active_staff())
    );

-- 4. CONCESIÓN EXPLÍCITA DE PERMISOS MÍNIMOS EN FASE 2
GRANT USAGE ON SCHEMA public TO authenticated;

-- Concesión de lectura SELECT únicamente en tablas del catálogo y estructura de Fase 2
GRANT SELECT ON public.restaurants TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.dining_rooms TO authenticated;
GRANT SELECT ON public.restaurant_tables TO authenticated;
GRANT SELECT ON public.shifts TO authenticated;
GRANT SELECT ON public.menu_categories TO authenticated;
GRANT SELECT ON public.products TO authenticated;
GRANT SELECT ON public.product_variants TO authenticated;
GRANT SELECT ON public.product_availability_rules TO authenticated;
GRANT SELECT ON public.modifier_groups TO authenticated;
GRANT SELECT ON public.modifiers TO authenticated;
GRANT SELECT ON public.product_modifier_groups TO authenticated;

-- NOTA DE HARDENING DE FASE 2:
-- Las tablas transaccionales y operativas (orders, order_revisions, order_items,
-- order_item_modifiers, payments, printers, printer_agents, print_jobs,
-- ingredients, recipe_items, suppliers, purchases, purchase_items,
-- inventory_movements, inventory_balances, audit_logs, idempotency_records)
-- NO reciben permisos SELECT en esta fase. Se concederán progresivamente en sus fases respectivas.
