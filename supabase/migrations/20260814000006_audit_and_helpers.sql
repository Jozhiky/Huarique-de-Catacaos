-- ==============================================================================
-- Migración 6: Auditoría, Triggers Append-Only y Helpers de Autorización en app_private
-- Proyecto: El Huarique de Catacaos — Sistema POS
-- ==============================================================================

-- 1. Tabla de Auditoría Inmutable
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    user_id uuid NOT NULL,
    action text NOT NULL,
    table_name text NOT NULL,
    record_id uuid NOT NULL,
    payload_before jsonb,
    payload_after jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (restaurant_id, user_id)
        REFERENCES public.profiles(restaurant_id, id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs (restaurant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON public.audit_logs (restaurant_id, table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (restaurant_id, created_at DESC);

-- 2. Función y Triggers para Tablas Inmutables (Append-Only)
CREATE OR REPLACE FUNCTION app_private.reject_update_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RAISE EXCEPTION 'Operación % no permitida en tabla inmutable %', TG_OP, TG_TABLE_NAME
        USING ERRCODE = 'restrict_violation';
END;
$$;

ALTER FUNCTION app_private.reject_update_delete() OWNER TO postgres;

DROP TRIGGER IF EXISTS trg_append_only_inventory_movements ON public.inventory_movements;
CREATE TRIGGER trg_append_only_inventory_movements
    BEFORE UPDATE OR DELETE ON public.inventory_movements
    FOR EACH ROW
    EXECUTE FUNCTION app_private.reject_update_delete();

DROP TRIGGER IF EXISTS trg_append_only_audit_logs ON public.audit_logs;
CREATE TRIGGER trg_append_only_audit_logs
    BEFORE UPDATE OR DELETE ON public.audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION app_private.reject_update_delete();

-- 3. Función Genérica para actualizar updated_at
CREATE OR REPLACE FUNCTION app_private.update_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

ALTER FUNCTION app_private.update_timestamp() OWNER TO postgres;

-- Aplicar trigger updated_at en tablas modificables
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'restaurants', 'profiles', 'dining_rooms', 'restaurant_tables', 'shifts',
        'menu_categories', 'products', 'product_variants', 'modifier_groups',
        'modifiers', 'ingredients', 'suppliers', 'purchases', 'orders',
        'printers', 'printer_agents', 'print_jobs'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_updated_at_%I ON public.%I;', t, t);
        EXECUTE format('CREATE TRIGGER trg_updated_at_%I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION app_private.update_timestamp();', t, t);
    END LOOP;
END $$;

-- 4. Funciones Helper de Autorización (Zero-Stale-Trust)
CREATE OR REPLACE FUNCTION app_private.get_auth_restaurant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT p.restaurant_id
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.active = true;
$$;

ALTER FUNCTION app_private.get_auth_restaurant_id() OWNER TO postgres;
REVOKE ALL ON FUNCTION app_private.get_auth_restaurant_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION app_private.get_auth_restaurant_id() TO authenticated;

CREATE OR REPLACE FUNCTION app_private.get_auth_staff_role()
RETURNS public.staff_role_enum
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT p.staff_role
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.active = true;
$$;

ALTER FUNCTION app_private.get_auth_staff_role() OWNER TO postgres;
REVOKE ALL ON FUNCTION app_private.get_auth_staff_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION app_private.get_auth_staff_role() TO authenticated;

CREATE OR REPLACE FUNCTION app_private.is_active_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.user_id = auth.uid()
          AND p.active = true
    );
$$;

ALTER FUNCTION app_private.is_active_staff() OWNER TO postgres;
REVOKE ALL ON FUNCTION app_private.is_active_staff() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION app_private.is_active_staff() TO authenticated;
