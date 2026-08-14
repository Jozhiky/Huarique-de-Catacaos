-- ==============================================================================
-- Migración 3: Catálogo de Carta, Variantes, Modificadores y Reglas de Disponibilidad
-- Proyecto: El Huarique de Catacaos — Sistema POS
-- ==============================================================================

-- 1. Categorías del Menú
CREATE TABLE IF NOT EXISTS public.menu_categories (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    name text NOT NULL,
    description text,
    display_order integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_menu_categories_restaurant_id UNIQUE (restaurant_id, id),
    CONSTRAINT uq_menu_categories_restaurant_name UNIQUE (restaurant_id, name),
    CONSTRAINT chk_menu_categories_display_order CHECK (display_order >= 0)
);

-- 2. Platos y Productos Principales
CREATE TABLE IF NOT EXISTS public.products (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    category_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    is_active boolean NOT NULL DEFAULT true,
    is_available boolean NOT NULL DEFAULT true,
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_products_restaurant_id UNIQUE (restaurant_id, id),
    CONSTRAINT uq_products_category_name UNIQUE (category_id, name),
    CONSTRAINT fk_products_category FOREIGN KEY (restaurant_id, category_id)
        REFERENCES public.menu_categories(restaurant_id, id) ON DELETE RESTRICT,
    CONSTRAINT chk_products_display_order CHECK (display_order >= 0)
);

-- 3. Variantes de Producto (Presentaciones y Precios)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    product_id uuid NOT NULL,
    variant_name text NOT NULL,
    price numeric(12,2) NOT NULL,
    price_needs_validation boolean NOT NULL DEFAULT false,
    is_orderable boolean NOT NULL DEFAULT true,
    is_active boolean NOT NULL DEFAULT true,
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_product_variants_restaurant_id UNIQUE (restaurant_id, id),
    CONSTRAINT uq_product_variants_product_variant UNIQUE (product_id, variant_name),
    CONSTRAINT fk_product_variants_product FOREIGN KEY (restaurant_id, product_id)
        REFERENCES public.products(restaurant_id, id) ON DELETE RESTRICT,
    CONSTRAINT chk_variant_price_positive CHECK (price >= 0),
    CONSTRAINT chk_variant_price_validation CHECK (NOT price_needs_validation OR NOT is_orderable),
    CONSTRAINT chk_variant_orderable_price CHECK (NOT is_orderable OR price > 0),
    CONSTRAINT chk_variant_display_order CHECK (display_order >= 0)
);

-- 4. Reglas de Disponibilidad por Día de la Semana
CREATE TABLE IF NOT EXISTS public.product_availability_rules (
    product_id uuid NOT NULL,
    day_of_week integer NOT NULL,
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (product_id, day_of_week),
    CONSTRAINT fk_product_avail_product FOREIGN KEY (restaurant_id, product_id)
        REFERENCES public.products(restaurant_id, id) ON DELETE CASCADE,
    CONSTRAINT chk_day_of_week_range CHECK (day_of_week BETWEEN 0 AND 6)
);

-- 5. Grupos de Modificadores (Acompañamientos, Extras, Opciones)
CREATE TABLE IF NOT EXISTS public.modifier_groups (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    name text NOT NULL,
    min_selectable integer NOT NULL DEFAULT 0,
    max_selectable integer NOT NULL DEFAULT 1,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_modifier_groups_restaurant_id UNIQUE (restaurant_id, id),
    CONSTRAINT uq_modifier_groups_restaurant_name UNIQUE (restaurant_id, name),
    CONSTRAINT chk_modifier_groups_min CHECK (min_selectable >= 0),
    CONSTRAINT chk_modifier_groups_max CHECK (max_selectable >= min_selectable)
);

-- 6. Modificadores Específicos
CREATE TABLE IF NOT EXISTS public.modifiers (
    id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    group_id uuid NOT NULL,
    name text NOT NULL,
    price_delta numeric(12,2) NOT NULL DEFAULT 0.00,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_modifiers_restaurant_id UNIQUE (restaurant_id, id),
    CONSTRAINT uq_modifiers_group_name UNIQUE (group_id, name),
    CONSTRAINT fk_modifiers_group FOREIGN KEY (restaurant_id, group_id)
        REFERENCES public.modifier_groups(restaurant_id, id) ON DELETE RESTRICT,
    CONSTRAINT chk_modifier_price_delta CHECK (price_delta >= 0)
);

-- 7. Relación Producto <-> Grupos de Modificadores
CREATE TABLE IF NOT EXISTS public.product_modifier_groups (
    product_id uuid NOT NULL,
    group_id uuid NOT NULL,
    restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (product_id, group_id),
    CONSTRAINT fk_product_modifier_product FOREIGN KEY (restaurant_id, product_id)
        REFERENCES public.products(restaurant_id, id) ON DELETE CASCADE,
    CONSTRAINT fk_product_modifier_group FOREIGN KEY (restaurant_id, group_id)
        REFERENCES public.modifier_groups(restaurant_id, id) ON DELETE CASCADE
);

-- 8. Índices para consultas y claves foráneas
CREATE INDEX IF NOT EXISTS idx_menu_categories_restaurant ON public.menu_categories (restaurant_id, display_order);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (restaurant_id, category_id);
CREATE INDEX IF NOT EXISTS idx_products_active_avail ON public.products (restaurant_id, is_active, is_available);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants (restaurant_id, product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_orderable ON public.product_variants (restaurant_id, is_active, is_orderable);
CREATE INDEX IF NOT EXISTS idx_modifiers_group ON public.modifiers (restaurant_id, group_id);
CREATE INDEX IF NOT EXISTS idx_product_modifier_groups_group ON public.product_modifier_groups (restaurant_id, group_id);
