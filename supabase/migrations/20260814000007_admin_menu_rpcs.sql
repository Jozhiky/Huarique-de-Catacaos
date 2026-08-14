-- ==============================================================================
-- Migración 7: Las 18 RPCs Administrativas de Carta
-- Proyecto: El Huarique de Catacaos — Sistema POS
-- ==============================================================================

-- Helper interno para registrar auditoría administrativa
CREATE OR REPLACE FUNCTION app_private.log_admin_action(
    p_restaurant_id uuid,
    p_action text,
    p_table text,
    p_record_id uuid,
    p_before jsonb,
    p_after jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_profile_id uuid;
BEGIN
    SELECT id INTO v_user_profile_id
    FROM public.profiles
    WHERE user_id = auth.uid() AND active = true;

    INSERT INTO public.audit_logs (
        restaurant_id, user_id, action, table_name, record_id, payload_before, payload_after
    ) VALUES (
        p_restaurant_id, v_user_profile_id, p_action, p_table, p_record_id, p_before, p_after
    );
END;
$$;
ALTER FUNCTION app_private.log_admin_action(uuid, text, text, uuid, jsonb, jsonb) OWNER TO postgres;

-- ------------------------------------------------------------------------------
-- 1. CATEGORÍAS (4 RPCs)
-- ------------------------------------------------------------------------------

-- 1.1 Crear Categoría
CREATE OR REPLACE FUNCTION public.admin_create_category(
    p_name text,
    p_display_order integer DEFAULT 0
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tenant_id uuid := app_private.get_auth_restaurant_id();
    v_new_id uuid;
BEGIN
    IF app_private.get_auth_staff_role() != 'admin' OR v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No autorizado: Se requiere rol de administrador activo' USING ERRCODE = 'insufficient_privilege';
    END IF;

    INSERT INTO public.menu_categories (restaurant_id, name, display_order)
    VALUES (v_tenant_id, TRIM(p_name), COALESCE(p_display_order, 0))
    RETURNING id INTO v_new_id;

    PERFORM app_private.log_admin_action(
        v_tenant_id, 'CREATE_CATEGORY', 'menu_categories', v_new_id, NULL, jsonb_build_object('name', p_name, 'display_order', p_display_order)
    );

    RETURN v_new_id;
END;
$$;

-- 1.2 Actualizar Categoría
CREATE OR REPLACE FUNCTION public.admin_update_category(
    p_category_id uuid,
    p_name text,
    p_display_order integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tenant_id uuid := app_private.get_auth_restaurant_id();
    v_old jsonb;
BEGIN
    IF app_private.get_auth_staff_role() != 'admin' OR v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No autorizado: Se requiere rol de administrador activo' USING ERRCODE = 'insufficient_privilege';
    END IF;

    SELECT to_jsonb(c) INTO v_old
    FROM public.menu_categories c
    WHERE id = p_category_id AND restaurant_id = v_tenant_id;

    IF v_old IS NULL THEN
        RAISE EXCEPTION 'Categoría no encontrada en este restaurante' USING ERRCODE = 'data_exception';
    END IF;

    UPDATE public.menu_categories
    SET name = TRIM(p_name), display_order = p_display_order, updated_at = now()
    WHERE id = p_category_id AND restaurant_id = v_tenant_id;

    PERFORM app_private.log_admin_action(
        v_tenant_id, 'UPDATE_CATEGORY', 'menu_categories', p_category_id, v_old, jsonb_build_object('name', p_name, 'display_order', p_display_order)
    );
END;
$$;

-- 1.3 Reordenar Categorías
CREATE OR REPLACE FUNCTION public.admin_reorder_categories(
    p_category_ids uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tenant_id uuid := app_private.get_auth_restaurant_id();
    v_id uuid;
    v_idx integer := 1;
BEGIN
    IF app_private.get_auth_staff_role() != 'admin' OR v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No autorizado: Se requiere rol de administrador activo' USING ERRCODE = 'insufficient_privilege';
    END IF;

    FOREACH v_id IN ARRAY p_category_ids LOOP
        UPDATE public.menu_categories
        SET display_order = v_idx, updated_at = now()
        WHERE id = v_id AND restaurant_id = v_tenant_id;
        v_idx := v_idx + 1;
    END LOOP;

    PERFORM app_private.log_admin_action(
        v_tenant_id, 'REORDER_CATEGORIES', 'menu_categories', v_tenant_id, NULL, jsonb_build_object('order', p_category_ids)
    );
END;
$$;

-- 1.4 Alternar Estado Activo de Categoría
CREATE OR REPLACE FUNCTION public.admin_toggle_category_active(
    p_category_id uuid,
    p_is_active boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tenant_id uuid := app_private.get_auth_restaurant_id();
    v_old jsonb;
BEGIN
    IF app_private.get_auth_staff_role() != 'admin' OR v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No autorizado: Se requiere rol de administrador activo' USING ERRCODE = 'insufficient_privilege';
    END IF;

    SELECT to_jsonb(c) INTO v_old
    FROM public.menu_categories c
    WHERE id = p_category_id AND restaurant_id = v_tenant_id;

    IF v_old IS NULL THEN
        RAISE EXCEPTION 'Categoría no encontrada' USING ERRCODE = 'data_exception';
    END IF;

    UPDATE public.menu_categories
    SET is_active = p_is_active, updated_at = now()
    WHERE id = p_category_id AND restaurant_id = v_tenant_id;

    PERFORM app_private.log_admin_action(
        v_tenant_id, 'TOGGLE_CATEGORY_ACTIVE', 'menu_categories', p_category_id, v_old, jsonb_build_object('is_active', p_is_active)
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. PRODUCTOS (6 RPCs)
-- ------------------------------------------------------------------------------

-- 2.1 Crear Producto
CREATE OR REPLACE FUNCTION public.admin_create_product(
    p_category_id uuid,
    p_name text,
    p_description text,
    p_display_order integer DEFAULT 0
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tenant_id uuid := app_private.get_auth_restaurant_id();
    v_new_id uuid;
BEGIN
    IF app_private.get_auth_staff_role() != 'admin' OR v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No autorizado' USING ERRCODE = 'insufficient_privilege';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.menu_categories WHERE id = p_category_id AND restaurant_id = v_tenant_id) THEN
        RAISE EXCEPTION 'Categoría no pertenece al restaurante' USING ERRCODE = 'data_exception';
    END IF;

    INSERT INTO public.products (restaurant_id, category_id, name, description, display_order)
    VALUES (v_tenant_id, p_category_id, TRIM(p_name), p_description, COALESCE(p_display_order, 0))
    RETURNING id INTO v_new_id;

    PERFORM app_private.log_admin_action(
        v_tenant_id, 'CREATE_PRODUCT', 'products', v_new_id, NULL, jsonb_build_object('name', p_name, 'category_id', p_category_id)
    );

    RETURN v_new_id;
END;
$$;

-- 2.2 Actualizar Producto
CREATE OR REPLACE FUNCTION public.admin_update_product(
    p_product_id uuid,
    p_name text,
    p_description text,
    p_display_order integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tenant_id uuid := app_private.get_auth_restaurant_id();
    v_old jsonb;
BEGIN
    IF app_private.get_auth_staff_role() != 'admin' OR v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No autorizado' USING ERRCODE = 'insufficient_privilege';
    END IF;

    SELECT to_jsonb(p) INTO v_old
    FROM public.products p
    WHERE id = p_product_id AND restaurant_id = v_tenant_id;

    IF v_old IS NULL THEN
        RAISE EXCEPTION 'Producto no encontrado' USING ERRCODE = 'data_exception';
    END IF;

    UPDATE public.products
    SET name = TRIM(p_name), description = p_description, display_order = p_display_order, updated_at = now()
    WHERE id = p_product_id AND restaurant_id = v_tenant_id;

    PERFORM app_private.log_admin_action(
        v_tenant_id, 'UPDATE_PRODUCT', 'products', p_product_id, v_old, jsonb_build_object('name', p_name, 'description', p_description, 'display_order', p_display_order)
    );
END;
$$;

-- 2.3 Cambiar Categoría de Producto
CREATE OR REPLACE FUNCTION public.admin_change_product_category(
    p_product_id uuid,
    p_new_category_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tenant_id uuid := app_private.get_auth_restaurant_id();
    v_old jsonb;
BEGIN
    IF app_private.get_auth_staff_role() != 'admin' OR v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No autorizado' USING ERRCODE = 'insufficient_privilege';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.menu_categories WHERE id = p_new_category_id AND restaurant_id = v_tenant_id) THEN
        RAISE EXCEPTION 'Nueva categoría no pertenece al restaurante' USING ERRCODE = 'data_exception';
    END IF;

    SELECT to_jsonb(p) INTO v_old
    FROM public.products p
    WHERE id = p_product_id AND restaurant_id = v_tenant_id;

    IF v_old IS NULL THEN
        RAISE EXCEPTION 'Producto no encontrado' USING ERRCODE = 'data_exception';
    END IF;

    UPDATE public.products
    SET category_id = p_new_category_id, updated_at = now()
    WHERE id = p_product_id AND restaurant_id = v_tenant_id;

    PERFORM app_private.log_admin_action(
        v_tenant_id, 'CHANGE_PRODUCT_CATEGORY', 'products', p_product_id, v_old, jsonb_build_object('new_category_id', p_new_category_id)
    );
END;
$$;

-- 2.4 Reordenar Productos en una Categoría
CREATE OR REPLACE FUNCTION public.admin_reorder_products(
    p_category_id uuid,
    p_product_ids uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tenant_id uuid := app_private.get_auth_restaurant_id();
    v_id uuid;
    v_idx integer := 1;
BEGIN
    IF app_private.get_auth_staff_role() != 'admin' OR v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No autorizado' USING ERRCODE = 'insufficient_privilege';
    END IF;

    FOREACH v_id IN ARRAY p_product_ids LOOP
        UPDATE public.products
        SET display_order = v_idx, updated_at = now()
        WHERE id = v_id AND category_id = p_category_id AND restaurant_id = v_tenant_id;
        v_idx := v_idx + 1;
    END LOOP;

    PERFORM app_private.log_admin_action(
        v_tenant_id, 'REORDER_PRODUCTS', 'products', p_category_id, NULL, jsonb_build_object('order', p_product_ids)
    );
END;
$$;

-- 2.5 Alternar Estado Activo de Producto
CREATE OR REPLACE FUNCTION public.admin_toggle_product_active(
    p_product_id uuid,
    p_is_active boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tenant_id uuid := app_private.get_auth_restaurant_id();
    v_old jsonb;
BEGIN
    IF app_private.get_auth_staff_role() != 'admin' OR v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No autorizado' USING ERRCODE = 'insufficient_privilege';
    END IF;

    SELECT to_jsonb(p) INTO v_old
    FROM public.products p
    WHERE id = p_product_id AND restaurant_id = v_tenant_id;

    IF v_old IS NULL THEN
        RAISE EXCEPTION 'Producto no encontrado' USING ERRCODE = 'data_exception';
    END IF;

    UPDATE public.products
    SET is_active = p_is_active, updated_at = now()
    WHERE id = p_product_id AND restaurant_id = v_tenant_id;

    PERFORM app_private.log_admin_action(
        v_tenant_id, 'TOGGLE_PRODUCT_ACTIVE', 'products', p_product_id, v_old, jsonb_build_object('is_active', p_is_active)
    );
END;
$$;

-- 2.6 Alternar Disponibilidad Manual Actual de Producto
CREATE OR REPLACE FUNCTION public.admin_toggle_product_availability(
    p_product_id uuid,
    p_is_available boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tenant_id uuid := app_private.get_auth_restaurant_id();
    v_old jsonb;
BEGIN
    IF app_private.get_auth_staff_role() != 'admin' OR v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No autorizado' USING ERRCODE = 'insufficient_privilege';
    END IF;

    SELECT to_jsonb(p) INTO v_old
    FROM public.products p
    WHERE id = p_product_id AND restaurant_id = v_tenant_id;

    IF v_old IS NULL THEN
        RAISE EXCEPTION 'Producto no encontrado' USING ERRCODE = 'data_exception';
    END IF;

    UPDATE public.products
    SET is_available = p_is_available, updated_at = now()
    WHERE id = p_product_id AND restaurant_id = v_tenant_id;

    PERFORM app_private.log_admin_action(
        v_tenant_id, 'TOGGLE_PRODUCT_AVAILABILITY', 'products', p_product_id, v_old, jsonb_build_object('is_available', p_is_available)
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. VARIANTES Y PRECIOS (7 RPCs)
-- ------------------------------------------------------------------------------

-- 3.1 Crear Variante de Producto
CREATE OR REPLACE FUNCTION public.admin_create_product_variant(
    p_product_id uuid,
    p_variant_name text,
    p_price numeric,
    p_display_order integer DEFAULT 0
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tenant_id uuid := app_private.get_auth_restaurant_id();
    v_new_id uuid;
BEGIN
    IF app_private.get_auth_staff_role() != 'admin' OR v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No autorizado' USING ERRCODE = 'insufficient_privilege';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.products WHERE id = p_product_id AND restaurant_id = v_tenant_id) THEN
        RAISE EXCEPTION 'Producto no pertenece al restaurante' USING ERRCODE = 'data_exception';
    END IF;

    IF p_price <= 0 THEN
        RAISE EXCEPTION 'El precio de una variante debe ser mayor a 0' USING ERRCODE = 'check_violation';
    END IF;

    INSERT INTO public.product_variants (
        restaurant_id, product_id, variant_name, price, is_orderable, price_needs_validation, display_order
    ) VALUES (
        v_tenant_id, p_product_id, TRIM(p_variant_name), p_price, true, false, COALESCE(p_display_order, 0)
    )
    RETURNING id INTO v_new_id;

    PERFORM app_private.log_admin_action(
        v_tenant_id, 'CREATE_VARIANT', 'product_variants', v_new_id, NULL, jsonb_build_object('product_id', p_product_id, 'variant_name', p_variant_name, 'price', p_price)
    );

    RETURN v_new_id;
END;
$$;

-- 3.2 Actualizar Variante de Producto
CREATE OR REPLACE FUNCTION public.admin_update_product_variant(
    p_variant_id uuid,
    p_variant_name text,
    p_display_order integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tenant_id uuid := app_private.get_auth_restaurant_id();
    v_old jsonb;
BEGIN
    IF app_private.get_auth_staff_role() != 'admin' OR v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No autorizado' USING ERRCODE = 'insufficient_privilege';
    END IF;

    SELECT to_jsonb(v) INTO v_old
    FROM public.product_variants v
    WHERE id = p_variant_id AND restaurant_id = v_tenant_id;

    IF v_old IS NULL THEN
        RAISE EXCEPTION 'Variante no encontrada' USING ERRCODE = 'data_exception';
    END IF;

    UPDATE public.product_variants
    SET variant_name = TRIM(p_variant_name), display_order = p_display_order, updated_at = now()
    WHERE id = p_variant_id AND restaurant_id = v_tenant_id;

    PERFORM app_private.log_admin_action(
        v_tenant_id, 'UPDATE_VARIANT', 'product_variants', p_variant_id, v_old, jsonb_build_object('variant_name', p_variant_name, 'display_order', p_display_order)
    );
END;
$$;

-- 3.3 Reordenar Variantes de un Producto
CREATE OR REPLACE FUNCTION public.admin_reorder_product_variants(
    p_product_id uuid,
    p_variant_ids uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tenant_id uuid := app_private.get_auth_restaurant_id();
    v_id uuid;
    v_idx integer := 1;
BEGIN
    IF app_private.get_auth_staff_role() != 'admin' OR v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No autorizado' USING ERRCODE = 'insufficient_privilege';
    END IF;

    FOREACH v_id IN ARRAY p_variant_ids LOOP
        UPDATE public.product_variants
        SET display_order = v_idx, updated_at = now()
        WHERE id = v_id AND product_id = p_product_id AND restaurant_id = v_tenant_id;
        v_idx := v_idx + 1;
    END LOOP;

    PERFORM app_private.log_admin_action(
        v_tenant_id, 'REORDER_VARIANTS', 'product_variants', p_product_id, NULL, jsonb_build_object('order', p_variant_ids)
    );
END;
$$;

-- 3.4 Alternar Estado Activo de Variante
CREATE OR REPLACE FUNCTION public.admin_toggle_variant_active(
    p_variant_id uuid,
    p_is_active boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tenant_id uuid := app_private.get_auth_restaurant_id();
    v_old jsonb;
BEGIN
    IF app_private.get_auth_staff_role() != 'admin' OR v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No autorizado' USING ERRCODE = 'insufficient_privilege';
    END IF;

    SELECT to_jsonb(v) INTO v_old
    FROM public.product_variants v
    WHERE id = p_variant_id AND restaurant_id = v_tenant_id;

    IF v_old IS NULL THEN
        RAISE EXCEPTION 'Variante no encontrada' USING ERRCODE = 'data_exception';
    END IF;

    UPDATE public.product_variants
    SET is_active = p_is_active, updated_at = now()
    WHERE id = p_variant_id AND restaurant_id = v_tenant_id;

    PERFORM app_private.log_admin_action(
        v_tenant_id, 'TOGGLE_VARIANT_ACTIVE', 'product_variants', p_variant_id, v_old, jsonb_build_object('is_active', p_is_active)
    );
END;
$$;

-- 3.5 Alternar Ordenabilidad de Variante
CREATE OR REPLACE FUNCTION public.admin_toggle_variant_orderable(
    p_variant_id uuid,
    p_is_orderable boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tenant_id uuid := app_private.get_auth_restaurant_id();
    v_variant public.product_variants%ROWTYPE;
BEGIN
    IF app_private.get_auth_staff_role() != 'admin' OR v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No autorizado' USING ERRCODE = 'insufficient_privilege';
    END IF;

    SELECT * INTO v_variant
    FROM public.product_variants
    WHERE id = p_variant_id AND restaurant_id = v_tenant_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Variante no encontrada' USING ERRCODE = 'data_exception';
    END IF;

    IF p_is_orderable AND (v_variant.price_needs_validation OR v_variant.price <= 0) THEN
        RAISE EXCEPTION 'No se puede habilitar una variante con precio pendiente de validación o menor igual a cero' USING ERRCODE = 'check_violation';
    END IF;

    UPDATE public.product_variants
    SET is_orderable = p_is_orderable, updated_at = now()
    WHERE id = p_variant_id AND restaurant_id = v_tenant_id;

    PERFORM app_private.log_admin_action(
        v_tenant_id, 'TOGGLE_VARIANT_ORDERABLE', 'product_variants', p_variant_id, to_jsonb(v_variant), jsonb_build_object('is_orderable', p_is_orderable)
    );
END;
$$;

-- 3.6 Actualizar Precio de Variante
CREATE OR REPLACE FUNCTION public.admin_update_variant_price(
    p_variant_id uuid,
    p_new_price numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tenant_id uuid := app_private.get_auth_restaurant_id();
    v_old jsonb;
BEGIN
    IF app_private.get_auth_staff_role() != 'admin' OR v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No autorizado' USING ERRCODE = 'insufficient_privilege';
    END IF;

    IF p_new_price <= 0 THEN
        RAISE EXCEPTION 'El precio debe ser mayor a 0' USING ERRCODE = 'check_violation';
    END IF;

    SELECT to_jsonb(v) INTO v_old
    FROM public.product_variants v
    WHERE id = p_variant_id AND restaurant_id = v_tenant_id;

    IF v_old IS NULL THEN
        RAISE EXCEPTION 'Variante no encontrada' USING ERRCODE = 'data_exception';
    END IF;

    UPDATE public.product_variants
    SET price = p_new_price, updated_at = now()
    WHERE id = p_variant_id AND restaurant_id = v_tenant_id;

    PERFORM app_private.log_admin_action(
        v_tenant_id, 'UPDATE_VARIANT_PRICE', 'product_variants', p_variant_id, v_old, jsonb_build_object('price', p_new_price)
    );
END;
$$;

-- 3.7 Confirmar Precio Marcado como VALIDAR
CREATE OR REPLACE FUNCTION public.admin_confirm_validated_price(
    p_variant_id uuid,
    p_confirmed_price numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tenant_id uuid := app_private.get_auth_restaurant_id();
    v_old jsonb;
BEGIN
    IF app_private.get_auth_staff_role() != 'admin' OR v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No autorizado: Se requiere rol de administrador activo' USING ERRCODE = 'insufficient_privilege';
    END IF;

    IF p_confirmed_price <= 0 THEN
        RAISE EXCEPTION 'El precio confirmado debe ser estrictamente mayor a 0' USING ERRCODE = 'check_violation';
    END IF;

    SELECT to_jsonb(v) INTO v_old
    FROM public.product_variants v
    WHERE id = p_variant_id AND restaurant_id = v_tenant_id;

    IF v_old IS NULL THEN
        RAISE EXCEPTION 'Variante no encontrada en este restaurante' USING ERRCODE = 'data_exception';
    END IF;

    UPDATE public.product_variants
    SET price = p_confirmed_price,
        price_needs_validation = false,
        is_orderable = true,
        updated_at = now()
    WHERE id = p_variant_id AND restaurant_id = v_tenant_id;

    PERFORM app_private.log_admin_action(
        v_tenant_id, 'CONFIRM_VALIDATED_PRICE', 'product_variants', p_variant_id, v_old,
        jsonb_build_object('confirmed_price', p_confirmed_price, 'price_needs_validation', false, 'is_orderable', true)
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- 4. DISPONIBILIDAD POR DÍAS (1 RPC)
-- ------------------------------------------------------------------------------

-- 4.1 Configurar Reglas de Disponibilidad Semanal
CREATE OR REPLACE FUNCTION public.admin_set_product_availability_rules(
    p_product_id uuid,
    p_days integer[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tenant_id uuid := app_private.get_auth_restaurant_id();
    v_day integer;
BEGIN
    IF app_private.get_auth_staff_role() != 'admin' OR v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No autorizado' USING ERRCODE = 'insufficient_privilege';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.products WHERE id = p_product_id AND restaurant_id = v_tenant_id) THEN
        RAISE EXCEPTION 'Producto no pertenece al restaurante' USING ERRCODE = 'data_exception';
    END IF;

    -- Validar rango de días (0 = Domingo .. 6 = Sábado)
    IF p_days IS NOT NULL THEN
        FOREACH v_day IN ARRAY p_days LOOP
            IF v_day < 0 OR v_day > 6 THEN
                RAISE EXCEPTION 'Día de la semana inválido: % (debe ser entre 0 y 6)', v_day USING ERRCODE = 'check_violation';
            END IF;
        END LOOP;
    END IF;

    -- Eliminar reglas anteriores
    DELETE FROM public.product_availability_rules
    WHERE product_id = p_product_id AND restaurant_id = v_tenant_id;

    -- Insertar nuevas reglas
    IF p_days IS NOT NULL AND array_length(p_days, 1) > 0 THEN
        FOREACH v_day IN ARRAY p_days LOOP
            INSERT INTO public.product_availability_rules (product_id, day_of_week, restaurant_id)
            VALUES (p_product_id, v_day, v_tenant_id)
            ON CONFLICT (product_id, day_of_week) DO NOTHING;
        END LOOP;
    END IF;

    PERFORM app_private.log_admin_action(
        v_tenant_id, 'SET_AVAILABILITY_RULES', 'product_availability_rules', p_product_id, NULL, jsonb_build_object('days', p_days)
    );
END;
$$;

-- ------------------------------------------------------------------------------
-- Concesión de Permisos de Ejecución para las 18 RPCs a 'authenticated'
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    r text;
    admin_rpcs text[] := ARRAY[
        'admin_create_category(text, integer)',
        'admin_update_category(uuid, text, integer)',
        'admin_reorder_categories(uuid[])',
        'admin_toggle_category_active(uuid, boolean)',
        'admin_create_product(uuid, text, text, integer)',
        'admin_update_product(uuid, text, text, integer)',
        'admin_change_product_category(uuid, uuid)',
        'admin_reorder_products(uuid, uuid[])',
        'admin_toggle_product_active(uuid, boolean)',
        'admin_toggle_product_availability(uuid, boolean)',
        'admin_create_product_variant(uuid, text, numeric, integer)',
        'admin_update_product_variant(uuid, text, integer)',
        'admin_reorder_product_variants(uuid, uuid[])',
        'admin_toggle_variant_active(uuid, boolean)',
        'admin_toggle_variant_orderable(uuid, boolean)',
        'admin_update_variant_price(uuid, numeric)',
        'admin_confirm_validated_price(uuid, numeric)',
        'admin_set_product_availability_rules(uuid, integer[])'
    ];
BEGIN
    FOREACH r IN ARRAY admin_rpcs LOOP
        EXECUTE format('ALTER FUNCTION public.%s OWNER TO postgres;', r);
        EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon;', r);
        EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated;', r);
    END LOOP;
END $$;
